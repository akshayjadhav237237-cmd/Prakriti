const fs = require('fs');
const contentPath = 'C:\\Users\\aksha\\.gemini\\antigravity\\brain\\750b7659-d9cf-4dd5-8991-c673b78242e5\\.system_generated\\steps\\2671\\content.md';
if (!fs.existsSync(contentPath)) {
  console.error("Content file not found");
  process.exit(1);
}

const html = fs.readFileSync(contentPath, 'utf8');

// Find all matches for question/answer structures or accordion components
// Let's print out text that looks like FAQ questions.
console.log("FAQ content search:");

// Search for question keywords or chevron icon patterns or expand buttons
// FAQ questions on summerofcode.xyz might be things like "What is ECSoC?", "Who can apply?", "Is there a stipend?", etc.
const faqKeywords = ["what is", "who can", "stipend", "eligibility", "mentor", "apply", "duration", "hours"];
faqKeywords.forEach(keyword => {
  let idx = 0;
  while ((idx = html.toLowerCase().indexOf(keyword, idx)) !== -1) {
    console.log(`Found "${keyword}" at index ${idx}`);
    console.log(html.substring(Math.max(0, idx - 50), Math.min(html.length, idx + 250)));
    console.log("-------------------------------------------\n");
    idx += keyword.length;
  }
});
