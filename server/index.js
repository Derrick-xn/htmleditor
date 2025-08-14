// Minimal high-fidelity PDF server using Puppeteer
// Run: npm i express cors puppeteer && node index.js

const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

let browser;
async function getBrowser() {
  if (browser) return browser;
  const puppeteer = require('puppeteer');

  // Try strategies in order for maximum compatibility
  const strategies = [
    async () => puppeteer.launch({ headless: true, channel: 'chrome', args: ['--no-sandbox', '--disable-setuid-sandbox'] }),
    async () => puppeteer.launch({ headless: true, executablePath: puppeteer.executablePath(), args: ['--no-sandbox', '--disable-setuid-sandbox'] }),
    async () => {
      // macOS default Chrome path fallback
      const macChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
      return puppeteer.launch({ headless: true, executablePath: macChrome, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    },
  ];

  let lastErr;
  for (const s of strategies) {
    try {
      browser = await s();
      return browser;
    } catch (e) {
      lastErr = e;
    }
  }
  // If still failing, surface a helpful error
  throw new Error('Failed to launch Chrome/Chromium for Puppeteer. Try: `pnpm exec puppeteer browsers install chromium`\nOriginal: ' + (lastErr && String(lastErr)));
}

app.post('/pdf', async (req, res) => {
  try {
    const { html, options } = req.body || {};
    if (!html) return res.status(400).json({ message: 'html required' });
    const browser = await getBrowser();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: ['load', 'networkidle0'] });
    const pdf = await page.pdf({
      format: (options && options.format) || 'A4',
      printBackground: true,
      margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdf);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'pdf error', error: String(e) });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('PDF server listening on http://localhost:' + port));


