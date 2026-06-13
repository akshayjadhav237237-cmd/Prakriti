const fs = require('fs');
const path = require('path');

const contentPath = 'C:\\Users\\aksha\\.gemini\\antigravity\\brain\\750b7659-d9cf-4dd5-8991-c673b78242e5\\.system_generated\\steps\\2631\\content.md';
if (!fs.existsSync(contentPath)) {
  console.error("Content file not found");
  process.exit(1);
}

const html = fs.readFileSync(contentPath, 'utf8');

// Find terms/faq or accordion structures in the HTML
// Usually accordions contain things like "Accordion", "Terms", "FAQ", "Frequently", "Rules", "Eligibility", "Intellectual", "Privacy", "Liability"
// Let's write a helper to find segments and output them.

console.log("HTML length:", html.length);

const termsKeywords = ["Accordion", "FAQ", "Frequently Asked Questions", "Terms & Conditions", "Terms and Conditions", "Privacy Policy", "Eligibility", "Code of Conduct"];
termsKeywords.forEach(keyword => {
  let idx = html.indexOf(keyword);
  if (idx !== -1) {
    console.log(`Keyword "${keyword}" found at index ${idx}`);
    console.log(`Context: ${html.substring(Math.max(0, idx - 100), Math.min(html.length, idx + 500))}\n`);
  } else {
    console.log(`Keyword "${keyword}" not found`);
  }
});

// Let's also look for footer links
console.log("Footer link contexts:");
let footerIdx = html.indexOf("<footer");
if (footerIdx !== -1) {
  console.log("Found <footer tag at index:", footerIdx);
  console.log(html.substring(footerIdx, footerIdx + 3000));
} else {
  console.log("No <footer tag found");
}
