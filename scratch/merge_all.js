const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = 'd:\\Akshay final folder\\Antigravity\\Virtual Prompt wars CH3';
const artifactDir = 'C:\\Users\\aksha\\.gemini\\antigravity\\brain\\621bb560-f856-4288-ad4a-79d8022cd151';

const filesToMerge = [
  {
    workspacePath: 'src/app/budget/page.tsx',
    artifactName: 'budget_page.tsx'
  },
  {
    workspacePath: 'src/app/log/page.tsx',
    artifactName: 'log_page.tsx'
  },
  {
    workspacePath: 'src/app/scan/page.tsx',
    artifactName: 'scan_page.tsx'
  },
  {
    workspacePath: 'src/app/insights/page.tsx',
    artifactName: 'insights_page.tsx'
  },
  {
    workspacePath: 'src/app/ecosystem/page.tsx',
    artifactName: 'ecosystem_page.tsx'
  }
];

// Ensure scratch directory exists
const scratchDir = path.join(root, 'scratch');
if (!fs.existsSync(scratchDir)) {
  fs.mkdirSync(scratchDir);
}

filesToMerge.forEach(({ workspacePath, artifactName }) => {
  const mine = path.join(root, workspacePath);
  const theirs = path.join(artifactDir, artifactName);
  const baseTemp = path.join(scratchDir, 'base_' + path.basename(workspacePath));

  console.log(`Merging ${workspacePath}...`);

  // Get base from git HEAD
  try {
    const baseContent = execSync(`git show HEAD:${workspacePath}`, { cwd: root });
    fs.writeFileSync(baseTemp, baseContent);
  } catch (err) {
    console.error(`Failed to get git base for ${workspacePath}:`, err.message);
    return;
  }

  // Run git merge-file <mine> <base> <theirs>
  try {
    execSync(`git merge-file "${mine}" "${baseTemp}" "${theirs}"`, { cwd: root });
    console.log(`Merged ${workspacePath} successfully without conflicts.`);
  } catch (err) {
    if (err.status && err.status > 0) {
      console.warn(`WARNING: Conflicts detected in ${workspacePath}. Please resolve manually.`);
    } else {
      console.error(`Error running merge-file on ${workspacePath}:`, err.message);
    }
  }

  // Clean up temp base file
  if (fs.existsSync(baseTemp)) {
    fs.unlinkSync(baseTemp);
  }
});
console.log("Merge operations completed.");
