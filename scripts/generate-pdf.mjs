import { chromium } from '@playwright/test';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import { mkdirSync } from 'fs';

const execAsync = promisify(exec);
const PREVIEW_URL = 'http://localhost:4321/resume-md/';
const OUTPUT_PATH = './pdf/resume.pdf';

async function waitForServer(url, maxRetries = 30) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await fetch(url);
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  throw new Error('プレビューサーバーが起動しませんでした');
}

mkdirSync('./pdf', { recursive: true });

console.log('ビルド中...');
await execAsync('pnpm build', { cwd: process.cwd() });
console.log('ビルド完了');

const previewProcess = spawn('pnpm', ['preview'], {
  cwd: process.cwd(),
  stdio: 'ignore',
  detached: false,
});

const browser = await chromium.launch();
try {
  console.log('プレビューサーバー起動待機中...');
  await waitForServer(PREVIEW_URL);

  const page = await browser.newPage();
  await page.goto(PREVIEW_URL);
  await page.waitForLoadState('networkidle');

  await page.evaluate(() => {
    document.querySelectorAll('details').forEach((el) => {
      el.open = true;
    });
  });

  await page.pdf({
    path: OUTPUT_PATH,
    format: 'A4',
    printBackground: true,
    scale: 0.85,
    margin: { top: '15mm', bottom: '15mm', left: '15mm', right: '15mm' },
  });

  console.log(`PDF生成完了: ${OUTPUT_PATH}`);
} finally {
  await browser.close();
  previewProcess.kill();
}
