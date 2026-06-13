const fs = require('fs');
const path = require('path');

const brainDir = 'C:\\Users\\aksha\\.gemini\\antigravity\\brain';
if (!fs.existsSync(brainDir)) {
  console.error("Brain directory not found");
  process.exit(1);
}

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      callback(dirPath);
    }
  });
}

console.log("Searching for transcripts containing exact clone instructions...");

walkDir(brainDir, filePath => {
  if (filePath.endsWith('transcript_full.jsonl') || filePath.endsWith('transcript.jsonl')) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('SUMMEROFCODE.XYZ') && content.includes('TermsAccordion')) {
        console.log(`Found match in: ${filePath}`);
        // Let's extract all matches
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          if (line.includes('SUMMEROFCODE.XYZ') && line.includes('TermsAccordion') && !line.includes('<truncated')) {
            console.log(`Line ${idx + 1} has untruncated match!`);
            try {
              const obj = JSON.parse(line);
              if (obj.content && obj.content.includes('TermsAccordion')) {
                const outPath = `scratch/found_prompt_${path.basename(filePath)}_${idx}.txt`;
                fs.writeFileSync(outPath, obj.content, 'utf8');
                console.log(`Saved untruncated content to ${outPath}`);
              } else if (obj.tool_calls) {
                fs.writeFileSync(`scratch/found_tool_calls_${path.basename(filePath)}_${idx}.json`, JSON.stringify(obj.tool_calls, null, 2), 'utf8');
                console.log(`Saved tool calls to scratch/found_tool_calls_${path.basename(filePath)}_${idx}.json`);
              }
            } catch (e) {
              console.log("Parse error:", e.message);
            }
          }
        });
      }
    } catch (err) {
      // ignore read errors
    }
  }
});
