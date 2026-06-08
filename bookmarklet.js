// bookmarklet.js
// Run this in Node.js to generate the bookmarklet code
// Or just copy the output below

const fs = require('fs');

// Read the main script
let code = fs.readFileSync('tiktacker.js', 'utf8');

// Remove the userscript metadata block
code = code.replace(/\/\/ ==UserScript==[\s\S]*?\/\/ ==\/UserScript==\n*/, '');

// Minify basics — remove extra whitespace
code = code
  .replace(/\s{2,}/g, ' ')
  .replace(/\n/g, ' ')
  .replace(/\t/g, ' ')
  .trim();

// Encode for bookmark
const bookmarklet = 'javascript:(function(){' + encodeURIComponent(code) + '})();';

console.log('Copy this as your bookmark URL:\n');
console.log(bookmarklet);