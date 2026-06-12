const fs = require('fs');
const path = require('path');

function diffFiles(fileA, fileB) {
  const contentA = fs.readFileSync(fileA, 'utf8').split('\n');
  const contentB = fs.readFileSync(fileB, 'utf8').split('\n');
  
  let i = 0, j = 0;
  while (i < contentA.length || j < contentB.length) {
    if (i < contentA.length && j < contentB.length && contentA[i].trim() === contentB[j].trim()) {
      i++;
      j++;
    } else {
      // Print context of mismatch
      console.log(`--- Line ${i+1} in ${path.basename(fileA)}`);
      for (let k = Math.max(0, i - 2); k < Math.min(contentA.length, i + 5); k++) {
        console.log(`A: ${k+1}: ${contentA[k]}`);
      }
      console.log(`+++ Line ${j+1} in ${path.basename(fileB)}`);
      for (let k = Math.max(0, j - 2); k < Math.min(contentB.length, j + 5); k++) {
        console.log(`B: ${k+1}: ${contentB[k]}`);
      }
      break;
    }
  }
}

const file = process.argv[2];
const fileA = path.join('d:\\Akshay final folder\\Antigravity\\Virtual Prompt wars CH3', file);
const fileB = path.join('C:\\Users\\aksha\\.gemini\\antigravity\\brain\\621bb560-f856-4288-ad4a-79d8022cd151', process.argv[3]);

diffFiles(fileA, fileB);
