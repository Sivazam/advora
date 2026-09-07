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

async function run() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();

  // Admin Session
  const adminToken = await createToken({
    userId: '8e306a3d-c536-4fb9-8203-8d9e18b35b52',
    phone: '+919493395299',
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    firstName: 'Advora',
    lastName: 'Super Admin'
  });

  await page.setCookie({
    name: 'advora_session',
    value: adminToken,
    domain: 'localhost',
    path: '/',
    httpOnly: true
  });

  console.log('5. Capturing Admin Client Details view...');
  await page.goto('http://localhost:3000/portal/admin', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  // Click View Details on first client
  const viewButtons = await page.$$('button');
  for (const b of viewButtons) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes('View Details')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(outDir, '05_admin_client_details.png'), fullPage: true });

  // Look for status update modal
  console.log('6. Capturing Admin Update Status Modal...');
  // Find the Edit / Update status button
  await page.evaluate(() => {
    const editBtns = Array.from(document.querySelectorAll('button'));
    const btn = editBtns.find(b => b.textContent?.includes('Update Status') || b.title?.includes('Edit'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(outDir, '06_admin_status_modal.png'), fullPage: true });

  // Client Modals
  const clientToken = await createToken({
    userId: '4d14abd3-8227-42cf-9b20-a1faeee66f58',
    phone: '+919014882779',
    role: 'CLIENT',
    status: 'ACTIVE',
    firstName: 'shiv',
    lastName: 'sai'
  });

  await page.deleteCookie({ name: 'advora_session', domain: 'localhost' });
  await page.setCookie({
    name: 'advora_session',
    value: clientToken,
    domain: 'localhost',
    path: '/',
    httpOnly: true
  });

  console.log('7. Capturing Client Add Year Modal...');
  await page.goto('http://localhost:3000/portal/client', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const addYearBtn = btns.find(b => b.textContent?.includes('Add Year'));
    if (addYearBtn) addYearBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outDir, '07_client_add_year_modal.png'), fullPage: true });

  console.log('8. Capturing Client New Inquiry Modal...');
  // Close previous modal by pressing Escape or clicking outside
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 400));
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const newInquiryBtn = btns.find(b => b.textContent?.includes('New Inquiry'));
    if (newInquiryBtn) newInquiryBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outDir, '08_client_new_inquiry_modal.png'), fullPage: true });

  await browser.close();
  console.log('Done capturing detailed screenshots!');
}

run().catch(console.error);
