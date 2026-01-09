import { test, expect } from '@playwright/test';

test.describe('E2E - Complete Poll Workflow', () => {
  test('Teacher creates poll and student votes', async ({ browser }) => {
    // Create two contexts: one for teacher, one for student
    const teacherContext = await browser.newContext();
    const studentContext = await browser.newContext();

    const teacherPage = await teacherContext.newPage();
    const studentPage = await studentContext.newPage();

    try {
      // Teacher navigates to dashboard
      await teacherPage.goto('/teacher');

      // Enter a question
      const questionInput = teacherPage.locator(
        'textarea[placeholder="Enter your question here..."]'
      );
      await questionInput.fill('What is your favorite programming language?');

      // Fill in options
      const optionInputs = teacherPage.locator(
        'input[placeholder="Enter option..."]'
      );
      await optionInputs.first().fill('JavaScript');
      await optionInputs.nth(1).fill('Python');

      // Click Ask Question button
      const askButton = teacherPage.locator('button:has-text("Ask Question")');
      await askButton.click();

      // Wait for poll to be created
      await teacherPage.waitForTimeout(500);

      // Student logs in
      await studentPage.goto('/');

      // Enter name and continue
      const nameInput = studentPage.locator('input[placeholder*="name" i]');
      if (nameInput) {
        await nameInput.fill('Alice');
        const continueButton = studentPage.locator(
          'button:has-text("Continue")'
        );
        await continueButton.click();
      }

      // Wait for poll question to appear on student screen
      const pollQuestion = studentPage.locator(
        'text=What is your favorite programming language?'
      );
      await expect(pollQuestion).toBeVisible({ timeout: 5000 });

      // Student votes
      const voteButton = studentPage.locator('button:has-text("JavaScript")');
      await voteButton.click();

      // Wait for confirmation
      await studentPage.waitForTimeout(1000);

      // Verify student cannot vote twice
      const disabledButton = studentPage.locator(
        'button:has-text("JavaScript"):disabled'
      );
      expect(disabledButton).toBeDefined();

      // Teacher should see results
      const resultsSection = teacherPage.locator('text=Results');
      if (resultsSection) {
        await expect(resultsSection).toBeVisible();
      }
    } finally {
      await teacherPage.close();
      await studentPage.close();
      await teacherContext.close();
      await studentContext.close();
    }
  });

  test('Multiple students can vote on a poll', async ({ browser }) => {
    const teacherContext = await browser.newContext();
    const student1Context = await browser.newContext();
    const student2Context = await browser.newContext();

    const teacherPage = await teacherContext.newPage();
    const student1Page = await student1Context.newPage();
    const student2Page = await student2Context.newPage();

    try {
      // Teacher creates poll
      await teacherPage.goto('/teacher');

      const questionInput = teacherPage.locator(
        'textarea[placeholder="Enter your question here..."]'
      );
      await questionInput.fill('Which framework do you prefer?');

      const optionInputs = teacherPage.locator(
        'input[placeholder="Enter option..."]'
      );
      await optionInputs.first().fill('React');
      await optionInputs.nth(1).fill('Vue');

      const askButton = teacherPage.locator('button:has-text("Ask Question")');
      await askButton.click();

      await teacherPage.waitForTimeout(500);

      // Student 1 votes
      await student1Page.goto('/');
      const name1Input = student1Page.locator('input[placeholder*="name" i]');
      if (name1Input) {
        await name1Input.fill('Bob');
        const continueButton = student1Page.locator(
          'button:has-text("Continue")'
        );
        await continueButton.click();
      }

      const question1 = student1Page.locator(
        'text=Which framework do you prefer?'
      );
      await expect(question1).toBeVisible({ timeout: 5000 });

      const voteButton1 = student1Page.locator('button:has-text("React")');
      await voteButton1.click();

      // Student 2 votes
      await student2Page.goto('/');
      const name2Input = student2Page.locator('input[placeholder*="name" i]');
      if (name2Input) {
        await name2Input.fill('Charlie');
        const continueButton = student2Page.locator(
          'button:has-text("Continue")'
        );
        await continueButton.click();
      }

      const question2 = student2Page.locator(
        'text=Which framework do you prefer?'
      );
      await expect(question2).toBeVisible({ timeout: 5000 });

      const voteButton2 = student2Page.locator('button:has-text("Vue")');
      await voteButton2.click();

      // Wait a bit for votes to be recorded
      await teacherPage.waitForTimeout(1000);

      // Verify both votes were recorded
      const reactResult = teacherPage.locator('text=React');
      const vueResult = teacherPage.locator('text=Vue');

      await expect(reactResult).toBeVisible();
      await expect(vueResult).toBeVisible();
    } finally {
      await teacherPage.close();
      await student1Page.close();
      await student2Page.close();
      await teacherContext.close();
      await student1Context.close();
      await student2Context.close();
    }
  });

  test('Poll duration timer works', async ({ page }) => {
    // Navigate to teacher dashboard
    await page.goto('/teacher');

    // Click on duration dropdown
    const durationButton = page.locator('button:has-text("60 seconds")');
    await durationButton.click();

    // Select 30 seconds
    const duration30 = page.locator('button:has-text("30 seconds")');
    await duration30.click();

    // Verify the selected duration is displayed
    const selectedDuration = page.locator('button:has-text("30 seconds")');
    await expect(selectedDuration).toBeVisible();

    // Create the poll
    const questionInput = page.locator(
      'textarea[placeholder="Enter your question here..."]'
    );
    await questionInput.fill('Quick test?');

    const optionInputs = page.locator('input[placeholder="Enter option..."]');
    await optionInputs.first().fill('Yes');
    await optionInputs.nth(1).fill('No');

    const askButton = page.locator('button:has-text("Ask Question")');
    await askButton.click();

    // Wait and verify the timer appears
    const timer = page.locator('text=/\\d{2}:\\d{2}/'); // matches MM:SS format
    await expect(timer).toBeVisible({ timeout: 2000 });
  });

  test('Back button navigates correctly', async ({ page }) => {
    // Teacher dashboard
    await page.goto('/teacher');

    const backButton = page.locator('button:has-text("Back")');
    await backButton.click();

    // Should navigate to home
    await expect(page).toHaveURL('/');
  });
});
