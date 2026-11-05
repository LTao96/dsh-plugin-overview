import assert from 'node:assert/strict';
import test from 'node:test';

import { isVisualPackage, normalizeEnabled, normalizeState } from '../index.js';

test('defaults keep automatic AI summaries off', () => {
  const state = normalizeState(null);
  assert.equal(state.settings.autoSummary, false);
  assert.deepEqual(state.notes, {});
  assert.deepEqual(state.groups, {});
  assert.deepEqual(state.groupOrder, []);
});

test('normalization keeps notes, groups and explicit opt-in', () => {
  const state = normalizeState({
    settings: { autoSummary: true },
    notes: {
      alpha: { text: 'one line', source: 'manual', version: '1.0.0' },
      beta: 'legacy string',
    },
    groups: { tools: ['alpha', 'alpha', 'missing'] },
    groupOrder: ['tools'],
  });
  assert.equal(state.settings.autoSummary, true);
  assert.equal(state.notes.alpha.text, 'one line');
  assert.equal(state.notes.alpha.source, 'manual');
  assert.equal(state.notes.beta.text, 'legacy string');
  assert.deepEqual(state.groups.tools, ['alpha', 'missing']);
  assert.deepEqual(state.groupOrder, ['tools']);
});

test('bundle disabled wins over stale enabled loader rows', () => {
  assert.equal(normalizeEnabled({ enabled: false }, [{ enabled: true }], undefined), false);
  assert.equal(normalizeEnabled({ enabled: true }, [{ enabled: false }], undefined), false);
  assert.equal(normalizeEnabled({ enabled: true }, [{ enabled: true }], undefined), true);
  assert.equal(normalizeEnabled(undefined, [], { enabled: false }), false);
});

test('visual detection does not depend on a fixed package list', () => {
  assert.equal(isVisualPackage('some-community-skin', {}), true);
  assert.equal(isVisualPackage('@scope/dsh-wallpaper-engine', {}), true);
  assert.equal(isVisualPackage('dsh-sync', {}), false);
  assert.equal(isVisualPackage('beauticode-dsh', {}), true);
});
