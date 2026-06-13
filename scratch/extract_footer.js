const fs = require('fs');
const contentPath = 'C:\\Users\\aksha\\.gemini\\antigravity\\brain\\750b7659-d9cf-4dd5-8991-c673b78242e5\\.system_generated\\steps\\2631\\content.md';
if (!fs.existsSync(contentPath)) {
  console.error("Content file not found");
  process.exit(1);
}

const html = fs.readFileSync(contentPath, 'utf8');
const footerStart = html.indexOf('<footer');
if (footerStart !== -1) {
  console.log("Footer content:");
  console.log(html.substring(footerStart, footerStart + 12000));
} else {
  console.log("No footer found in HTML");
}
