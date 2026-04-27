import { test, expect } from '@playwright/test';

test.describe('Hardware Layout Geometry', () => {

  test('Vibrato LFO natively sits to the right of Arpeggiator Engine', async ({ page }) => {
    await page.goto('/');

    const arpeggiator = page.locator('text=ARP_LOGIC_GATE').first();
    const vibrato = page.locator('text=VIBRATO_LFO_PATH').first();

    await expect(arpeggiator).toBeVisible();
    await expect(vibrato).toBeVisible();

    const arpBox = await arpeggiator.boundingBox();
    const vibBox = await vibrato.boundingBox();

    expect(arpBox).not.toBeNull();
    expect(vibBox).not.toBeNull();

    if (arpBox && vibBox) {
      // Proves the CSS Grid structure forces Vibrato to stack structurally to the right of Arp
      expect(vibBox.x).toBeGreaterThan(arpBox.x + arpBox.width);
      
      // Proves they are vertically aligned symmetrically in the row
      expect(Math.abs(vibBox.y - arpBox.y)).toBeLessThan(10);
    }
  });

  test('Primary visual layout matches pristine golden master screenshot', async ({ page }) => {
    await page.goto('/');
    
    // Playwright natively saves the first execution image as a standard baseline
    // Every subsequent pipeline run strictly verifies a maximum tolerance difference
    await expect(page).toHaveScreenshot('desktop-hardware-layout.png', {
      maxDiffPixelRatio: 0.05,
      fullPage: true
    });
  });

  test('Navigation Docs link points to official Arduino repo', async ({ page }) => {
    await page.goto('/');
    
    // Attempt to locate the Docs link by its accessible role
    const docsLink = page.getByRole('link', { name: /docs/i });
    
    await expect(docsLink).toBeVisible();
    await expect(docsLink).toHaveAttribute('href', 'https://github.com/Chiptune-Anamnesis/ARDUINO-YM2149F');
    await expect(docsLink).toHaveAttribute('target', '_blank');
  });

});
