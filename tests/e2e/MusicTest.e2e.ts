import { expect, test } from '@playwright/test';

test.describe('Music Test Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/music-test');
  });

  test('should display the main music test page', async ({ page }) => {
    // Check page title and header
    await expect(page).toHaveTitle(/Music Note Identification/);
    await expect(page.getByRole('heading', { name: 'Music Note Identification' })).toBeVisible();

    // Check navigation tabs
    await expect(page.getByRole('tab', { name: /Game/ })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Settings/ })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Statistics/ })).toBeVisible();
  });

  test('should have proper navigation in header', async ({ page }) => {
    // Check that music test link exists in navigation
    await expect(page.getByRole('link', { name: /Music Test/ })).toBeVisible();
  });

  test('should switch between tabs correctly', async ({ page }) => {
    // Game tab should be active by default
    await expect(page.getByRole('tab', { name: /Game/ })).toHaveAttribute('aria-selected', 'true');

    // Switch to Settings tab
    await page.getByRole('tab', { name: /Settings/ }).click();
    await expect(page.getByRole('tab', { name: /Settings/ })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByText('Game Settings')).toBeVisible();

    // Switch to Statistics tab
    await page.getByRole('tab', { name: /Statistics/ }).click();
    await expect(page.getByRole('tab', { name: /Statistics/ })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByText('Your Progress')).toBeVisible();

    // Switch back to Game tab
    await page.getByRole('tab', { name: /Game/ }).click();
    await expect(page.getByRole('tab', { name: /Game/ })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByText('Start New Round')).toBeVisible();
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Focus on the page
    await page.keyboard.press('Tab');

    // Test Alt+2 for Settings
    await page.keyboard.press('Alt+2');
    await expect(page.getByRole('tab', { name: /Settings/ })).toHaveAttribute('aria-selected', 'true');

    // Test Alt+3 for Statistics
    await page.keyboard.press('Alt+3');
    await expect(page.getByRole('tab', { name: /Statistics/ })).toHaveAttribute('aria-selected', 'true');

    // Test Alt+1 for Game
    await page.keyboard.press('Alt+1');
    await expect(page.getByRole('tab', { name: /Game/ })).toHaveAttribute('aria-selected', 'true');
  });

  test('should display accessibility information', async ({ page }) => {
    // Check keyboard shortcuts info
    await expect(page.getByText('Keyboard shortcuts:')).toBeVisible();
    await expect(page.getByText('Alt+1: Game • Alt+2: Settings • Alt+3: Statistics')).toBeVisible();

    // Check accessibility footer
    await expect(page.getByText('This application is designed to be accessible to all users')).toBeVisible();
    await expect(page.getByText('Screen reader compatible')).toBeVisible();
    await expect(page.getByText('Keyboard navigation supported')).toBeVisible();
    await expect(page.getByText('Touch-friendly on mobile')).toBeVisible();
  });

  test('should render game components correctly', async ({ page }) => {
    // Should show game interface by default
    await expect(page.getByText('Start New Round')).toBeVisible();
    await expect(page.getByText('Music Note Identification')).toBeVisible();

    // Should show difficulty selector
    await expect(page.getByText('Number of notes:')).toBeVisible();
    await expect(page.getByRole('combobox')).toBeVisible();
  });

  test('should render settings panel correctly', async ({ page }) => {
    await page.getByRole('tab', { name: /Settings/ }).click();

    // Check settings components
    await expect(page.getByText('Game Settings')).toBeVisible();
    await expect(page.getByText('Difficulty Level')).toBeVisible();
    await expect(page.getByText('Volume:')).toBeVisible();
    await expect(page.getByText('Auto-replay notes')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reset to Defaults' })).toBeVisible();
  });

  test('should render statistics panel correctly', async ({ page }) => {
    await page.getByRole('tab', { name: /Statistics/ }).click();

    // Check statistics components
    await expect(page.getByText('Your Progress')).toBeVisible();

    // Should show either "No games played yet" or actual statistics
    const noGamesText = page.getByText('No games played yet');
    const totalGamesText = page.getByText('Total Games');

    await expect(noGamesText.or(totalGamesText)).toBeVisible();
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that page still renders correctly
    await expect(page.getByRole('heading', { name: 'Music Note Identification' })).toBeVisible();
    await expect(page.getByRole('tablist')).toBeVisible();

    // Tabs should still be clickable
    await page.getByRole('tab', { name: /Settings/ }).click();
    await expect(page.getByText('Game Settings')).toBeVisible();
  });

  test('should handle tab focus correctly', async ({ page }) => {
    // Tab through the interface
    await page.keyboard.press('Tab'); // Skip to first focusable element

    // Should be able to focus on tabs
    const gameTab = page.getByRole('tab', { name: /Game/ });
    await gameTab.focus();
    await expect(gameTab).toBeFocused();

    // Arrow keys should work when focused on tablist
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('tab', { name: /Settings/ })).toHaveAttribute('aria-selected', 'true');
  });

  test('should maintain proper ARIA attributes', async ({ page }) => {
    // Check tablist ARIA attributes
    const tablist = page.getByRole('tablist');
    await expect(tablist).toHaveAttribute('aria-label', 'Music test navigation');

    // Check tab ARIA attributes
    const gameTab = page.getByRole('tab', { name: /Game/ });
    await expect(gameTab).toHaveAttribute('aria-selected', 'true');
    await expect(gameTab).toHaveAttribute('aria-controls', 'game-panel');

    // Check tabpanel ARIA attributes
    const tabpanel = page.getByRole('tabpanel');
    await expect(tabpanel).toHaveAttribute('aria-labelledby', 'game-tab');
  });

  test('should work with different locales', async ({ page }) => {
    // Test French locale
    await page.goto('/fr/music-test');

    await expect(page.getByRole('heading', { name: 'Identification des Notes Musicales' })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Jeu/ })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Paramètres/ })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Statistiques/ })).toBeVisible();
  });

  test('should integrate with game controller properly', async ({ page }) => {
    // Should show initial game state
    await expect(page.getByText('Start New Round')).toBeVisible();

    // Should show difficulty selection
    await expect(page.getByText('Number of notes:')).toBeVisible();

    // Should show score display
    await expect(page.getByText('Score: 0/0')).toBeVisible();
  });

  test('should handle settings changes across tabs', async ({ page }) => {
    // Go to settings and change difficulty
    await page.getByRole('tab', { name: /Settings/ }).click();
    await page.selectOption('select', '4'); // Change to 4 notes

    // Go back to game tab
    await page.getByRole('tab', { name: /Game/ }).click();

    // Should reflect the difficulty change
    await expect(page.getByText('Difficulty: 4 notes')).toBeVisible();
  });
});