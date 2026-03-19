import { test, expect } from "@playwright/test";

test.describe("NDA Creator — layout and initial state", () => {
  test("page loads with both panels visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Mutual NDA Creator" })).toBeVisible();
    await expect(page.getByText("Live Preview")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Mutual Non-Disclosure Agreement" })).toBeVisible();
  });

  test("default effective date matches today's local date", async ({ page }) => {
    await page.goto("/");
    const today = new Date();
    const expected = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    await expect(page.locator('input[type="date"]')).toHaveValue(expected);
  });

  test("default purpose is pre-filled", async ({ page }) => {
    await page.goto("/");
    const textarea = page.getByPlaceholder("e.g. Evaluating whether to enter into a business relationship...");
    await expect(textarea).toHaveValue("Evaluating whether to enter into a business relationship with the other party.");
  });

  test("default MNDA term radio is 'expires'", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("radio", { name: /Expires after/i })).toBeChecked();
    await expect(page.getByRole("radio", { name: /Continues until terminated/i })).not.toBeChecked();
  });

  test("download buttons are visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Download .md" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Print / Save PDF" })).toBeVisible();
  });
});

test.describe("NDA Creator — live preview updates", () => {
  test("typing in Purpose updates the preview instantly", async ({ page }) => {
    await page.goto("/");
    const purposeField = page.getByPlaceholder("e.g. Evaluating whether to enter into a business relationship...");
    await purposeField.fill("Testing a new AI integration");
    await expect(page.locator(".prose").first()).toContainText("Testing a new AI integration");
  });

  test("purpose value propagates into Standard Terms sections 1 and 2", async ({ page }) => {
    await page.goto("/");
    const purposeField = page.getByPlaceholder("e.g. Evaluating whether to enter into a business relationship...");
    await purposeField.fill("Joint product development");
    const standardTerms = page.locator(".prose").last();
    await expect(standardTerms).toContainText("Joint product development");
  });

  test("typing Governing Law updates cover page and section 9", async ({ page }) => {
    await page.goto("/");
    await page.getByPlaceholder("e.g. Delaware").fill("California");
    const preview = page.locator(".prose");
    await expect(preview.first()).toContainText("California");
    await expect(preview.last()).toContainText("California");
  });

  test("empty Governing Law shows consistent placeholder in both sections", async ({ page }) => {
    await page.goto("/");
    // Governing Law is empty by default — check both sections show same placeholder
    await expect(page.locator(".prose").first()).toContainText("[State not specified]");
    await expect(page.locator(".prose").last()).toContainText("[State not specified]");
  });

  test("empty Jurisdiction shows consistent placeholder in both sections", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".prose").first()).toContainText("[Jurisdiction not specified]");
    await expect(page.locator(".prose").last()).toContainText("[Jurisdiction not specified]");
  });
});

test.describe("NDA Creator — MNDA Term radio buttons", () => {
  test("switching to 'until terminated' updates preview and disables years input", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("radio", { name: /Continues until terminated/i }).click();
    await expect(page.locator(".prose").first()).toContainText("Continues until terminated");
    const yearsInput = page.locator('input[type="number"]').first();
    await expect(yearsInput).toBeDisabled();
  });

  test("switching back to 'expires' re-enables years input", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("radio", { name: /Continues until terminated/i }).click();
    await page.getByRole("radio", { name: /Expires after/i }).click();
    const yearsInput = page.locator('input[type="number"]').first();
    await expect(yearsInput).toBeEnabled();
  });

  test("changing years value updates preview text", async ({ page }) => {
    await page.goto("/");
    await page.locator('input[type="number"]').first().fill("3");
    await expect(page.locator(".prose").first()).toContainText("3 year(s) from Effective Date");
  });
});

test.describe("NDA Creator — Term of Confidentiality radio buttons", () => {
  test("switching to 'in perpetuity' updates preview", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("radio", { name: /In perpetuity/i }).click();
    await expect(page.locator(".prose").first()).toContainText("In perpetuity.");
    await expect(page.locator(".prose").last()).toContainText("perpetuity");
  });

  test("switching to 'in perpetuity' disables confidentiality years input", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("radio", { name: /In perpetuity/i }).click();
    // Second number input is confidentiality years
    const confYearsInput = page.locator('input[type="number"]').nth(1);
    await expect(confYearsInput).toBeDisabled();
  });
});

test.describe("NDA Creator — Party info in signature table", () => {
  test("party 1 name appears in signature table", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("textbox", { name: "Full name" }).first().fill("Alice Johnson");
    await expect(page.getByRole("cell", { name: "Alice Johnson" })).toBeVisible();
  });

  test("party 2 name appears in signature table", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("textbox", { name: "Full name" }).nth(1).fill("Bob Smith");
    await expect(page.getByRole("cell", { name: "Bob Smith" })).toBeVisible();
  });

  test("party 1 company appears in signature table", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("textbox", { name: "Company" }).first().fill("Acme Corp");
    await expect(page.getByRole("cell", { name: "Acme Corp" })).toBeVisible();
  });

  test("empty party fields show blank placeholder in table", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("cell", { name: "_________________" }).first()).toBeVisible();
  });
});

test.describe("NDA Creator — Modifications section", () => {
  test("modifications text appears in preview when filled in", async ({ page }) => {
    await page.goto("/");
    await page.getByPlaceholder("Leave blank if no modifications...").fill("Section 2 is amended to require 30 days notice.");
    await expect(page.locator(".prose").first()).toContainText("MNDA Modifications");
    await expect(page.locator(".prose").first()).toContainText("Section 2 is amended to require 30 days notice.");
  });

  test("modifications section is absent when field is empty", async ({ page }) => {
    await page.goto("/");
    // Default is empty — modifications heading should not appear
    await expect(page.locator(".prose").first()).not.toContainText("MNDA Modifications");
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
