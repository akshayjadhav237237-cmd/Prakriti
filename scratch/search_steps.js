const fs = require('fs');

try {
  // Read extracted_steps.json as UTF-16LE
  const content = fs.readFileSync('scratch/extracted_steps.json', 'utf16le');
  console.log("Read extracted_steps.json. Length:", content.length);
  
  let pos = 0;
  while ((pos = content.indexOf('TermsAccordion', pos)) !== -1) {
    console.log(`Found TermsAccordion in extracted_steps.json at index ${pos}`);
    console.log(content.substring(Math.max(0, pos - 150), Math.min(content.length, pos + 500)));
    console.log("--------------------------------------------------\n");
    pos += 14;
  }
} catch (err) {
  console.error("Error reading extracted_steps.json:", err.message);
}

try {
  // Read extracted_steps_direct.json as UTF-8
  const content = fs.readFileSync('scratch/extracted_steps_direct.json', 'utf8');
  console.log("Read extracted_steps_direct.json. Length:", content.length);
  
  let pos = 0;
  while ((pos = content.indexOf('TermsAccordion', pos)) !== -1) {
    console.log(`Found TermsAccordion in extracted_steps_direct.json at index ${pos}`);
    console.log(content.substring(Math.max(0, pos - 150), Math.min(content.length, pos + 500)));
    console.log("--------------------------------------------------\n");
    pos += 14;
  }
} catch (err) {
  console.error("Error reading extracted_steps_direct.json:", err.message);
}
