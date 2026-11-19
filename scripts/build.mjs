import { readFile, writeFile, mkdir, rm, cp, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const src = path.join(root, 'src');
const out = path.join(root, 'dist');
const pages = [
  ['index', 'home', 'Real Money Washers — Clean money. Measured precisely.', 'Physical banknote washing, coin polishing, and an unreasonable attention to detail. Explore a fictional currency-cleaning institute.'],
  ['about', 'about', 'About Us — Real Money Washers', 'Meet the fictional institute with an excessive commitment to the condition of your currency.'],
  ['services', 'services', 'Services — Real Money Washers', 'Banknote washing, coin polishing, and bulk cash care. Explore the treatments and illustrative prices.'],
  ['contact', 'contact', 'Request a Wash — Real Money Washers', 'Create your fictional currency wash request and collection receipt, entirely in your browser.']
];
const header = await readFile(path.join(src, 'header.html'), 'utf8');
const footer = await readFile(path.join(src, 'footer.html'), 'utf8');
await rm(out, { recursive: true, force: true });
await mkdir(path.join(out, 'assets'), { recursive: true });
await cp(path.join(root, 'public'), out, { recursive: true, filter: p => !p.endsWith('.json') });
for (const style of ['styles.css', 'pages.css']) await cp(path.join(src, style), path.join(out, 'assets', style));
for (const script of ['main.js', 'contact.js']) await cp(path.join(src, script), path.join(out, 'assets', script));
const esc = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
for (const [name, key, title, description] of pages) {
  const content = await readFile(path.join(src, 'pages', name + '.html'), 'utf8');
  const activeHeader = header.replace(/\{\{active:(\w+)\}\}/g, (_, p) => p === key ? 'aria-current="page"' : '')
    .replace(/<a\b([^>]*data-page=["']([^"']+)["'][^>]*)>/g, (match, attrs, page) => page === key && !attrs.includes('aria-current') ? '<a' + attrs + ' aria-current="page">' : match);
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#E6EE53">
<meta name="description" content="${esc(description)}">
<meta name="referrer" content="strict-origin-when-cross-origin">
<title>${title}</title>
<link rel="icon" type="image/svg+xml" href="assets/favicon.svg">
<link rel="preload" href="assets/fonts/archivo-black-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/styles.css">
<link rel="stylesheet" href="assets/pages.css">
<script src="assets/main.js" defer></script>
${key === 'contact' ? '<script src="assets/contact.js" defer></script>' : ''}
</head>
<body class="page-${key}">
${activeHeader}
${content}
${footer}
</body>
</html>
`;
  await writeFile(path.join(out, name + '.html'), html);
}
await writeFile(path.join(out, '404.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Specimen not found — Real Money Washers</title><link rel="stylesheet" href="assets/styles.css"><link rel="stylesheet" href="assets/pages.css"><link rel="icon" href="assets/favicon.svg"></head><body><main id="main-content" class="container page-intro"><h1>Specimen not found.</h1><p>This page appears to have gone through the wash. Return to the institute and begin again.</p><a class="button" href="index.html">Return home</a></main></body></html>`);
console.log('Built 4 pages and a 404 page in dist/.');

