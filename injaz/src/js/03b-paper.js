/* ========== أوراق المذاكرة: سطور ومربعات (ألوانها قابلة للتغيير) ========== */
const PGRAIN="url(data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%27240%27%20height=%27240%27%3E%3Cfilter%20id=%27n%27%3E%3CfeTurbulence%20type=%27fractalNoise%27%20baseFrequency=%27.8%27%20numOctaves=%273%27%20stitchTiles=%27stitch%27/%3E%3CfeColorMatrix%20values=%270%200%200%200%20.35%200%200%200%200%20.30%200%200%200%200%20.22%200%200%200%20.09%200%27/%3E%3C/filter%3E%3Crect%20width=%27100%25%27%20height=%27100%25%27%20filter=%27url%28%23n%29%27/%3E%3C/svg%3E) 0 0/240px 240px,radial-gradient(ellipse at 50% 40%,transparent 55%,rgba(120,100,60,.10) 100%),";
const PAPERS=[
  {id:'ruled',n:'ورقة سطور',k:'l',p:'#f6f1e3',l:'#a9c3dc',m:'#d98a8a'},
  {id:'ruledw',n:'ورقة بيضاء',k:'l',p:'#fbfbf8',l:'#b8cde0',m:'#e3a0a0'},
  {id:'legal',n:'ورقة صفراء',k:'l',p:'#f7e9a0',l:'#c9b66a',m:'#d9806a'},
  {id:'gridp',n:'ورق مربعات',k:'g',p:'#f9f7ee',l:'#b9cde0',m:''},
  {id:'dotted',n:'ورق منقّط',k:'d',p:'#f1ead9',l:'#b9ae94',m:''}
];
function paperBg(o,t){
  t=t||{};const p=t.paper||o.p,l=t.line||o.l,m=t.margin||o.m;
  if(o.k==='d')return "radial-gradient("+l+" 1.3px,transparent 1.4px) 0 0/24px 24px,"+p;
  if(o.k==='g')return PGRAIN+"linear-gradient("+l+" 1px,transparent 1px) 0 0/30px 30px,linear-gradient(90deg,"+l+" 1px,transparent 1px) 0 0/30px 30px,"+p;
  return PGRAIN+"linear-gradient(to left,transparent 54px,"+m+" 54px,"+m+" 56px,transparent 56px),repeating-linear-gradient("+p+" 0,"+p+" 35px,"+l+" 35px,"+l+" 36px)";
}
PAPERS.slice().reverse().forEach(o=>SKINS.unshift({id:o.id,n:o.n,bg:paperBg(o),pk:o,g:'paper',tc:o.p,acc2:'#e0b970',lt:1}));

