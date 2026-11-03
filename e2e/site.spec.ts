import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const PAGES = ["/ro", "/en", "/ro/cv", "/en/cv", "/ro/portfolio", "/en/portfolio/ble-wireless-keyboard", "/ro/contact", "/en/privacy"];

test.describe("public site @smoke", () => {
  test("home page presents the professional identity", async ({ page }) => {
    await page.goto("/ro");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Ștefan-Emanuel");
    await expect(page.getByText("Inginer electronist · Masterand în Securitate Cibernetică").first()).toBeVisible();
    await expect(page.getByRole("img", { name: /Portret profesional/ })).toBeVisible();
    await expect(page.getByRole("link", { name: "Explorează portofoliul" })).toBeVisible();
    await expect(page.getByRole("link", { name: "LinkedIn" }).first()).toHaveAttribute("href", /linkedin\.com/);
  });

  test("redirects / to the visitor's language", async ({ browser }) => {
    const context = await browser.newContext({ locale: "en-US", extraHTTPHeaders: { "accept-language": "en-US,en;q=0.9" } });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await context.close();
  });

  test("language switch keeps the current page and translates it", async ({ page }) => {
    await page.goto("/ro/cv");
    await expect(page.getByRole("heading", { name: "Experiență profesională" })).toBeVisible();
    await page.getByTestId("language-switch").click();
    await expect(page).toHaveURL(/\/en\/cv$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByRole("heading", { name: "Professional experience" })).toBeVisible();
    await expect(page.getByText("Research Assistant (MSc student)").first()).toBeVisible();
  });

  test("online CV contains every populated section", async ({ page }) => {
    await page.goto("/en/cv");
    for (const heading of ["Professional profile", "Professional experience", "Education", "Technical skills", "Personal skills", "Languages", "Courses & qualifications", "Selected projects", "Volunteering", "Additional information", "Contact details"]) {
      await expect(page.getByRole("heading", { name: heading, exact: false }).first()).toBeAttached();
    }
    await expect(page.getByText("FortiGate 7.4 Administrator")).toBeAttached();
    // The phone number is private by default.
    await expect(page.locator("body")).not.toContainText("773");
  });

  test("portfolio filters by category and opens a case study", async ({ page }) => {
    await page.goto("/en/portfolio");
    const grid = page.getByTestId("project-grid");
    await expect(grid.getByRole("article")).toHaveCount(12);
    await page.getByRole("link", { name: /RF & antennas/ }).click();
    await expect(page).toHaveURL(/category=rf/);
    await expect(grid.getByRole("article")).toHaveCount(1);
    await grid.getByRole("link", { name: "13.56 MHz RFID antenna" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "13.56 MHz RFID antenna" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Implementation process" })).toBeVisible();
  });

  test("unknown pages return a localized 404", async ({ page }) => {
    const response = await page.goto("/en/does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  });

  test("security headers are present", async ({ request }) => {
    const response = await request.get("/ro");
    const headers = response.headers();
    expect(headers["content-security-policy"]).toMatch(/script-src 'self' 'nonce-[^']+' 'strict-dynamic'/);
    expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["strict-transport-security"]).toContain("max-age=63072000");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["x-powered-by"]).toBeUndefined();
  });

  test("SEO endpoints are served", async ({ request }) => {
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.ok()).toBe(true);
    expect(await sitemap.text()).toContain("/en/portfolio/ble-wireless-keyboard");
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Disallow: /admin");
    const og = await request.get("/en/opengraph-image");
    expect(og.headers()["content-type"]).toBe("image/png");
  });
});

test.describe("CV download", () => {
  test("downloads a generated PDF in the chosen language and format @smoke", async ({ page }) => {
    await page.goto("/ro");
    await page.getByRole("button", { name: "Descarcă CV-ul" }).click();
    const dialog = page.getByRole("dialog", { name: "Descarcă CV-ul" });
    await expect(dialog).toBeVisible();
    await dialog.getByLabel("English").check();
    await dialog.getByLabel(/Optimizat ATS/).check();
    const [download] = await Promise.all([page.waitForEvent("download"), dialog.getByTestId("cv-download-link").click()]);
    expect(download.suggestedFilename()).toBe("Stefan-Emanuel-Ciupitu-CV-ats-en.pdf");
    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(chunk as Buffer);
    expect(Buffer.concat(chunks).subarray(0, 5).toString()).toBe("%PDF-");
  });

  test("all 8 PDF variants are served", async ({ request }) => {
    for (const locale of ["ro", "en"]) {
      for (const format of ["modern", "europass", "ats", "print"]) {
        const response = await request.get(`/api/cv/${locale}/${format}`);
        expect(response.status(), `${locale}/${format}`).toBe(200);
        expect(response.headers()["content-type"]).toBe("application/pdf");
      }
    }
  });
});

test.describe("contact form", () => {
  test("validates on the client with clear messages", async ({ page }) => {
    await page.goto("/en/contact");
    await page.getByTestId("contact-submit").click();
    await expect(page.getByText("Enter your name (at least 2 characters).")).toBeVisible();
    await expect(page.getByText("Enter a valid email address", { exact: false })).toBeVisible();
    await expect(page.getByText("Tick the consent box so the message can be sent.")).toBeVisible();
    await expect(page.getByLabel("Name", { exact: true })).toBeFocused();
    await page.getByLabel("Name", { exact: true }).fill("Ana Pop");
    await expect(page.getByText("Enter your name (at least 2 characters).")).toBeHidden();
  });

  test("handles a backend that is not configured gracefully", async ({ page }) => {
    await page.goto("/en/contact");
    await page.getByLabel("Name", { exact: true }).fill("Ana Pop");
    await page.getByLabel("Email", { exact: true }).fill("ana@example.com");
    await page.getByLabel("Message", { exact: true }).fill("Hello! I would like to talk about an engineering role.");
    await page.getByLabel(/I agree/).check();
    await page.waitForTimeout(3200); // the anti-bot timing check rejects instant submissions
    await page.getByTestId("contact-submit").click();
    await expect(page.getByTestId("contact-error")).toContainText("unavailable");
  });
});

test.describe("admin area is protected", () => {
  for (const path of ["/admin", "/admin/projects", "/admin/content/profile", "/admin/messages"]) {
    test(`${path} redirects anonymous visitors to the login page @smoke`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/admin\/login\?next=/);
      await expect(page.getByRole("heading", { name: "Autentificare" })).toBeVisible();
    });
  }

  test("login is not indexable and fails secure without configuration", async ({ page, request }) => {
    const response = await request.get("/admin/login");
    expect(response.headers()["x-robots-tag"]).toContain("noindex");
    await page.goto("/admin/login");
    await expect(page.getByRole("button", { name: "Autentifică-te" })).toBeDisabled();
  });

  test("open redirect via ?next is neutralised", async ({ page }) => {
    await page.goto("/admin/login?next=//evil.example");
    await expect(page.locator('input[name="next"]')).toHaveValue("/admin");
  });

  test("retention cron rejects unauthenticated calls", async ({ request }) => {
    expect((await request.get("/api/cron/retention")).status()).toBe(401);
    expect((await request.get("/api/cron/retention", { headers: { authorization: "Bearer wrong" } })).status()).toBe(401);
  });
});

test.describe("experience", () => {
  test("theme toggle switches to dark mode and persists", async ({ page }) => {
    await page.goto("/en");
    const html = page.locator("html");
    const before = await html.getAttribute("data-theme");
    await page.getByRole("button", { name: /mode/ }).click();
    await expect(html).not.toHaveAttribute("data-theme", before ?? "");
    const after = await html.getAttribute("data-theme");
    await page.reload();
    await expect(html).toHaveAttribute("data-theme", after ?? "");
  });

  for (const scheme of ["light", "dark"] as const) {
    test(`switching language keeps the theme (${scheme} system preference)`, async ({ browser }) => {
      const context = await browser.newContext({ colorScheme: scheme });
      const page = await context.newPage();
      const html = page.locator("html");
      await page.goto("/ro");
      if (scheme === "light") await page.getByRole("button", { name: /întunecat/ }).click();
      await expect(html).toHaveAttribute("data-theme", "dark");
      await page.getByTestId("language-switch").click();
      await expect(page).toHaveURL(/\/en$/);
      await expect(html).toHaveAttribute("data-theme", "dark");
      await page.getByTestId("language-switch").click();
      await expect(page).toHaveURL(/\/ro$/);
      await expect(html).toHaveAttribute("data-theme", "dark");
      await context.close();
    });
  }

  test("mobile menu opens and navigates", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile only");
    await page.goto("/en");
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.locator("#mobile-menu").getByRole("link", { name: "Portfolio" }).click();
    await expect(page).toHaveURL(/\/en\/portfolio$/);
  });

  for (const path of PAGES) {
    test(`no horizontal overflow and no console errors on ${path}`, async ({ page }) => {
      const errors: string[] = [];
      page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(path, { waitUntil: "networkidle" });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(1);
      expect(errors).toEqual([]);
    });

    test(`accessibility (WCAG 2.2 AA rules) on ${path}`, async ({ page }) => {
      await page.goto(path, { waitUntil: "networkidle" });
      await page.evaluate(() => document.querySelectorAll("[data-reveal]").forEach((el) => el.setAttribute("data-visible", "")));
      await page.waitForTimeout(800);
      // Cast: @axe-core/playwright's types target a newer Playwright minor than the pinned runner.
      const results = await new AxeBuilder({ page } as unknown as ConstructorParameters<typeof AxeBuilder>[0]).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
      const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(", ")}`)).toEqual([]);
    });
  }
});
