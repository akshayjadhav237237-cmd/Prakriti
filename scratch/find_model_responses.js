const fs = require('fs');
const path = require('path');

const transcriptPath = 'C:\\Users\\aksha\\.gemini\\antigravity\\brain\\750b7659-d9cf-4dd5-8991-c673b78242e5\\.system_generated\\logs\\transcript_full.jsonl';
if (!fs.existsSync(transcriptPath)) {
  console.error("Transcript full not found");
  process.exit(1);
}

const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');
console.log("Total transcript lines:", lines.length);

let foundCount = 0;
lines.forEach((line, idx) => {
  if (!line.trim()) return;
  try {
    const obj = JSON.parse(line);
    // Search model outputs (e.g. tool_calls to write_to_file or replacementContent)
    let hasMatch = false;
    let textToSearch = '';

    if (obj.type === 'PLANNER_RESPONSE') {
      textToSearch = JSON.stringify(obj);
      if (textToSearch.includes('TermsAccordion') && textToSearch.includes('Col 3 — Community')) {
        hasMatch = true;
      }
    }

    if (hasMatch) {
      foundCount++;
      console.log(`=== Match ${foundCount} at step ${obj.step_index} (line ${idx + 1}) ===`);
      console.log(`Type: ${obj.type}`);
      // Let's print out what tool calls were made
      if (obj.tool_calls) {
        obj.tool_calls.forEach((tc, tcIdx) => {
          console.log(`  Tool call ${tcIdx}: ${tc.name}`);
          if (tc.args && tc.args.CodeContent) {
            console.log(`    CodeContent length: ${tc.args.CodeContent.length}`);
            if (tc.args.CodeContent.includes('TermsAccordion')) {
              const outPath = `scratch/found_model_code_step_${obj.step_index}_tc_${tcIdx}.txt`;
              fs.writeFileSync(outPath, tc.args.CodeContent, 'utf8');
              console.log(`    Saved CodeContent to ${outPath}`);
            }
          }
          if (tc.args && tc.args.ReplacementContent) {
            console.log(`    ReplacementContent length: ${tc.args.ReplacementContent.length}`);
            if (tc.args.ReplacementContent.includes('TermsAccordion')) {
              const outPath = `scratch/found_model_repl_step_${obj.step_index}_tc_${tcIdx}.txt`;
              fs.writeFileSync(outPath, tc.args.ReplacementContent, 'utf8');
              console.log(`    Saved ReplacementContent to ${outPath}`);
            }
          }
        });
      }
    }
  } catch (err) {
    // ignore
  }
});

console.log(`Done. Found ${foundCount} matching steps.`);
