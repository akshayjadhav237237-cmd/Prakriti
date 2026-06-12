const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, 'extracted_steps.json'), 'utf8');

// We split by "=== STEP " to isolate each step's JSON
const stepsStr = content.split(/=== STEP \d+ ===\n/);

stepsStr.forEach(stepStr => {
  if (!stepStr.trim()) return;
  
  // Clean up and find the JSON array inside
  const jsonStart = stepStr.indexOf('[');
  const jsonEnd = stepStr.lastIndexOf(']');
  if (jsonStart === -1 || jsonEnd === -1) return;
  
  const jsonStr = stepStr.substring(jsonStart, jsonEnd + 1);
  let toolCalls;
  try {
    toolCalls = JSON.parse(jsonStr);
  } catch (err) {
    console.error("Failed to parse JSON block:", err.message);
    return;
  }
  
  toolCalls.forEach(tc => {
    // Normalise file path to run on the local OS
    let targetPath = tc.args.TargetFile;
    // Standardise separators
    targetPath = targetPath.replace(/\\/g, '/');
    // Map to actual workspace
    const relativePath = targetPath.split('Virtual Prompt wars CH3/')[1];
    const localFile = path.join(__dirname, '..', relativePath);
    
    if (!fs.existsSync(localFile)) {
      console.error(`File does not exist: ${localFile}`);
      return;
    }
    
    let fileContent = fs.readFileSync(localFile, 'utf8');
    
    if (tc.name === 'replace_file_content') {
      const target = tc.args.TargetContent;
      const replacement = tc.args.ReplacementContent;
      
      // We must handle windows CRLF vs LF. Let's do a robust replace by normalizing to LF first, or just exact match.
      const normalizedFile = fileContent.replace(/\r\n/g, '\n');
      const normalizedTarget = target.replace(/\r\n/g, '\n');
      const normalizedReplacement = replacement.replace(/\r\n/g, '\n');
      
      if (normalizedFile.includes(normalizedTarget)) {
        fileContent = normalizedFile.replace(normalizedTarget, normalizedReplacement);
        // Save back with original line endings (we'll use LF which is standard in Next.js)
        fs.writeFileSync(localFile, fileContent, 'utf8');
        console.log(`Applied replace_file_content to ${relativePath}`);
      } else {
        console.warn(`WARNING: Target not found in ${relativePath} for replace_file_content`);
      }
    } else if (tc.name === 'multi_replace_file_content') {
      let success = true;
      tc.args.ReplacementChunks.forEach((chunk, cidx) => {
        const target = chunk.TargetContent;
        const replacement = chunk.ReplacementContent;
        
        const normalizedFile = fileContent.replace(/\r\n/g, '\n');
        const normalizedTarget = target.replace(/\r\n/g, '\n');
        const normalizedReplacement = replacement.replace(/\r\n/g, '\n');
        
        if (normalizedFile.includes(normalizedTarget)) {
          fileContent = normalizedFile.replace(normalizedTarget, normalizedReplacement);
        } else {
          console.warn(`WARNING: Chunk ${cidx} target not found in ${relativePath}`);
          success = false;
        }
      });
      if (success) {
        fs.writeFileSync(localFile, fileContent.replace(/\r\n/g, '\n'), 'utf8');
        console.log(`Applied multi_replace_file_content to ${relativePath}`);
      }
    }
  });
});
console.log("Re-application process finished.");
