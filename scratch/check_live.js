const https = require('https');

https.get('https://prakriti-carbon.vercel.app', res => {
  let data = '';
  res.on('data', chunk => {
    data += chunk;
  });
  res.on('end', () => {
    console.log("Response status:", res.statusCode);
    if (data.includes("Your carbon, your budget")) {
      console.log("MATCH: Found old headline 'Your carbon, your budget'");
    } else {
      console.log("NO MATCH for old headline");
    }
    if (data.includes("We empower individuals")) {
      console.log("MATCH: Found new content 'We empower individuals'");
    } else {
      console.log("NO MATCH for new content");
    }
    if (data.includes("PRAKRITI")) {
      console.log("MATCH: Found 'PRAKRITI'");
    } else {
      console.log("NO MATCH for 'PRAKRITI'");
    }
    // Print first 500 characters of the body or some parts of the HTML to help debug
    console.log("\nHTML snippet (first 1000 chars):");
    console.log(data.substring(0, 1000));
  });
}).on('error', err => {
  console.error("Error fetching live page:", err.message);
});
