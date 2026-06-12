const fs = require('fs');
const path = require('path');

const transcriptPath = 'C:\\Users\\aksha\\.gemini\\antigravity\\brain\\b2286392-a454-41b9-8c27-7c46a4040108\\.system_generated\\logs\\transcript.jsonl';
const targetSteps = [27, 30, 32, 34, 37, 93, 103];

if (!fs.existsSync(transcriptPath)) {
  console.error(`Transcript not found at ${transcriptPath}`);
  process.exit(1);
}

const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');
const results = {};

lines.forEach((line, idx) => {
  if (!line.trim()) return;
  try {
    const obj = JSON.parse(line);
    if (targetSteps.includes(obj.step_index)) {
      results[obj.step_index] = obj.tool_calls || obj;
    }
  } catch (err) {
    // ignore parse errors
  }
});

fs.writeFileSync(
  path.join(__dirname, 'extracted_steps_direct.json'),
  JSON.stringify(results, null, 2),
  'utf8'
);
console.log("Steps extracted directly to extracted_steps_direct.json successfully.");
