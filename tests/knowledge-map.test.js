const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const Module = require("node:module");
const ts = require("typescript");
Module._extensions[".ts"] = (module, filename) => {
  const code = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  module._compile(code, filename);
};
const { projectContext } = require("../src/lib/knowledge-map.ts");
const { offlineGraph } = require("../src/lib/offline-demo.ts");
test("project context keeps owner knowledge and the complete recovery chain", () => {
  assert.deepEqual(
    new Set(projectContext(offlineGraph, "demo-payment").map((n) => n.id)),
    new Set(offlineGraph.nodes.map((n) => n.id)),
  );
});
test("shared owners do not pull another project and its knowledge into the hierarchy", () => {
  const nodes = [
    ["p", "PROJECT"],
    ["other", "PROJECT"],
    ["owner", "EMPLOYEE"],
    ["k", "KNOWLEDGE"],
    ["foreign", "KNOWLEDGE"],
    ["source", "DOCUMENTATION"],
    ["problem", "PROBLEM"],
    ["solution", "SOLUTION"],
  ].map(([id, type]) => ({ id, type, label: id }));
  const edges = [
    ["p", "owner"],
    ["owner", "other"],
    ["p", "k"],
    ["owner", "foreign"],
    ["other", "foreign"],
    ["source", "k"],
    ["k", "problem"],
    ["problem", "solution"],
    ["solution", "problem"],
  ].map(([source, target], i) => ({ id: String(i), source, target }));
  assert.deepEqual(
    new Set(projectContext({ nodes, edges }, "p").map((n) => n.id)),
    new Set(["p", "owner", "k", "source", "problem", "solution"]),
  );
});
