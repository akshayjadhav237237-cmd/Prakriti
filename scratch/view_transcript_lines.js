const fs = require('fs');
const path = require('path');

const transcriptPath = 'C:\\Users\\aksha\\.gemini\\antigravity\\brain\\b2286392-a454-41b9-8c27-7c46a4040108\\.system_generated\\logs\\transcript.jsonl';

if (!fs.existsSync(transcriptPath)) {
  console.error("Transcript not found.");
  process.exit(1);
}

const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');

const lineNumbers = [5, 6, 7, 10]; // 1-indexed line numbers
lineNumbers.forEach(ln => {
  const line = lines[ln - 1];
  if (!line) {
    console.log(`Line ${ln} is empty or out of bounds.`);
    return;
  }
  console.log(`=== Line ${ln} ===`);
  try {
    const obj = JSON.parse(line);
    console.log(`Step: ${obj.step_index}`);
    console.log(`Type: ${obj.type}`);
    console.log(`Source: ${obj.source}`);
    if (obj.tool_calls) {
      obj.tool_calls.forEach(tc => {
        console.log(`  Tool: ${tc.name}`);
        console.log(`  Args keys: ${Object.keys(tc.args).join(', ')}`);
        // Print length of TargetContent and ReplacementContent
        if (tc.args.TargetContent) console.log(`  TargetContent length: ${tc.args.TargetContent.length}`);
        if (tc.args.ReplacementContent) console.log(`  ReplacementContent length: ${tc.args.ReplacementContent.length}`);
        if (tc.args.ReplacementChunks) {
          console.log(`  ReplacementChunks type: ${typeof tc.args.ReplacementChunks}`);
          console.log(`  ReplacementChunks length: ${tc.args.ReplacementChunks.length}`);
        }
      });
    }
  } catch (err) {
    console.log(`Line ${ln} could not be parsed as JSON: ${err.message}`);
    console.log(`Start of line: ${line.substring(0, 200)}`);
  }
});
