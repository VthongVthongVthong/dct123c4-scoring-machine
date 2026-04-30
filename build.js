const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SRC_DIR = './';
const DIST_DIR = './dist';
const JS_FILES = ['app.js', 'config.js', 'exercises.js'];
const STATIC_FILES = ['index.html', 'styles.css'];
const STATIC_DIRS = ['Images', 'Subject', 'Bugimage'];

// 1. Create dist directory
if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR);
    console.log('✅ Created dist directory');
}

// 2. Minify JS files
console.log('🚀 Minifying JavaScript files...');
JS_FILES.forEach(file => {
    const srcPath = path.join(SRC_DIR, file);
    const distPath = path.join(DIST_DIR, file);
    
    try {
        // -m: mangle (rename variables)
        // -c: compress (optimize code)
        execSync(`npx terser ${srcPath} -o ${distPath} -m -c`);
        console.log(`   - ${file} -> Done`);
    } catch (err) {
        console.error(`   - Error minifying ${file}:`, err.message);
    }
});

// 3. Copy static files
console.log('📂 Copying static files...');
STATIC_FILES.forEach(file => {
    const srcPath = path.join(SRC_DIR, file);
    const distPath = path.join(DIST_DIR, file);
    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, distPath);
        console.log(`   - ${file} -> Copied`);
    }
});

// 4. Copy static directories
console.log('📁 Copying static directories...');
STATIC_DIRS.forEach(dir => {
    const srcPath = path.join(SRC_DIR, dir);
    const distPath = path.join(DIST_DIR, dir);
    
    if (fs.existsSync(srcPath)) {
        // Recursive copy (available in Node.js 16.7.0+)
        fs.cpSync(srcPath, distPath, { recursive: true });
        console.log(`   - ${dir}/ -> Copied`);
    }
});

console.log('\n✨ Build complete! Your production files are in the "dist" folder.');
