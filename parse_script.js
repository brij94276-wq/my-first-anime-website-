const fs = require('fs');
const path = require('path');

// Enhanced parser
// Usage:
//   node parse_script.js [target] [--out report.json]
// target: file or directory (defaults to current directory)

const argv = process.argv.slice(2);
let target = argv[0] || '.';
let outIndex = argv.indexOf('--out');
let outFile = null;
if (outIndex !== -1) {
  outFile = argv[outIndex + 1];
}

const keywords = [/\basync\b/i, /window\.S/, /async function/, /generateAnimeDB/, /fetchWalls/];
const scriptRegex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;

function findHtmlFiles(startPath) {
  let results = [];
  const stat = fs.statSync(startPath);
  if (stat.isFile()) {
    if (startPath.toLowerCase().endsWith('.html')) results.push(startPath);
    return results;
  }
  const entries = fs.readdirSync(startPath);
  for (const entry of entries) {
    const full = path.join(startPath, entry);
    try {
      const s = fs.statSync(full);
      if (s.isDirectory()) results = results.concat(findHtmlFiles(full));
      else if (s.isFile() && full.toLowerCase().endsWith('.html')) results.push(full);
    } catch (e) {
      // ignore
    }
  }
  return results;
}

function extractScriptsFromHtml(html) {
  const scripts = [];
  let m;
  while ((m = scriptRegex.exec(html)) !== null) {
    const attrs = m[1];
    const content = m[2];
    const isExternal = /\bsrc=/.test(attrs);
    const srcMatch = attrs.match(/\bsrc=(?:"([^"]+)"|'([^']+)'|([^\s>]+))/i);
    const src = srcMatch ? (srcMatch[1] || srcMatch[2] || srcMatch[3]) : null;
    scripts.push({ attrs, content, isExternal, src, index: scripts.length + 1, matchIndex: m.index });
  }
  return scripts;
}

function analyzeFile(filePath) {
  const txt = fs.readFileSync(filePath, 'utf8');
  const scripts = extractScriptsFromHtml(txt);
  const fileBeforeLines = txt.split('\n');
  const report = { file: path.relative(process.cwd(), filePath), scripts: [], externalScripts: [] };
  for (const s of scripts) {
    if (s.isExternal && s.src) report.externalScripts.push(s.src);
    const before = txt.slice(0, s.matchIndex);
    const startLine = before.split('\n').length;
    const lines = s.content.split('\n');
    const matches = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const kw of keywords) {
        if (kw.test(line)) {
          const absLine = startLine + i;
          const contextBefore = [];
          const contextAfter = [];
          for (let k = Math.max(0, i - 2); k < i; k++) contextBefore.push(lines[k]);
          for (let k = i + 1; k <= Math.min(lines.length - 1, i + 2); k++) contextAfter.push(lines[k]);
          matches.push({ line: absLine, text: line.trim(), contextBefore, contextAfter });
          break;
        }
      }
    }
    report.scripts.push({ index: s.index, startLine, lines: lines.length, matches });
  }
  return report;
}

const targets = [];
try {
  const stat = fs.statSync(target);
  if (stat.isFile()) targets.push(path.resolve(target));
  else if (stat.isDirectory()) targets.push(...findHtmlFiles(path.resolve(target)));
} catch (e) {
  console.error('Target not found:', target);
  process.exit(1);
}

if (targets.length === 0) {
  console.log('No HTML files found under target', target);
  process.exit(0);
}

const finalReport = { generatedAt: new Date().toISOString(), target: path.resolve(target), files: [] };
for (const f of targets) {
  try {
    const r = analyzeFile(f);
    finalReport.files.push(r);
  } catch (e) {
    console.error('Failed to analyze', f, e.message);
  }
}

const summaryLines = [];
let totalScripts = 0;
let totalMatches = 0;
for (const f of finalReport.files) {
  let fileMatches = 0;
  for (const s of f.scripts) {
    totalScripts += 1;
    fileMatches += s.matches.length;
    totalMatches += s.matches.length;
  }
  summaryLines.push(`${f.file}: ${f.scripts.length} <script> blocks, ${fileMatches} matches`);
}

if (outFile) {
  fs.writeFileSync(outFile, JSON.stringify(finalReport, null, 2), 'utf8');
  console.log('Wrote JSON report to', outFile);
} else {
  console.log('Summary:');
  for (const l of summaryLines) console.log(' -', l);
}

console.log(`Scanned ${finalReport.files.length} HTML file(s), ${totalScripts} scripts, ${totalMatches} keyword matches.`);
