const fs = require('fs');
const path = require('path');

const directory = path.join(__dirname, '..', 'app', 'api', 'ai');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      replaceInDir(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.js')) {
      let content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('gemini-1.5-flash')) {
        console.log(`Updating model in: ${filePath}`);
        content = content.replace(/gemini-1.5-flash/g, 'gemini-2.5-flash');
        fs.writeFileSync(filePath, content, 'utf8');
      }
    }
  }
}

replaceInDir(directory);
console.log("Model replacements completed successfully!");
