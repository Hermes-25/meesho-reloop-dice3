import {build} from 'esbuild';
import {mkdir,cp,writeFile} from 'node:fs/promises';
await mkdir('dist/assets',{recursive:true});
await build({entryPoints:['src/main.jsx'],bundle:true,minify:true,format:'esm',target:['es2022'],outfile:'dist/assets/app.js',jsxFactory:'localizedElement',inject:['src/i18n.jsx'],define:{'process.env.NODE_ENV':'"production"'}});
await cp('public','dist',{recursive:true});
await writeFile('dist/index.html','<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#9f2089"><title>Meesho concept — ReLoop + Source</title><meta name="description" content="Recover value from leftover stock and source your next order."><link rel="icon" href="/favicon.svg"><link rel="manifest" href="/manifest.webmanifest"><link rel="stylesheet" href="/assets/app.css"></head><body><div id="root"></div><script type="module" src="/assets/app.js"></script></body></html>');
