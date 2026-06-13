const fs = require('fs');
const path = require('path');

const transcriptPath = 'C:\\Users\\aksha\\.gemini\\antigravity\\brain\\750b7659-d9cf-4dd5-8991-c673b78242e5\\.system_generated\\logs\\transcript_full.jsonl';
if (!fs.existsSync(transcriptPath)) {
  console.error("Transcript full not found");
  process.exit(1);
}

const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');
console.log("Total transcript lines:", lines.length);

lines.forEach((line, idx) => {
  if (!line.trim()) return;
  try {
    const obj = JSON.parse(line);
    if (obj.type === 'USER_INPUT') {
      console.log(`=== User Input at step ${obj.step_index} (line ${idx + 1}) ===`);
      console.log(obj.content.substring(0, 300) + "...\n");
      
      if (obj.content.includes('SUMMEROFCODE.XYZ')) {
        console.log("  -> Contains SUMMEROFCODE.XYZ!");
        console.log("  -> Content length:", obj.content.length);
        console.log("  -> Contains <truncated:", obj.content.includes('<truncated'));
      }
    }
  } catch (err) {
    // ignore
  }
});
