const fs = require('fs');
const contentPath = 'C:\\Users\\aksha\\.gemini\\antigravity\\brain\\750b7659-d9cf-4dd5-8991-c673b78242e5\\.system_generated\\steps\\2677\\content.md';
if (!fs.existsSync(contentPath)) {
  console.error("Content file not found");
  process.exit(1);
}

const html = fs.readFileSync(contentPath, 'utf8');

console.log("Terms content search:");

// Search for typical terms section headings
const termsKeywords = ["agreement", "eligibility", "submission", "conduct", "evaluation", "stipend", "intellectual", "liability", "termination"];
termsKeywords.forEach(keyword => {
  let idx = 0;
  while ((idx = html.toLowerCase().indexOf(keyword, idx)) !== -1) {
    console.log(`Found "${keyword}" at index ${idx}`);
    console.log(html.substring(Math.max(0, idx - 50), Math.min(html.length, idx + 250)));
    console.log("-------------------------------------------\n");
    idx += keyword.length;
  }
});
