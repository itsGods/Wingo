import fs from 'fs';
import path from 'path';

function findAndReplace(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      findAndReplace(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('USDT')) {
        content = content.replace(/USDT /g, '₹');
        content = content.replace(/ USDT/g, ' ₹');
        content = content.replace(/USDT/g, '₹');
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

findAndReplace('app');
findAndReplace('components');
console.log('Done');
