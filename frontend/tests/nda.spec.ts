import { test, expect, Page } from "@playwright/test";

const MOCK_REPLY = "Got it! Can you share the names and companies of both parties?";

function mockChat(page: Page, fields: Record<string, unknown> = {}) {
  return page.route("**/chat", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ reply: MOCK_REPLY, fields }),
    });
  });
}

test.describe("NDA Creator — layout and initial state", () => {
  test("page loads with chat panel and preview visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Mutual NDA Creator" })).toBeVisible();
    await expect(page.getByText("Live Preview")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Mutual Non-Disclosure Agreement" })).toBeVisible();
  });

  test("initial AI greeting is visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("I can help you create a Mutual Non-Disclosure Agreement")).toBeVisible();
  });

  test("chat input is present", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByLabel("Chat message")).toBeVisible();
  });

  test("send button is present", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Send" })).toBeVisible();
  });

  test("download buttons are visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Download .md" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Print / Save PDF" })).toBeVisible();
  });

  test("document preview shows default placeholder text", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".prose").first()).toContainText("[State not specified]");
  });
});

test.describe("NDA Creator — chat interaction", () => {
  test("typing in the chat input works", async ({ page }) => {
    await page.goto("/");
    const input = page.getByLabel("Chat message");
    await input.fill("Evaluating a potential merger");
    await expect(input).toHaveValue("Evaluating a potential merger");
  });

  test("send button is disabled when input is empty", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Send" })).toBeDisabled();
  });

  test("send button becomes enabled when input has text", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Chat message").fill("Hello");
    await expect(page.getByRole("button", { name: "Send" })).toBeEnabled();
  });

  test("sending a message adds it to the chat", async ({ page }) => {
    await mockChat(page);
    await page.goto("/");
    await page.getByLabel("Chat message").fill("Evaluating a potential merger");
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.getByText("Evaluating a potential merger")).toBeVisible();
  });

  test("AI response appears after sending a message", async ({ page }) => {
    await mockChat(page);
    await page.goto("/");
    await page.getByLabel("Chat message").fill("Hello");
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.getByText(MOCK_REPLY)).toBeVisible();
  });

  test("input clears after sending", async ({ page }) => {
    await mockChat(page);
    await page.goto("/");
    const input = page.getByLabel("Chat message");
    await input.fill("Hello");
    await page.getByRole("button", { name: "Send" }).click();
    await expect(input).toHaveValue("");
  });

  test("Enter key sends the message", async ({ page }) => {
    await mockChat(page);
    await page.goto("/");
    await page.getByLabel("Chat message").fill("Hello");
    await page.getByLabel("Chat message").press("Enter");
    await expect(page.getByText(MOCK_REPLY)).toBeVisible();
  });

  test("mocked field update from AI refreshes the document preview", async ({ page }) => {
    await mockChat(page, { purpose: "Joint product development for AI tools" });
    await page.goto("/");
    await page.getByLabel("Chat message").fill("Our purpose is joint product development");
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.locator(".prose").first()).toContainText("Joint product development for AI tools");
  });

  test("mocked governing law update reflects in both cover page and standard terms", async ({ page }) => {
    await mockChat(page, { governingLaw: "California" });
    await page.goto("/");
    await page.getByLabel("Chat message").fill("We want California law");
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.locator(".prose").first()).toContainText("California");
    await expect(page.locator(".prose").last()).toContainText("California");
  });
});

test.describe("NDA Creator — download", () => {
  test("Download .md triggers a file download", async ({ page }) => {
    await page.goto("/");
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Download .md" }).click(),
    ]);
    expect(download.suggestedFilename()).toBe("Mutual-NDA.md");
  });
});
