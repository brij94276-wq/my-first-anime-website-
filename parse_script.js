const fs = require('fs');
const path = 'index.html';
const html = fs.readFileSync(path, 'utf8');
const start = html.indexOf('<script>');
const end = html.lastIndexOf('</script>');
const script = html.slice(start + '<script>'.length, end);
const lines = script.split('\n');
console.log('lines', lines.length);
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('async')) console.log('async at line', i + 1, lines[i]);
}
for (let i = 0; i < Math.min(lines.length, 120); i++) {
  if (lines[i].includes('window.S') || lines[i].includes('async function') || lines[i].includes('generateAnimeDB') || lines[i].includes('fetchWalls')) {
    console.log('line', i + 1, lines[i]);
  }
}
