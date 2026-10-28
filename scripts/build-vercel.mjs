import{copyFileSync,mkdirSync}from'node:fs';import path from'node:path';
const files=["app.css","app.js","index.html"];for(const file of files){const target=path.join('vercel-public',file);mkdirSync(path.dirname(target),{recursive:true});copyFileSync(file,target);}console.log('Web preparada: '+files.length+' archivos.');
