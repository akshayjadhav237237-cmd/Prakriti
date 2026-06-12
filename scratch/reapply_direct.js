const fs = require('fs');
const path = require('path');

const root = 'd:\\Akshay final folder\\Antigravity\\Virtual Prompt wars CH3';

const filePath = path.join(__dirname, 'extracted_steps_direct.json');
if (!fs.existsSync(filePath)) {
  console.error("extracted_steps_direct.json not found!");
  process.exit(1);
}

const steps = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Sort steps in chronological order
const sortedSteps = Object.keys(steps).map(Number).sort((a, b) => a - b);

function unescapeString(str) {
  if (typeof str !== 'string') return str;
  // If it's wrapped in literal quotes or contains escaped sequences, unescape it
  if (str.startsWith('"') && str.endsWith('"')) {
    try {
      return JSON.parse(str);
    } catch (e) {
      // fallback if it fails
    }
  }
  // Also handle cases where it is not wrapped in quotes but contains escaped newlines
  try {
    return JSON.parse('"' + str.replace(/"/g, '\\"') + '"');
  } catch (e) {
    return str;
  }
}

sortedSteps.forEach(stepIdx => {
  const toolCalls = steps[stepIdx];
  if (!Array.isArray(toolCalls)) return;
  
  toolCalls.forEach(tc => {
    let targetPath = unescapeString(tc.args.TargetFile);
    // Strip double quotes if present
    targetPath = targetPath.replace(/"/g, '').replace(/\\/g, '/');
    
    // Extract relative path after Virtual Prompt wars CH3
    let relativePath = "";
    const parts = targetPath.split('Virtual Prompt wars CH3/');
    if (parts.length > 1) {
      relativePath = parts[1];
    } else {
      relativePath = targetPath;
    }
    
    // Remove any leading slash
    if (relativePath.startsWith('/')) {
      relativePath = relativePath.substring(1);
    }
    
    const localFile = path.resolve(root, relativePath);
    
    console.log(`Step ${stepIdx}: targetPath="${targetPath}" relativePath="${relativePath}" localFile="${localFile}" exists=${fs.existsSync(localFile)}`);
    
    if (!fs.existsSync(localFile)) {
      console.error(`File does not exist: ${localFile} (relativePath: ${relativePath})`);
      return;
    }
    
    let fileContent = fs.readFileSync(localFile, 'utf8');
    
    if (tc.name === 'replace_file_content') {
      const target = unescapeString(tc.args.TargetContent);
      const replacement = unescapeString(tc.args.ReplacementContent);
      
      const normalizedFile = fileContent.replace(/\r\n/g, '\n');
      const normalizedTarget = target.replace(/\r\n/g, '\n');
      const normalizedReplacement = replacement.replace(/\r\n/g, '\n');
      
      if (normalizedFile.includes(normalizedTarget)) {
        fileContent = normalizedFile.replace(normalizedTarget, normalizedReplacement);
        fs.writeFileSync(localFile, fileContent.replace(/\n/g, '\r\n'), 'utf8');
        console.log(`Step ${stepIdx}: Applied replace_file_content to ${relativePath}`);
      } else {
        console.warn(`Step ${stepIdx}: WARNING: Target not found in ${relativePath}`);
        console.log(`Target length: ${normalizedTarget.length}`);
        console.log(`Target start: ${JSON.stringify(normalizedTarget.substring(0, 100))}`);
        const simplifiedTarget = normalizedTarget.replace(/\s+/g, ' ');
        const simplifiedFile = normalizedFile.replace(/\s+/g, ' ');
        if (simplifiedFile.includes(simplifiedTarget)) {
          console.log("-> Found match with whitespace normalization!");
        } else {
          console.log("-> Whitespace normalized target also NOT found.");
        }
      }
    } else if (tc.name === 'multi_replace_file_content') {
      let success = true;
      let tempContent = fileContent;
      
      let chunks = tc.args.ReplacementChunks;
      if (typeof chunks === 'string') {
        chunks = unescapeString(chunks);
        try {
          chunks = eval('(' + chunks + ')');
        } catch (e) {
          console.error(`Step ${stepIdx}: Failed to parse ReplacementChunks using eval:`, e.message);
          return;
        }
      }
      
      if (!Array.isArray(chunks)) {
        console.error(`Step ${stepIdx}: ReplacementChunks is not an array`, chunks);
        return;
      }
      
      chunks.forEach((chunk, cidx) => {
        const target = unescapeString(chunk.TargetContent);
        const replacement = unescapeString(chunk.ReplacementContent);
        
        const normalizedFile = tempContent.replace(/\r\n/g, '\n');
        const normalizedTarget = target.replace(/\r\n/g, '\n');
        const normalizedReplacement = replacement.replace(/\r\n/g, '\n');
        
        if (normalizedFile.includes(normalizedTarget)) {
          tempContent = normalizedFile.replace(normalizedTarget, normalizedReplacement);
        } else {
          console.warn(`Step ${stepIdx}: WARNING: Chunk ${cidx} target not found in ${relativePath}`);
          console.log(`Target length: ${normalizedTarget.length}`);
          console.log(`Target start: ${JSON.stringify(normalizedTarget.substring(0, 100))}`);
          const simplifiedTarget = normalizedTarget.replace(/\s+/g, ' ');
          const simplifiedFile = normalizedFile.replace(/\s+/g, ' ');
          if (simplifiedFile.includes(simplifiedTarget)) {
            console.log("-> Found match with whitespace normalization!");
          } else {
            console.log("-> Whitespace normalized target also NOT found.");
          }
          success = false;
        }
      });
      if (success) {
        fs.writeFileSync(localFile, tempContent.replace(/\n/g, '\r\n'), 'utf8');
        console.log(`Step ${stepIdx}: Applied multi_replace_file_content to ${relativePath}`);
      }
    }
  });
});
console.log("All steps re-applied.");
