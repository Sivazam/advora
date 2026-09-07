import puppeteer from 'puppeteer-core';
import { SignJWT } from 'jose';
import fs from 'fs';
import path from 'path';

const JWT_SECRET = new TextEncoder().encode('advora_super_secure_jwt_secret_key_2026');

async function createToken(payload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(JWT_SECRET);
}

const outDir = path.resolve('public/screenshots');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();

  console.log('1. Capturing Public Portal Login...');
  await page.goto('http://localhost:3000/portal', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: path.join(outDir, '01_portal_login.png'), fullPage: true });

  console.log('2. Capturing Public Estimate Page...');
  await page.goto('http://localhost:3000/estimate', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: path.join(outDir, '02_estimate_page.png'), fullPage: true });

  // Admin Session
  const adminToken = await createToken({
    userId: '8e306a3d-c536-4fb9-8203-8d9e18b35b52',
    phone: '+919493395299',
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    firstName: 'Advora',
    lastName: 'Super Admin'
  });

  console.log('3. Capturing Admin Portal Dashboard...');
  await page.setCookie({
    name: 'advora_session',
    value: adminToken,
    domain: 'localhost',
    path: '/',
    httpOnly: true
  });

  await page.goto('http://localhost:3000/portal/admin', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(outDir, '03_admin_dashboard.png'), fullPage: true });

  // Client Session
  const clientToken = await createToken({
    userId: '4d14abd3-8227-42cf-9b20-a1faeee66f58',
    phone: '+919014882779',
    role: 'CLIENT',
    status: 'ACTIVE',
    firstName: 'shiv',
    lastName: 'sai'
  });

  console.log('4. Capturing Client Portal...');
  await page.deleteCookie({ name: 'advora_session', domain: 'localhost' });
  await page.setCookie({
    name: 'advora_session',
    value: clientToken,
    domain: 'localhost',
    path: '/',
    httpOnly: true
  });

  await page.goto('http://localhost:3000/portal/client', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(outDir, '04_client_dashboard.png'), fullPage: true });

  await browser.close();
  console.log('All screenshots captured in public/screenshots/');
}

run().catch(console.error);
