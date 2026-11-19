import { compareMessages } from '../src/lint/icuArgs';
import { expect, test } from 'vite-plus/test';

test('accepts the same arguments in another order and wording', () => {
  expect(compareMessages('{a} and {b, number}', 'Mit {b, number} und {a}')).toEqual([]);
});

test('accepts different plural categories', () => {
  expect(
    compareMessages('{count, plural, one {# file} other {# files}}', '{count, plural, one {# Datei} few {# pliki} other {# Dateien}}'),
  ).toEqual([]);
});

test('reports missing and unexpected arguments', () => {
  expect(compareMessages('Logs of {jobId}', 'Logs von {jobid}')).toEqual(['missing argument {jobId}', 'unexpected argument {jobid}']);
});

test('reports a different kind of argument', () => {
  expect(compareMessages('{count, plural, other {# items}}', '{count} Posten')).toEqual(['{count} is argument but plural in the source']);
  expect(compareMessages('{day, date}', '{day, time}')).toEqual(['{day} is time but date in the source']);
  expect(compareMessages('<b>bold</b>', 'fett')).toEqual(['missing argument {b}']);
});

test('reports a select the source does not have, or with other options', () => {
  expect(compareMessages('Delete this {type}', '{type, select, trip {Diese Reise} other {Diesen Beleg}} löschen')).toEqual([
    '{type} is select (other, trip) but argument in the source',
  ]);
  expect(compareMessages('{type, select, trip {trip} other {receipt}}', '{type, select, Reise {Reise} other {Beleg}}')).toEqual([
    '{type} is select (Reise, other) but select (other, trip) in the source',
  ]);
});

test('ignores select options when selectOptions is false', () => {
  const options = { selectOptions: false };
  expect(compareMessages('{type, select, trip {trip} other {receipt}}', '{type, select, Reise {Reise} other {Beleg}}', options)).toEqual(
    [],
  );
  expect(compareMessages('{type, select, other {x}}', '{type}', options)).toEqual(['{type} is argument but select in the source']);
});

test('checks arguments nested in plural and select branches', () => {
  expect(compareMessages('{count, plural, other {# by {name}}}', '{count, plural, other {# Stück}}')).toEqual(['missing argument {name}']);
});

test('reports invalid ICU syntax in the translation, not in the source', () => {
  expect(compareMessages('{a}', '{a')).toEqual([expect.stringMatching(/^invalid ICU message/)]);
  expect(compareMessages('{a', 'anything')).toEqual([]);
});
