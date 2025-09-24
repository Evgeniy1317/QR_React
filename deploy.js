import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Starting deployment to GitHub Pages...');

try {
  // Build the project
  console.log('📦 Building project...');
  execSync('npm run build', { stdio: 'inherit' });

  // Check if dist directory exists
  if (!fs.existsSync('dist')) {
    throw new Error('dist directory not found. Build failed.');
  }

  // Create gh-pages branch if it doesn't exist
  console.log('🌿 Setting up gh-pages branch...');
  try {
    execSync('git checkout gh-pages', { stdio: 'inherit' });
  } catch (error) {
    // Branch doesn't exist, create it
    execSync('git checkout -b gh-pages', { stdio: 'inherit' });
  }

  // Copy dist contents to root
  console.log('📁 Copying dist contents...');
  const distFiles = fs.readdirSync('dist');
  
  // Remove all files except .git
  const filesToKeep = ['.git', '.gitignore'];
  const allFiles = fs.readdirSync('.');
  allFiles.forEach(file => {
    if (!filesToKeep.includes(file)) {
      if (fs.statSync(file).isDirectory()) {
        fs.rmSync(file, { recursive: true, force: true });
      } else {
        fs.unlinkSync(file);
      }
    }
  });

  // Copy dist contents
  distFiles.forEach(file => {
    const srcPath = path.join('dist', file);
    const destPath = file;
    if (fs.statSync(srcPath).isDirectory()) {
      fs.cpSync(srcPath, destPath, { recursive: true });
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });

  // Add all files
  console.log('📝 Adding files to git...');
  execSync('git add .', { stdio: 'inherit' });

  // Commit
  const commitMessage = `Deploy: ${new Date().toISOString()}`;
  execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });

  // Push to gh-pages
  console.log('⬆️ Pushing to gh-pages...');
  execSync('git push origin gh-pages', { stdio: 'inherit' });

  // Switch back to master
  execSync('git checkout master', { stdio: 'inherit' });

  console.log('✅ Deployment completed successfully!');
  console.log('🌐 Your site should be available at: https://evgeniy1317.github.io/QR_React/');

} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}
