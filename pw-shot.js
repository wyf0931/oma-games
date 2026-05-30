
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({width: 1280, height: 800});
  await page.goto('file:///root/codes/oma-games/tank.html');
  
  // Wait longer for canvas to render start screen
  await page.waitForTimeout(4000);

  const box = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) };
  });
  console.log('Canvas box:', JSON.stringify(box));

  // Check if canvas has actual content by sampling pixels
  const hasContent = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return false;
    const ctx = canvas.getContext('2d');
    const data = ctx.getImageData(canvas.width/2, canvas.height/2, 1, 1).data;
    return data[0] + data[1] + data[2] > 0;
  });
  console.log('Has content (center pixel):', hasContent);

  if (box) {
    await page.screenshot({ 
      path: '/root/codes/oma-games/screenshot-tank-start.png',
      clip: { x: box.x, y: box.y, width: box.width, height: box.height }
    });
    const fs = require('fs');
    console.log('Start screenshot:', fs.statSync('/root/codes/oma-games/screenshot-tank-start.png').size, 'bytes');
  }

  // Press R to start game, wait for actual rendering
  await page.keyboard.press('r');
  await page.waitForTimeout(5000);

  // Verify game is running
  const hasContent2 = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return false;
    const ctx = canvas.getContext('2d');
    const data = ctx.getImageData(canvas.width/2, canvas.height/2, 1, 1).data;
    return data[0] + data[1] + data[2] > 0;
  });
  console.log('Has game content (center pixel):', hasContent2);

  const box2 = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) };
  });
  console.log('Canvas box2:', JSON.stringify(box2));

  if (box2) {
    await page.screenshot({ 
      path: '/root/codes/oma-games/screenshot-tank-play.png',
      clip: { x: box2.x, y: box2.y, width: box2.width, height: box2.height }
    });
    const fs = require('fs');
    console.log('Play screenshot:', fs.statSync('/root/codes/oma-games/screenshot-tank-play.png').size, 'bytes');
  }

  await browser.close();
  console.log('Done');
})().catch(e => { console.error(e.message); process.exit(1); });
