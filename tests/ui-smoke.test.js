const test = require("node:test");
const assert = require("node:assert/strict");

// Read-only: checks the rendered public page without touching authentication or a database.
const base = process.env.UI_TEST_URL || "http://localhost:3100";
test("marketing renders a concise continuity story with evidence and an accessible source diagram", async () => {
  const response = await fetch(base);
  assert.equal(response.status, 200);
  const html = (await response.text()).split("<main>")[1]?.split("</main>")[0];
  assert.ok(html, "A semantic main landmark must render on the server");
  const sections = [
    "People leave.",
    "Turn scattered context into organizational memory.",
    "Know the gaps before they become incidents.",
    "Don’t ask people to document everything. Ask what matters.",
    "When the expert is gone, the answer is still there.",
    "Keep what makes",
  ];
  assert.equal(
    (html.match(/class="kv-section-heading"/g) || []).length,
    4,
    "Keep the narrative to four feature sections",
  );
  assert.ok(
    html.includes("Owner: Rahul Sharma"),
    "Verification context belongs beside the answer",
  );

  let previous = -1;
  for (const heading of sections) {
    const position = html.indexOf(heading);
    assert.ok(
      position > previous,
      `Missing or out-of-order narrative: ${heading}`,
    );
    previous = position;
  }
  assert.ok(
    html.includes('aria-pressed="true"'),
    "The graph must expose its selected source",
  );
  assert.ok(
    html.includes("prefers-reduced-motion") ||
      !html.includes('style="opacity:0"'),
    "Essential content must not start hidden",
  );
});
