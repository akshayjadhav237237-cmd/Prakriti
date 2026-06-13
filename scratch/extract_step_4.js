const fs = require('fs');

try {
  const content = fs.readFileSync('scratch/extracted_user_request.txt', 'utf8');

  // Find where STEP 4 begins
  const step4Header = "STEP 4 — page.tsx — COMPLETE REWRITE";
  const startIndex = content.indexOf(step4Header);
  if (startIndex === -1) {
    console.error("Could not find Step 4 header!");
    process.exit(1);
  }

  // Find the first line starting with 'use client' after the header
  const codeStartStr = "'use client';";
  const codeStartIndex = content.indexOf(codeStartStr, startIndex);
  if (codeStartIndex === -1) {
    console.error("Could not find 'use client'; code start!");
    process.exit(1);
  }

  let codeContent = content.substring(codeStartIndex).trim();

  // Clean up trailing vercel deploy/build command if it was parsed as part of the request
  const trailingCommand = "npm run build && vercel --prod";
  if (codeContent.endsWith(trailingCommand)) {
    codeContent = codeContent.substring(0, codeContent.length - trailingCommand.length).trim();
  }
  // Clean up trailing markdown backticks if any
  if (codeContent.endsWith("```")) {
    codeContent = codeContent.substring(0, codeContent.length - 3).trim();
  }

  fs.writeFileSync('src/app/page.tsx', codeContent);
  console.log("Successfully wrote page.tsx! Length:", codeContent.length);
} catch (err) {
  console.error("Error occurred:", err);
  process.exit(1);
}
