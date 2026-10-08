const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const ts = require('typescript');

Module._extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  module._compile(code, filename);
};

const values = new Map();
global.window = {
  localStorage: {
    get length() { return values.size; },
    key: index => [...values.keys()][index] ?? null,
    getItem: key => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key),
  },
  dispatchEvent: () => {},
};
global.CustomEvent = class CustomEvent { constructor(type, options) { this.type = type; this.detail = options?.detail; } };

const store = require('../src/lib/demo-store.ts');
const { assistantPrompts } = require('../src/lib/assistant-prompts.ts');

test('saved prompts resolve current evidence without replacing existing memories', () => {
  store.resetDemo();
  const before = JSON.stringify(store.demoKnowledge());
  for (const prompt of assistantPrompts) {
    const response = store.demoAnswer(prompt.query);
    assert.ok(response.answer.length > 50);
    if (prompt.memoryId) {
      assert.equal(response.citations[0].id, prompt.memoryId);
      assert.ok(response.isSufficientEvidence);
    } else {
      assert.match(response.answer, /Payment Failure Recovery/);
      assert.equal(response.knowledgeGapDetected, true);
      assert.equal(response.confidence, 0);
    }
  }
  assert.equal(JSON.stringify(store.demoKnowledge()), before);
});

test('demo capture writes through to knowledge, reviews, and grounded answers', () => {
  store.resetDemo();
  const before = store.demoKnowledge().length;
  store.captureDemo('Inspect the Orion queue before restarting the worker.', 'Orion queue recovery', 'NOTES', 'Rahul Sharma');
  assert.equal(store.demoKnowledge().length, before + 1);
  assert.equal(store.demoReviews()[0].title, 'Orion queue recovery');
  assert.match(store.demoAnswer('How do I recover the Orion queue?').answer, /Inspect the Orion queue/);
  store.saveDemoReviews(store.demoReviews().slice(1));
  assert.notEqual(store.demoReviews()[0].title, 'Orion queue recovery');
  store.resetDemo();
  assert.equal(store.demoKnowledge().length, before);
});
