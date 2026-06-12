const fs = require('fs');
const path = require('path');

function findConflicts(filePath) {
  const content = fs.readFileSync(filePath, 'utf8').split('\n');
  let inConflict = false;
  let block = [];
  let blockStart = 0;

  for (let idx = 0; idx < content.length; idx++) {
    const line = content[idx];
    if (line.startsWith('<<<<<<<')) {
      inConflict = true;
      blockStart = idx + 1;
      block = [line];
    } else if (line.startsWith('>>>>>>>')) {
      if (inConflict) {
        block.push(line);
        console.log(`\n=== CONFLICT in ${filePath} at lines ${blockStart}-${idx+1} ===`);
        console.log(block.join('\n'));
        inConflict = false;
        block = [];
      }
    } else if (inConflict) {
      block.push(line);
    }
  }
}

const file = process.argv[2];
if (file) {
  findConflicts(path.join('d:\\Akshay final folder\\Antigravity\\Virtual Prompt wars CH3', file));
} else {
  console.log("Please specify a file.");
}
