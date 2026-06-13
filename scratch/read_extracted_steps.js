const fs = require('fs');
const path = require('path');

const files = ['extracted_steps.json', 'extracted_steps_direct.json'];
files.forEach(f => {
  const filePath = path.join('scratch', f);
  if (!fs.existsSync(filePath)) {
    console.log(`${f} not found`);
    return;
  }
  const content = fs.readFileSync(filePath, 'utf16le');
  fs.writeFileSync(path.join('scratch', `utf8_${f}`), content, 'utf8');
  console.log(`Converted ${f} to scratch/utf8_${f}`);
  
  // Let's print out the keys of the converted JSON
  try {
    const data = JSON.parse(content);
    console.log(`Keys in ${f}:`, Object.keys(data));
  } catch (err) {
    console.log(`Error parsing JSON in ${f}:`, err.message);
  }
});
