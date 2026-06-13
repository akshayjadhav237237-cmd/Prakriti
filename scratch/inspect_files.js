const fs = require('fs');

const files = ['extracted_steps.json', 'extracted_steps_direct.json', 'page_diff.txt'];
files.forEach(f => {
  const filePath = `scratch/${f}`;
  if (!fs.existsSync(filePath)) return;
  const buf = fs.readFileSync(filePath);
  console.log(`=== File: ${f} (size: ${buf.length} bytes) ===`);
  console.log('Hex: ', buf.slice(0, 32).toString('hex'));
  
  // Try reading as UTF-8, UTF-16LE, UTF-16BE
  console.log('UTF-8 100 chars: ', buf.slice(0, 200).toString('utf8'));
  console.log('UTF-16LE 100 chars: ', buf.slice(0, 200).toString('utf16le'));
  console.log('\n');
});
