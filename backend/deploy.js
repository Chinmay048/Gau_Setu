#!/usr/bin/env node

/**
 * Vercel Backend Deployment Helper
 * Run this script to deploy your backend to Vercel quickly
 * Usage: node deploy.js
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, { stdio: 'inherit', shell: true });
    process.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Command failed with exit code ${code}`));
    });
  });
}

async function deploy() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'blue');
  log('║         🚀 VERCEL BACKEND DEPLOYMENT HELPER               ║', 'blue');
  log('╚════════════════════════════════════════════════════════════╝\n', 'blue');

  try {
    // Check if vercel CLI is installed
    log('1️⃣  Checking Vercel CLI...', 'yellow');
    try {
      await runCommand('vercel', ['--version']);
    } catch (e) {
      log('   Installing Vercel CLI...', 'yellow');
      await runCommand('npm', ['install', '-g', 'vercel']);
    }

    // Check .env file
    log('\n2️⃣  Checking environment configuration...', 'yellow');
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) {
      log('   ⚠️  .env file not found. Creating from .env.example...', 'yellow');
      const examplePath = path.join(__dirname, '.env.example');
      if (fs.existsSync(examplePath)) {
        fs.copyFileSync(examplePath, envPath);
        log('   ✅ .env created from example', 'green');
      }
    } else {
      log('   ✅ .env file found', 'green');
    }

    // Deploy to Vercel
    log('\n3️⃣  Deploying to Vercel...', 'yellow');
    log('   (You may need to authorize and create a project)\n', 'yellow');
    
    await runCommand('vercel', ['--prod']);

    log('\n✅ Deployment successful!', 'green');
    log('\n📊 Next steps:', 'green');
    log('   1. Go to Vercel Dashboard: https://vercel.com/dashboard', 'yellow');
    log('   2. Find your "gau-setu-backend" project', 'yellow');
    log('   3. Go to Settings → Environment Variables', 'yellow');
    log('   4. Add these variables:', 'yellow');
    log('      - JWT_SECRET: (check your .env file)', 'blue');
    log('      - FRONTEND_URL: https://Chinmay048.github.io/Gau_Setu/', 'blue');
    log('      - NODE_ENV: production', 'blue');
    log('   5. Redeploy after adding environment variables', 'yellow');
    log('\n✨ Your backend will be live at:', 'green');
    log('   https://gau-setu-backend.vercel.app/api/', 'blue');

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    log('\nTroubleshooting:', 'yellow');
    log('   • Make sure you have Node.js installed', 'yellow');
    log('   • Run: npm install -g vercel', 'yellow');
    log('   • Then: vercel login', 'yellow');
    log('   • Then: node deploy.js', 'yellow');
    process.exit(1);
  }
}

deploy();
