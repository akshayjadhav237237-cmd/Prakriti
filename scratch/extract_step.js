const fs = require('fs');
const path = require('path');

const transcriptPath = 'C:\\Users\\aksha\\.gemini\\antigravity\\brain\\b2286392-a454-41b9-8c27-7c46a4040108\\.system_generated\\logs\\transcript.jsonl';
const targetSteps = process.argv.slice(2).map(Number);

if (!fs.existsSync(transcriptPath)) {
  console.error(`Transcript not found at ${transcriptPath}`);
  process.exit(1);
}

const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');

lines.forEach((line, idx) => {
  if (!line.trim()) return;
  try {
    const obj = JSON.parse(line);
    if (targetSteps.includes(obj.step_index)) {
      console.log(`=== STEP ${obj.step_index} ===`);
      console.log(JSON.stringify(obj.tool_calls || obj, null, 2));
      console.log('=======================\n');
    }
  } catch (err) {
    // ignore parse errors
  }
});
