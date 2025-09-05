import { createError, defineEventHandler, readBody } from "h3";
import puppeteer from "puppeteer";
export default defineEventHandler(async (event) => {
  if (event.node.req.method !== "POST") {
    throw createError({
      statusCode: 405,
      statusMessage: "Method Not Allowed"
    });
  }
  let url = "";
  let selector;
  let viewport = { width: 1920, height: 1080 };
  let theme = "light";
  try {
    const body = await readBody(event);
    const parsed = body;
    url = parsed.url || "";
    selector = parsed.selector;
    viewport = parsed.viewport || { width: 1920, height: 1080 };
    theme = parsed.theme || "light";
    if (!url) {
      throw createError({
        statusCode: 400,
        statusMessage: "URL is required"
      });
    }
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: process.env.CHROME_EXECUTABLE_PATH || process.env.CHROME_BIN || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-web-security",
        // Important for localhost
        "--allow-running-insecure-content",
        "--disable-extensions",
        "--no-first-run",
        "--disable-default-apps"
      ]
    });
    const page = await browser.newPage();
    await page.setViewport({
      width: viewport.width,
      height: viewport.height,
      deviceScaleFactor: 1
    });
    await page.emulateMediaFeatures([
      { name: "prefers-color-scheme", value: theme },
      { name: "prefers-reduced-motion", value: "true" }
    ]);
    await page.goto(url, { waitUntil: ["domcontentloaded", "networkidle2"] });
    let screenshotBuffer;
    if (selector) {
      const element = await page.$(selector);
      if (!element) {
        await browser.close();
        throw createError({
          statusCode: 404,
          statusMessage: `Element with selector "${selector}" not found`
        });
      }
      screenshotBuffer = await element.screenshot({
        fullPage: false,
        omitBackground: true
      });
    } else {
      screenshotBuffer = await page.screenshot({
        fullPage: true
      });
    }
    await browser.close();
    const base64Screenshot = Buffer.from(screenshotBuffer).toString("base64");
    const dataUrl = `data:image/png;base64,${base64Screenshot}`;
    return {
      success: true,
      screenshot: dataUrl,
      message: "Screenshot captured successfully"
    };
  } catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("timeout") || errorMessage.includes("Navigation timeout")) {
      throw createError({
        statusCode: 408,
        statusMessage: `Screenshot timeout: ${errorMessage}`
      });
    }
    if (errorMessage.includes("net::ERR_") || errorMessage.includes("ERR_NETWORK_CHANGED")) {
      throw createError({
        statusCode: 400,
        statusMessage: `Network error: ${errorMessage}`
      });
    }
    if (errorMessage.includes("Target closed") || errorMessage.includes("Session closed")) {
      throw createError({
        statusCode: 500,
        statusMessage: `Browser session error: ${errorMessage}`
      });
    }
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to capture screenshot: ${errorMessage}`
    });
  }
});
