/// <reference types="node" />
import { compareMessages, type CompareOptions } from './icuArgs.ts';
import type { CreateRule, ESTree } from '@oxlint/plugins';
import { readFileSync } from 'node:fs';
import * as nodeModule from 'node:module';
import { dirname, isAbsolute, resolve } from 'node:path';
import { runInNewContext } from 'node:vm';

export type { CompareOptions } from './icuArgs.ts';

/** Kept structural so the published types don't depend on @oxlint/plugins. Fits oxlint's and ESLint's plugin types. */
export interface LintPlugin {
  meta: { name: string };
  rules: Record<string, { meta?: object; create(context: any): object }>;
}

function findImport(program: ESTree.Program, local: string) {
  for (const statement of program.body) {
    if (statement.type !== 'ImportDeclaration') continue;
    for (const specifier of statement.specifiers) {
      if (specifier.local.name !== local) continue;
      if (specifier.type === 'ImportDefaultSpecifier') return { from: statement.source.value, name: 'default' };
      if (specifier.type === 'ImportSpecifier') {
        const { imported } = specifier;
        return { from: statement.source.value, name: imported.type === 'Identifier' ? imported.name : String(imported.value) };
      }
    }
  }
  return undefined;
}

function resolveFile(from: string, filename: string) {
  if (!from.startsWith('.') && !isAbsolute(from)) return nodeModule.createRequire(filename).resolve(from);
  const path = resolve(dirname(filename), from);
  return /\.[cm]?[jt]s$/.test(path) ? path : `${path}.ts`;
}

function stripTypes(code: string) {
  const { stripTypeScriptTypes } = nodeModule;
  if (!stripTypeScriptTypes) throw new Error('reading a .ts dictionary needs Node 22.13 or later');
  // Still experimental in Node 26; silence its one-time ExperimentalWarning, which would show in every lint run.
  const { emitWarning } = process;
  process.emitWarning = () => undefined;
  try {
    return stripTypeScriptTypes(code);
  } finally {
    process.emitWarning = emitWarning;
  }
}

// Read on every run instead of import()/require(): rules are sync, and an editor's long-lived linter would keep a stale copy
// (require(esm) caches in the ESM loader, which require.cache can't clear).
// Only self-contained files work: `export default`/`export const` with no imports of their own.
function loadExports(file: string): Record<string, unknown> {
  let code = readFileSync(file, 'utf8');
  if (/\.[cm]?ts$/.test(file)) code = stripTypes(code);
  const exports: Record<string, unknown> = {};
  runInNewContext(
    code.replace(/^export default /m, '__exports.default = ').replace(/^export (const|let|var) (\w+)/gm, '$1 $2 = __exports.$2'),
    { __exports: exports },
  );
  return exports;
}

function stringValue(node: ESTree.Node) {
  if (node.type === 'Literal' && typeof node.value === 'string') return node.value;
  if (node.type === 'TemplateLiteral' && node.expressions.length === 0) return node.quasis[0]?.value.cooked ?? undefined;
  return undefined;
}

const matchingArgs: CreateRule = {
  meta: {
    type: 'problem',
    docs: { description: 'Translations must use the same ICU arguments, of the same kind, as the source dictionary' },
    schema: [{ type: 'object', properties: { selectOptions: { type: 'boolean' } }, additionalProperties: false }],
  },
  create(context) {
    const options = (context.options[0] ?? {}) as CompareOptions;

    const visit = (node: ESTree.Node, source: unknown) => {
      if (node.type === 'TSAsExpression') return visit(node.expression, source);

      const translation = stringValue(node);
      if (translation !== undefined) {
        if (typeof source !== 'string') return;
        for (const message of compareMessages(source, translation, options)) context.report({ node, message });
      } else if (node.type === 'ArrayExpression' && Array.isArray(source)) {
        node.elements.forEach((element, index) => element && visit(element, source[index]));
      } else if (node.type === 'ObjectExpression' && typeof source === 'object' && source) {
        for (const property of node.properties) {
          if (property.type !== 'Property') continue;
          const key =
            property.key.type === 'Identifier'
              ? property.key.name
              : property.key.type === 'Literal'
                ? String(property.key.value)
                : undefined;
          if (key !== undefined) visit(property.value, (source as Record<string, unknown>)[key]);
        }
      }
    };

    return {
      TSSatisfiesExpression(node) {
        const type = node.typeAnnotation;
        if (type.type !== 'TSTypeReference' || type.typeName.type !== 'Identifier' || type.typeName.name !== 'Dictionary') return;
        const query = type.typeArguments?.params[0];
        if (query?.type !== 'TSTypeQuery' || query.exprName.type !== 'Identifier') return;

        const binding = findImport(context.sourceCode.ast, query.exprName.name);
        if (!binding) return;

        let source: unknown;
        try {
          const exports = loadExports(resolveFile(binding.from, context.filename));
          if (!(binding.name in exports)) throw new Error(`no export "${binding.name}"`);
          source = exports[binding.name];
        } catch (error) {
          context.report({ node: query, message: `cannot load the source dictionary from "${binding.from}": ${(error as Error).message}` });
          return;
        }
        visit(node.expression, source);
      },
    };
  },
};

const plugin: LintPlugin = {
  meta: { name: 'schummar-translate' },
  rules: { 'matching-args': matchingArgs },
};

export default plugin;
