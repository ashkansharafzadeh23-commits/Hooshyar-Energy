import express from 'express';
import path from 'path';
import puppeteer from 'puppeteer';

const app = express();
app.use(express.static('dist'));
app.get('*', (req, res) => res.sendFile(path.resolve('dist/index.html')));

const server = app.listen(3002, async () => {
  try {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    
    await page.goto('http://localhost:3002/result', { waitUntil: 'networkidle0' });
    
    // Check if #root is empty
    const rootHtml = await page.$eval('#root', el => el.innerHTML);
    if (!rootHtml) console.log("ROOT IS EMPTY - REACT CRASHED!");
    else console.log("ROOT HAS CONTENT");
    
    await browser.close();
  } catch (err) {
    console.error(err);
  } finally {
    server.close();
  }
});
