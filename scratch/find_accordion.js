const fs = require('fs');
const path = require('path');

const contentPath = 'C:\\Users\\aksha\\.gemini\\antigravity\\brain\\750b7659-d9cf-4dd5-8991-c673b78242e5\\.system_generated\\steps\\2631\\content.md';
if (!fs.existsSync(contentPath)) {
  console.error("Content file not found");
  process.exit(1);
}

const html = fs.readFileSync(contentPath, 'utf8');

// Let's search for details tags
console.log("Searching for <details> or <summary> tags...");
let detailsMatch = html.match(/<details[\s\S]*?<\/details>/gi);
if (detailsMatch) {
  console.log(`Found ${detailsMatch.length} <details> tags:`);
  detailsMatch.forEach((m, idx) => {
    console.log(`Match ${idx + 1}:`, m.substring(0, 500));
  });
} else {
  console.log("No <details> tags found.");
}

// Let's search for buttons with aria-expanded or similar
console.log("Searching for aria-expanded...");
let ariaMatches = [];
let idx = 0;
while ((idx = html.indexOf("aria-expanded", idx)) !== -1) {
  ariaMatches.push(idx);
  idx += 13;
}
console.log(`Found ${ariaMatches.length} occurrences of aria-expanded:`);
ariaMatches.forEach((pos, idx) => {
  console.log(`Match ${idx + 1}:`, html.substring(pos - 100, pos + 300));
});

// Let's search for SVG icons with plus, minus, chevron
// Or text like "frequently asked", "common questions", "eligibility", "terms", "rules", "submission"
const keywords = ["eligibility", "rules", "submissions", "intellectual", "liability", "conduct", "evaluation", "stipends", "mentors", "contributors", "support", "community"];
keywords.forEach(keyword => {
  let pos = html.toLowerCase().indexOf(keyword);
  if (pos !== -1) {
    console.log(`Keyword "${keyword}" found at index ${pos}`);
    console.log(html.substring(pos - 150, pos + 350));
  }
});
