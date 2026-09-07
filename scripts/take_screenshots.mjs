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
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();

  console.log('1. Capturing Public Portal Login (ViewPort 1440x900 - Desktop Screen)...');
  await page.goto('http://localhost:3000/portal', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: path.join(outDir, '01_portal_login.png'), fullPage: false });

  console.log('2. Capturing Public Estimate Page (ViewPort 1440x900 - Desktop Screen)...');
  await page.goto('http://localhost:3000/estimate', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: path.join(outDir, '02_estimate_page.png'), fullPage: false });

  // Client Session Token
  const clientToken = await createToken({
    userId: '4d14abd3-8227-42cf-9b20-a1faeee66f58',
    phone: '+919014882779',
    role: 'CLIENT',
    status: 'ACTIVE',
    firstName: 'shiv',
    lastName: 'sai'
  });

  console.log('3. Testing Session Persistence: navigating to /portal with active session cookie...');
  await page.setCookie({
    name: 'advora_session',
    value: clientToken,
    domain: 'localhost',
    path: '/',
    httpOnly: true
  });

  // Navigate to /portal - should auto-redirect to /portal/client!
  await page.goto('http://localhost:3000/portal', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  const currentUrl = page.url();
  console.log('Redirected to URL:', currentUrl);

  // Check scroll position on /portal/client
  const scrollY = await page.evaluate(() => window.scrollY);
  console.log('Current window.scrollY on dashboard load:', scrollY);

  console.log('4. Capturing Client Portal Dashboard (Initial Load View)...');
  await page.screenshot({ path: path.join(outDir, '04_client_dashboard.png'), fullPage: false });

  await browser.close();
  console.log('All tests completed successfully!');
}

run().catch(console.error);
