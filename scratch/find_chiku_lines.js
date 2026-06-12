const fs = require('fs');
const path = require('path');

const transcriptPath = 'C:\\Users\\aksha\\.gemini\\antigravity\\brain\\b2286392-a454-41b9-8c27-7c46a4040108\\.system_generated\\logs\\transcript.jsonl';

if (!fs.existsSync(transcriptPath)) {
  console.error("Transcript not found.");
  process.exit(1);
}

const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');

lines.forEach((line, idx) => {
  if (line.includes('chiku-breathe')) {
    console.log(`Match at line ${idx + 1}`);
    try {
      const obj = JSON.parse(line);
      console.log(`  Step Index: ${obj.step_index}`);
      console.log(`  Type: ${obj.type}`);
      if (obj.tool_calls) {
        obj.tool_calls.forEach(tc => {
          console.log(`    Tool: ${tc.name}`);
          if (tc.name === 'multi_replace_file_content') {
            const chunks = tc.args.ReplacementChunks;
            console.log(`    ReplacementChunks typeof: ${typeof chunks}`);
            if (typeof chunks === 'string') {
              console.log(`    Contains '<truncated': ${chunks.includes('<truncated')}`);
            }
          }
        });
      }
    } catch (e) {
      console.log(`  Parse error: ${e.message}`);
    }
  }
});
