const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'extracted_steps_direct.json');
const steps = JSON.parse(fs.readFileSync(filePath, 'utf8'));

function saveStepContent(stepIdx, filename) {
  const tcList = steps[stepIdx];
  if (!tcList || !tcList[0]) {
    console.error(`Step ${stepIdx} not found`);
    return;
  }
  const tc = tcList[0];
  let content = "";
  if (tc.name === 'multi_replace_file_content') {
    content = typeof tc.args.ReplacementChunks === 'string' 
      ? tc.args.ReplacementChunks 
      : JSON.stringify(tc.args.ReplacementChunks, null, 2);
  } else {
    content = tc.args.ReplacementContent;
  }
  fs.writeFileSync(path.join(__dirname, filename), content, 'utf8');
  console.log(`Saved Step ${stepIdx} content to scratch/${filename}`);
}

saveStepContent(30, 'step30_chunks.json');
saveStepContent(37, 'step37_chunks.json');
