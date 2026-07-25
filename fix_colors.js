const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const targetDirs = [
  path.join(__dirname, 'src/app/(dashboard)/student'),
  path.join(__dirname, 'src/components')
];

let files = [];
targetDirs.forEach(d => {
  if (fs.existsSync(d)) {
    walkDir(d, (filePath) => {
      if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
        files.push(filePath);
      }
    });
  }
});

let modifiedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Remove bg-white from Cards (and generally, as bg-background/card is better)
  // Actually, just replace bg-white with bg-background or remove it if in Card.
  // We'll replace bg-white with bg-card if it's on a Card, but simple regex:
  // "bg-white" -> "" if we assume Shadcn UI defaults handle it.
  // Wait, let's just safely map:
  content = content.replace(/\bbg-white\b/g, 'bg-background');
  
  // text-slate-900 -> text-foreground
  content = content.replace(/\btext-slate-900\b/g, 'text-foreground');
  
  // text-slate-800 -> text-foreground
  content = content.replace(/\btext-slate-800\b/g, 'text-foreground');
  
  // text-slate-700 -> text-foreground/90
  content = content.replace(/\btext-slate-700\b/g, 'text-foreground/90');
  
  // text-slate-600 -> text-muted-foreground
  content = content.replace(/\btext-slate-600\b/g, 'text-muted-foreground');
  
  // text-slate-500 -> text-muted-foreground
  content = content.replace(/\btext-slate-500\b/g, 'text-muted-foreground');
  
  // text-slate-400 -> text-muted-foreground/80
  content = content.replace(/\btext-slate-400\b/g, 'text-muted-foreground/80');
  
  // bg-slate-50 -> bg-muted/50
  content = content.replace(/\bbg-slate-50\b/g, 'bg-muted/50');
  
  // bg-slate-100 -> bg-muted
  content = content.replace(/\bbg-slate-100\b/g, 'bg-muted');
  
  // bg-slate-200 -> bg-muted-foreground/20
  content = content.replace(/\bbg-slate-200\b/g, 'bg-muted-foreground/20');
  
  // border-slate-200 -> border-border
  content = content.replace(/\bborder-slate-200\b/g, 'border-border');
  
  // border-slate-100 -> border-border/50
  content = content.replace(/\bborder-slate-100\b/g, 'border-border/50');

  // Specific fix for bg-background inside Card className since Card already has bg-card
  content = content.replace(/Card className="([^"]*)bg-background([^"]*)"/g, 'Card className="$1$2"');
  content = content.replace(/Card key=\{([^}]+)\} className="([^"]*)bg-background([^"]*)"/g, 'Card key={$1} className="$2$3"');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    modifiedCount++;
  }
});

console.log(`Modified ${modifiedCount} files for dark mode theme compatibility.`);
