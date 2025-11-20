const assert = require('assert');
const slackify = require('../lib/slackify');

const testCases = [
  {
    name: 'Headers',
    input: '# Header 1\n## Header 2',
    expected: '*Header 1*\n*Header 2*',
  },
  {
    name: 'Bold',
    input: '**Bold**',
    expected: '\u200B*Bold*\u200B',
  },
  {
    name: 'Italic',
    input: '_Italic_',
    expected: '\u200B_Italic_\u200B',
  },
  {
    name: 'Strike',
    input: '~~Strike~~',
    expected: '\u200B~Strike~\u200B',
  },
  {
    name: 'Link',
    input: '[Link](https://example.com)',
    expected: '<https://example.com|Link>',
  },
  {
    name: 'Code',
    input: '`code`',
    expected: '`code`',
  },
  {
    name: 'Code block',
    input: '```javascript\nconsole.log("hello");\n```',
    expected: '```\nconsole.log("hello");\n```',
  },
  {
    name: 'List',
    input: '* Item 1\n* Item 2',
    expected: '• Item 1\n• Item 2',
  },
];

console.log('Running tests...');

let passed = 0;
let failed = 0;

testCases.forEach(({ name, input, expected }) => {
  try {
    const actual = slackify(input).trim();
    assert.strictEqual(actual, expected.trim());
    console.log(`✅ ${name} passed`);
    passed++;
  } catch (error) {
    console.error(`❌ ${name} failed`);
    console.error(`   Input: ${JSON.stringify(input)}`);
    console.error(`   Expected: ${JSON.stringify(expected)}`);
    console.error(`   Actual:   ${JSON.stringify(error.actual)}`);
    failed++;
  }
});

if (failed > 0) {
  console.error(`\n${failed} tests failed.`);
  process.exit(1);
} else {
  console.log(`\nAll ${passed} tests passed!`);
}
