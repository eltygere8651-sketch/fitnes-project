const fs = require('fs');

let code = fs.readFileSync('src/components/GymMusicPlayer.tsx', 'utf8');

const replacements = [
  {
    from: '<div className="flex px-3 pt-2.5 pb-2.5 gap-2 border-b border-white/5 bg-[#050506]/90 shrink-0 select-none z-10 sticky top-0 backdrop-blur-md overflow-x-auto scrollbar-none no-scrollbar snap-x">',
    to: '<Carousel className="px-3 pt-2.5 pb-2.5 gap-2 border-b border-white/5 bg-[#050506]/90 shrink-0 select-none z-10 sticky top-0 backdrop-blur-md snap-x">',
    closeDist: 20 // Approx number of lines to scan for closing tag
  },
  {
    from: '<div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 scrollbar-none snap-x select-none">',
    to: '<Carousel className="items-center gap-1.5 pb-2 mb-2 snap-x select-none">'
  },
  {
    from: '<div className="flex gap-3 overflow-x-auto pb-4 scrollbar-none snap-x px-2">',
    to: '<Carousel className="gap-3 pb-4 snap-x px-2">'
  },
  {
    from: '<div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">',
    to: '<Carousel className="gap-3 pb-2 snap-x">'
  }
];

let lines = code.split('\n');

for (let r of replacements) {
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(r.from)) {
      lines[i] = lines[i].replace(r.from, r.to);
      // find the matching closing div
      let depth = 1;
      let j = i + 1;
      while (j < lines.length && depth > 0) {
        if (lines[j].includes('<div') && !lines[j].includes('/>')) {
          let countOpen = (lines[j].match(/<div/g) || []).length;
          let countSelfClosing = (lines[j].match(/<div[^>]*\/>/g) || []).length;
          depth += (countOpen - countSelfClosing);
        }
        if (lines[j].includes('</div')) {
          let countClose = (lines[j].match(/<\/div>/g) || []).length;
          depth -= countClose;
        }
        if (depth === 0) {
          lines[j] = lines[j].replace('</div>', '</Carousel>');
          break;
        }
        j++;
      }
    }
  }
}

fs.writeFileSync('src/components/GymMusicPlayer.tsx', lines.join('\n'));
console.log('Replacements completed.');
