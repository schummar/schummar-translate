/// <reference types="node" />
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterAll, expect, test } from 'vite-plus/test';

// Runs the real oxlint CLI so that a change in oxlint's JS plugin API breaks this test.
const oxlint = resolve(__dirname, '../node_modules/.bin/oxlint');
const plugin = resolve(__dirname, '../src/lint/index.ts');
const dir = mkdtempSync(join(tmpdir(), 'schummar-translate-oxlint-'));
afterAll(() => rmSync(dir, { recursive: true, force: true }));

const source = `{
  greeting: 'Hello {name}',
  count: '{count, plural, one {# file} other {# files}}',
  type: '{type, select, trip {trip} other {receipt}}',
  nested: { by: 'by {author}' },
  list: ['{a}', \`{b}\`],
}`;

function translation(from: string, body: string, binding = 'en') {
  const imported = binding === 'en' ? 'en' : `{ ${binding} as en }`;
  return `import type { Dictionary } from 'schummar-translate';
import ${imported} from '${from}';
export default ${body} as const satisfies Dictionary<typeof en>;
`;
}

const good = `{
  greeting: 'Hallo {name}',
  count: '{count, plural, one {# Datei} other {# Dateien}}',
  type: '{type, select, trip {Reise} other {Beleg}}',
  nested: { by: 'von {author}' },
  list: ['{a}', '{b}'],
}`;
const misspelled = good.replace('{name}', '{nmae}');

const files: Record<string, string> = {
  'en.ts': `export default ${source} as const;\n`,
  'en.mjs': `export default ${source};\n`,
  'en.js': `export default ${source};\n`,
  'named.ts': `export const source = ${source} as const;\n`,
  'node_modules/dict-pkg/package.json': JSON.stringify({ name: 'dict-pkg', exports: './en.js' }),
  'node_modules/dict-pkg/en.js': `export default ${source};\n`,
  'good.ts': translation('./en', good),
  'bad.ts': translation(
    './en',
    `{
      greeting: 'Hallo',
      count: '{count} Dateien',
      type: '{type, select, Reise {Reise} other {Beleg}}',
      nested: { by: 'von {author} und {extra}' },
      list: ['{a}', '{b'],
    }`,
  ),
  'explicitTs.ts': translation('./en.ts', misspelled),
  'mjs.ts': translation('./en.mjs', misspelled),
  'js.ts': translation('./en.js', misspelled),
  'package.ts': translation('dict-pkg', misspelled),
  'namedExport.ts': translation('./named', misspelled, 'source'),
  'missingFile.ts': translation('./nothing', good),
};
for (const [file, content] of Object.entries(files)) {
  mkdirSync(join(dir, file, '..'), { recursive: true });
  writeFileSync(join(dir, file), content);
}

function lint(ruleOptions?: object) {
  const config = join(dir, 'oxlintrc.json');
  writeFileSync(
    config,
    JSON.stringify({
      categories: { correctness: 'off' },
      jsPlugins: [plugin],
      rules: { 'schummar-translate/matching-args': ruleOptions ? ['error', ruleOptions] : 'error' },
    }),
  );
  const { stdout, stderr } = spawnSync(oxlint, ['-c', config, '-f', 'json', dir], { encoding: 'utf8' });
  expect(stderr).not.toContain('Warning');
  const { diagnostics } = JSON.parse(stdout) as { diagnostics: { filename: string; message: string; code: string }[] };
  const result: Record<string, string[]> = {};
  for (const { filename, message, code } of diagnostics) {
    expect(code).toBe('schummar-translate(matching-args)');
    (result[filename.replace(/^.*[\\/]/, '')] ??= []).push(
      message.replace(/^(invalid ICU message|cannot load the source dictionary from "[^"]*"):[\s\S]*/, '$1'),
    );
  }
  return result;
}

test('reports each mismatch and resolves every kind of source import', () => {
  expect(lint()).toEqual({
    'bad.ts': [
      'missing argument {name}',
      '{count} is argument but plural in the source',
      '{type} is select (Reise, other) but select (other, trip) in the source',
      'unexpected argument {extra}',
      'invalid ICU message',
    ],
    'explicitTs.ts': ['missing argument {name}', 'unexpected argument {nmae}'],
    'mjs.ts': ['missing argument {name}', 'unexpected argument {nmae}'],
    'js.ts': ['missing argument {name}', 'unexpected argument {nmae}'],
    'package.ts': ['missing argument {name}', 'unexpected argument {nmae}'],
    'namedExport.ts': ['missing argument {name}', 'unexpected argument {nmae}'],
    'missingFile.ts': ['cannot load the source dictionary from "./nothing"'],
  });
});

test('selectOptions: false ignores differing select options', () => {
  expect(lint({ selectOptions: false })['bad.ts']).not.toContain('{type} is select (Reise, other) but select (other, trip) in the source');
  expect(lint({ selectOptions: false })['bad.ts']).toHaveLength(4);
});
