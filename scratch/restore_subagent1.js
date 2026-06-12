const fs = require('fs');
const path = require('path');

const transcriptPath = 'C:\\Users\\aksha\\.gemini\\antigravity\\brain\\b2286392-a454-41b9-8c27-7c46a4040108\\.system_generated\\logs\\transcript.jsonl';

if (!fs.existsSync(transcriptPath)) {
  console.error(`Transcript not found at ${transcriptPath}`);
  process.exit(1);
}

const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');
console.log(`Found ${lines.length} lines in transcript.`);

lines.forEach((line, idx) => {
  if (!line.trim()) return;
  try {
    const obj = JSON.parse(line);
    if (obj.tool_calls) {
      obj.tool_calls.forEach(tc => {
        if (tc.name === 'write_to_file' || tc.name === 'replace_file_content' || tc.name === 'multi_replace_file_content') {
          console.log(`Step ${obj.step_index || idx}: Tool Call: ${tc.name}`);
          console.log(`TargetFile: ${tc.args.TargetFile}`);
          if (tc.name === 'replace_file_content') {
            console.log(`TargetContent (first 100 chars): ${tc.args.TargetContent.substring(0, 100)}...`);
            console.log(`ReplacementContent (first 100 chars): ${tc.args.ReplacementContent.substring(0, 100)}...`);
          } else if (tc.name === 'multi_replace_file_content') {
            tc.args.ReplacementChunks.forEach((chunk, cidx) => {
              console.log(`  Chunk ${cidx}: Target: ${chunk.TargetContent.substring(0, 50)}...`);
              console.log(`  Chunk ${cidx}: Replace: ${chunk.ReplacementContent.substring(0, 50)}...`);
            });
          } else if (tc.name === 'write_to_file') {
            console.log(`CodeContent size: ${tc.args.CodeContent ? tc.args.CodeContent.length : 0} bytes`);
          }
          console.log('---');
        }
      });
    }
  } catch (err) {
    // ignore parse errors
  }
});
