const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'extracted_steps_direct.json');
const steps = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const tc = steps[30][0];
const chunks = tc.args.ReplacementChunks;

console.log("Characters around 2036:");
for (let idx = Math.max(0, 2036 - 20); idx < Math.min(chunks.length, 2036 + 20); idx++) {
  console.log(`${idx}: code=${chunks.charCodeAt(idx)} char=${JSON.stringify(chunks[idx])}`);
}
