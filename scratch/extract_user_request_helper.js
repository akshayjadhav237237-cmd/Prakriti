const fs = require('fs');

try {
  const path = 'C:\\Users\\aksha\\.gemini\\antigravity\\brain\\750b7659-d9cf-4dd5-8991-c673b78242e5\\.system_generated\\logs\\transcript_full.jsonl';
  const lines = fs.readFileSync(path, 'utf8').split('\n');
  
  let found = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    if (line.includes('Completely rebuild') && line.includes('"type":"USER_INPUT"') && !line.includes('EXACT CLONE')) {
      const data = JSON.parse(line);
      fs.writeFileSync('scratch/original_homepage_request.txt', data.content);
      console.log('Found original request. Length:', data.content.length);
      found = true;
      break;
    }
  }
  
  if (!found) {
    console.error("Could not find matching original request line in transcript!");
  }
} catch (err) {
  console.error("Error occurred:", err);
}
