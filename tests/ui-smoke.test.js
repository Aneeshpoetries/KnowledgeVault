const test = require('node:test');
const assert = require('node:assert/strict');

// Read-only: checks the rendered public page without touching authentication or a database.
const base = process.env.UI_TEST_URL || 'http://localhost:3100';
test('marketing renders the complete continuity story in order without client JavaScript', async () => {
  const response = await fetch(base);
  assert.equal(response.status, 200);
  const html = (await response.text()).split('<main>')[1]?.split('</main>')[0];
  assert.ok(html, 'A semantic main landmark must render on the server');
  const sections = ['People leave.', 'Your company knows more than it can remember.', 'Turn scattered context into organizational memory.', 'Capture the context, not just the document.', 'Knowing what you know is only half the problem.', 'When one person becomes the system.', 'Don’t ask people to document everything. Ask what matters.', 'Before someone leaves, find what only they know.', 'Memory is only useful when you can trust it.', 'When the expert is gone, the answer is still there.', 'Make the organization less dependent on individual memory.', 'Built for the knowledge that matters.', 'Keep what makes'];
  let previous = -1;
  for (const heading of sections) {
    const position = html.indexOf(heading);
    assert.ok(position > previous, `Missing or out-of-order narrative: ${heading}`);
    previous = position;
  }
  assert.ok(html.includes('aria-pressed="true"'), 'The graph must expose its selected source');
  assert.ok(html.includes('prefers-reduced-motion') || !html.includes('style="opacity:0"'), 'Essential content must not start hidden');
});
