const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const appDir = path.join(srcDir, 'app');
const appComponentsDir = path.join(appDir, 'components');

const moves = [
  // Pages
  { file: 'Login.tsx', targetDir: 'pages/auth', depth: 2 },
  { file: 'ForgotPassword.tsx', targetDir: 'pages/auth', depth: 2 },
  { file: 'DashboardAdmin.tsx', targetDir: 'pages/dashboard', depth: 2 },
  { file: 'DashboardStudent.tsx', targetDir: 'pages/dashboard', depth: 2 },
  { file: 'Users.tsx', targetDir: 'pages/dashboard', depth: 2 },
  { file: 'MyBookings.tsx', targetDir: 'pages/booking', depth: 2 },
  { file: 'Approvals.tsx', targetDir: 'pages/booking', depth: 2 },
  { file: 'CalendarView.tsx', targetDir: 'pages/booking', depth: 2 },
  { file: 'DeviceManagement.tsx', targetDir: 'pages/equipment', depth: 2 },
  { file: 'ResourceManagement.tsx', targetDir: 'pages/chemicals', depth: 2 },
  { file: 'Reports.tsx', targetDir: 'pages/reports', depth: 2 },
  
  // Components
  { file: 'Layout.tsx', targetDir: 'components/layout', depth: 2 },
  { file: 'ErrorBoundary.tsx', targetDir: 'components/common', depth: 2 }
];

// Helper to calculate relative path to root src/components
function getRelativeComponentPath(depth) {
  return depth === 2 ? '../../components' : (depth === 1 ? '../components' : './components');
}

// Ensure target dir exists
moves.forEach(m => {
  const tDir = path.join(srcDir, m.targetDir);
  if (!fs.existsSync(tDir)) fs.mkdirSync(tDir, { recursive: true });
  
  const sourceFile = path.join(appComponentsDir, m.file);
  if (fs.existsSync(sourceFile)) {
    let content = fs.readFileSync(sourceFile, 'utf8');
    const compPath = getRelativeComponentPath(m.depth);
    
    // Replace ./ui/ with ../../components/ui/ or ../components/ui/
    content = content.replace(/(['"])(\.\/ui\/.*?)['"]/g, `$1${compPath}/ui/${'$2'.replace('./ui/', '')}$1`);
    // Replace ./figma/
    content = content.replace(/(['"])(\.\/figma\/.*?)['"]/g, `$1${compPath}/figma/${'$2'.replace('./figma/', '')}$1`);
    
    fs.writeFileSync(path.join(tDir, m.file), content);
    console.log(`Moved ${m.file} to ${m.targetDir}`);
    fs.unlinkSync(sourceFile);
  }
});

// Move UI and Figma directories
const copyRecursiveSync = (src, dest) => {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
};

const rmdirRecursiveSync = (dirPath) => {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach((file, index) => {
      const curPath = path.join(dirPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        rmdirRecursiveSync(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(dirPath);
  }
};

['ui', 'figma'].forEach(dir => {
  const sDir = path.join(appComponentsDir, dir);
  const tDir = path.join(srcDir, 'components', dir);
  if (fs.existsSync(sDir)) {
    if (!fs.existsSync(tDir)) fs.mkdirSync(tDir, { recursive: true });
    copyRecursiveSync(sDir, tDir);
    rmdirRecursiveSync(sDir);
    console.log(`Moved ${dir} to components/`);
  }
});

// Move App.tsx and routes.tsx
['App.tsx', 'routes.tsx'].forEach(file => {
  const sourceFile = path.join(appDir, file);
  if (fs.existsSync(sourceFile)) {
    let content = fs.readFileSync(sourceFile, 'utf8');
    
    if (file === 'App.tsx') {
      content = content.replace('./routes', './routes');
    }
    if (file === 'routes.tsx') {
      // Replace imports from ./components/... to the new paths
      moves.forEach(m => {
        const regex = new RegExp(`(['"])(\\.\\/components\\/${m.file.replace('.tsx', '')})(['"])`, 'g');
        content = content.replace(regex, `$1./${m.targetDir}/${m.file.replace('.tsx', '')}$3`);
      });
    }
    
    fs.writeFileSync(path.join(srcDir, file), content);
    console.log(`Moved ${file} to src/`);
    fs.unlinkSync(sourceFile);
  }
});

// Fix main.tsx import
const mainFile = path.join(srcDir, 'main.tsx');
if (fs.existsSync(mainFile)) {
  let content = fs.readFileSync(mainFile, 'utf8');
  content = content.replace('./app/App.tsx', './App.tsx');
  fs.writeFileSync(mainFile, content);
  console.log(`Updated main.tsx`);
}

// Clean up app directory
if (fs.existsSync(appComponentsDir)) {
  const remFiles = fs.readdirSync(appComponentsDir);
  if (remFiles.length === 0) {
    fs.rmdirSync(appComponentsDir);
  } else {
    console.log(`app/components still contains: ${remFiles.join(', ')}`);
  }
}
if (fs.existsSync(appDir)) {
  const remFiles = fs.readdirSync(appDir);
  if (remFiles.length === 0) {
    fs.rmdirSync(appDir);
    console.log(`Removed empty app/ directory`);
  } else {
    console.log(`app/ still contains: ${remFiles.join(', ')}`);
  }
}
