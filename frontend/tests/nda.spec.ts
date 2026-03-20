import { test, expect, Page } from "@playwright/test";

const MOCK_REPLY = "Got it! Can you share the names and companies of both parties?";

function mockChat(page: Page, fields: Record<string, unknown> = {}, suggestedDocType?: string) {
  return page.route("**/chat", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        reply: MOCK_REPLY,
        fields,
        suggested_document_type: suggestedDocType ?? null,
      }),
    });
  });
}

test.describe("Home page — document selection", () => {
  test("home page loads with AI chat and document type cards", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Legal Document Assistant" })).toBeVisible();
    await expect(page.getByText("Available Document Types")).toBeVisible();
  });

  test("all 12 document type cards are visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Mutual NDA A standard mutual" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Cloud Service Agreement/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Service Level Agreement/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Design Partner Agreement/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Professional Services/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Data Processing/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Partnership Agreement/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Software License/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Pilot Agreement/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Business Associate/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /AI Addendum/ })).toBeVisible();
  });

  test("clicking a document card navigates to its creation page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Mutual NDA/ }).first().click();
    await expect(page).toHaveURL(/\/document\/mutual-nda/);
  });

  test("initial greeting is visible in home chat", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("I can help you find and create the right legal document")).toBeVisible();
  });

  test("AI suggestion routes to document page", async ({ page }) => {
    await mockChat(page, {}, "mutual-nda");
    await page.goto("/");
    await page.getByLabel("Chat message").fill("I need an NDA");
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page).toHaveURL(/\/document\/mutual-nda/, { timeout: 5000 });
  });
});

test.describe("NDA Creator — layout and initial state", () => {
  test("page loads with chat panel and preview visible", async ({ page }) => {
    await page.goto("/document/mutual-nda");
    await expect(page.getByRole("heading", { name: "Mutual NDA Creator" })).toBeVisible();
    await expect(page.getByText("Live Preview")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Mutual Non-Disclosure Agreement" })).toBeVisible();
  });

  test("initial AI greeting is visible", async ({ page }) => {
    await page.goto("/document/mutual-nda");
    await expect(page.getByText("I can help you create a Mutual NDA")).toBeVisible();
  });

  test("chat input is present", async ({ page }) => {
    await page.goto("/document/mutual-nda");
    await expect(page.getByLabel("Chat message")).toBeVisible();
  });

  test("send button is present", async ({ page }) => {
    await page.goto("/document/mutual-nda");
    await expect(page.getByRole("button", { name: "Send" })).toBeVisible();
  });

  test("download buttons are visible", async ({ page }) => {
    await page.goto("/document/mutual-nda");
    await expect(page.getByRole("button", { name: "Download .md" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Print / Save PDF" })).toBeVisible();
  });

  test("document preview shows default placeholder text", async ({ page }) => {
    await page.goto("/document/mutual-nda");
    await expect(page.locator(".prose").first()).toContainText("[State not specified]");
  });
});

test.describe("NDA Creator — chat interaction", () => {
  test("typing in the chat input works", async ({ page }) => {
    await page.goto("/document/mutual-nda");
    const input = page.getByLabel("Chat message");
    await input.fill("Evaluating a potential merger");
    await expect(input).toHaveValue("Evaluating a potential merger");
  });

  test("send button is disabled when input is empty", async ({ page }) => {
    await page.goto("/document/mutual-nda");
    await expect(page.getByRole("button", { name: "Send" })).toBeDisabled();
  });

  test("send button becomes enabled when input has text", async ({ page }) => {
    await page.goto("/document/mutual-nda");
    await page.getByLabel("Chat message").fill("Hello");
    await expect(page.getByRole("button", { name: "Send" })).toBeEnabled();
  });

  test("sending a message adds it to the chat", async ({ page }) => {
    await mockChat(page);
    await page.goto("/document/mutual-nda");
    await page.getByLabel("Chat message").fill("Evaluating a potential merger");
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.getByText("Evaluating a potential merger")).toBeVisible();
  });

  test("AI response appears after sending a message", async ({ page }) => {
    await mockChat(page);
    await page.goto("/document/mutual-nda");
    await page.getByLabel("Chat message").fill("Hello");
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.getByText(MOCK_REPLY)).toBeVisible();
  });

  test("input clears after sending", async ({ page }) => {
    await mockChat(page);
    await page.goto("/document/mutual-nda");
    const input = page.getByLabel("Chat message");
    await input.fill("Hello");
    await page.getByRole("button", { name: "Send" }).click();
    await expect(input).toHaveValue("");
  });

  test("Enter key sends the message", async ({ page }) => {
    await mockChat(page);
    await page.goto("/document/mutual-nda");
    await page.getByLabel("Chat message").fill("Hello");
    await page.getByLabel("Chat message").press("Enter");
    await expect(page.getByText(MOCK_REPLY)).toBeVisible();
  });

  test("mocked field update from AI refreshes the document preview", async ({ page }) => {
    await mockChat(page, { purpose: "Joint product development for AI tools" });
    await page.goto("/document/mutual-nda");
    await page.getByLabel("Chat message").fill("Our purpose is joint product development");
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.locator(".prose").first()).toContainText("Joint product development for AI tools");
  });

  test("mocked governing law update reflects in document preview", async ({ page }) => {
    await mockChat(page, { governingLaw: "California" });
    await page.goto("/document/mutual-nda");
    await page.getByLabel("Chat message").fill("We want California law");
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.locator(".prose").first()).toContainText("California");
  });
});

test.describe("NDA Creator — download", () => {
  test("Download .md triggers a file download", async ({ page }) => {
    await page.goto("/document/mutual-nda");
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Download .md" }).click(),
    ]);
    expect(download.suggestedFilename()).toBe("Mutual-NDA.md");
  });
});

test.describe("Other document types", () => {
  test("CSA page loads with correct title and preview", async ({ page }) => {
    await page.goto("/document/csa");
    await expect(page.getByRole("heading", { name: "Cloud Service Agreement Creator" })).toBeVisible();
    await expect(page.getByText("Live Preview")).toBeVisible();
  });

  test("Pilot Agreement page loads correctly", async ({ page }) => {
    await page.goto("/document/pilot");
    await expect(page.getByRole("heading", { name: "Pilot Agreement Creator" })).toBeVisible();
    await expect(page.locator(".prose").first()).toContainText("Pilot Agreement");
  });

  test("BAA page loads correctly", async ({ page }) => {
    await page.goto("/document/baa");
    await expect(page.getByRole("heading", { name: "Business Associate Agreement Creator" })).toBeVisible();
  });

  test("invalid document slug shows 404", async ({ page }) => {
    const response = await page.goto("/document/nonexistent-doc");
    expect(response?.status()).toBe(404);
  });

  test("CSA field update reflects in preview", async ({ page }) => {
    await mockChat(page, { subscriptionPeriod: "12 months", fees: "$5,000/month" });
    await page.goto("/document/csa");
    await page.getByLabel("Chat message").fill("12 month subscription, $5,000 per month");
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.locator(".prose").first()).toContainText("12 months");
  });
});
