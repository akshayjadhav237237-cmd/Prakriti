const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'extracted_steps_direct.json');
const steps = JSON.parse(fs.readFileSync(filePath, 'utf8'));

[30, 37].forEach(stepIdx => {
  const tc = steps[stepIdx][0];
  console.log(`=== Step ${stepIdx} ===`);
  console.log(`Type of ReplacementChunks: ${typeof tc.args.ReplacementChunks}`);
  const chunks = tc.args.ReplacementChunks;
  if (typeof chunks === 'string') {
    console.log(`Length: ${chunks.length}`);
    console.log(`First 200 chars: ${chunks.substring(0, 200)}`);
    console.log(`Last 200 chars: ${chunks.substring(chunks.length - 200)}`);
  } else {
    console.log("Is array:", Array.isArray(chunks));
  }
});
