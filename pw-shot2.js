
const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({width: 1280, height: 800});
  await page.goto('file:///root/codes/oma-games/tank.html');
  
  // Wait for canvas to have non-black content (game start screen should render quickly)
  await page.waitForFunction(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return false;
    const ctx = canvas.getContext('2d');
    // Sample multiple points to find any non-black content
    const w = canvas.width, h = canvas.height;
    for (let x = 0; x < w; x += 50) {
      for (let y = 0; y < h; y += 50) {
        const p = ctx.getImageData(x, y, 1, 1).data;
        if (p[0] > 20 || p[1] > 20 || p[2] > 15) return true;
      }
    }
    return false;
  }, { timeout: 10000 }).catch(() => console.log('Timeout waiting for canvas content'));

  // Wait a bit more for full render
  await page.waitForTimeout(1000);

  // Get canvas as data URL and save
  const startDataUrl = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    return canvas.toDataURL('image/png');
  });
  
  // Convert data URL to buffer and save
  const startBuf = Buffer.from(startDataUrl.split(',')[1], 'base64');
  fs.writeFileSync('/root/codes/oma-games/screenshot-tank-start.png', startBuf);
  console.log('Start screenshot:', startBuf.length, 'bytes');

  // Now start the game
  await page.keyboard.press('Enter');
  
  // Wait for game to render
  await page.waitForTimeout(3000);
  
  // Get game screenshot
  const playDataUrl = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    return canvas.toDataURL('image/png');
  });
  
  const playBuf = Buffer.from(playDataUrl.split(',')[1], 'base64');
  fs.writeFileSync('/root/codes/oma-games/screenshot-tank-play.png', playBuf);
  console.log('Play screenshot:', playBuf.length, 'bytes');

  await browser.close();
  console.log('Done');
})().catch(e => { console.error(e.message); process.exit(1); });
