const { chromium } = require('playwright');

const BASE_URL = 'https://victorlatorreuceda-alt.github.io/brandnewclothes';

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function createPage(browser) {
  const context = await browser.newContext();
  return await context.newPage();
}

async function fullPurchase(browser, plan, expectedValue) {
  const page = await createPage(browser);

  await page.goto(`${BASE_URL}/index.html`);
  await wait(800);

  await page.goto(`${BASE_URL}/pricing.html`);
  await wait(800);

  await page.click(`#plan_${plan}`);
  await wait(800);

  await page.click('#begin_checkout_btn');
  await wait(800);

  await page.fill('#checkout_name', `Test ${plan}`);
  await page.fill('#checkout_email', `test-${plan}-${Date.now()}@example.com`);
  await page.fill('#checkout_card', '4242424242424242');

  await page.click('#purchase_btn');
  await wait(1200);

  console.log(`Full purchase completed: ${plan} - ${expectedValue}`);
  await page.close();
}

async function checkoutAbandon(browser, plan) {
  const page = await createPage(browser);

  await page.goto(`${BASE_URL}/pricing.html`);
  await wait(800);

  await page.click(`#plan_${plan}`);
  await wait(800);

  await page.click('#begin_checkout_btn');
  await wait(1200);

  console.log(`Checkout abandoned: ${plan}`);
  await page.close();
}

async function pricingAbandon(browser) {
  const page = await createPage(browser);

  await page.goto(`${BASE_URL}/index.html`);
  await wait(800);

  await page.goto(`${BASE_URL}/pricing.html`);
  await wait(1200);

  console.log('Pricing viewed, no plan selected');
  await page.close();
}

async function signupAndUseDashboard(browser) {
  const page = await createPage(browser);

  await page.goto(`${BASE_URL}/signup.html`);
  await wait(800);

  await page.fill('input[type="email"]', `signup-${Date.now()}@example.com`);
  await page.fill('input[type="password"]', 'password123');

  await page.click('button[type="submit"]');
  await wait(1200);

  await page.click('#feature_track_today');
  await wait(600);

  await page.click('#feature_create_habit');
  await wait(600);

  await page.click('#feature_view_stats');
  await wait(1000);

  console.log('Signup and dashboard usage completed');
  await page.close();
}

async function run() {
  const browser = await chromium.launch({ headless: true });

  try {
    await fullPurchase(browser, 'pro', '9.99');
    await fullPurchase(browser, 'premium', '19.99');
    await fullPurchase(browser, 'free', '0');

    await checkoutAbandon(browser, 'pro');
    await checkoutAbandon(browser, 'premium');

    await pricingAbandon(browser);
    await pricingAbandon(browser);

    await signupAndUseDashboard(browser);
    await signupAndUseDashboard(browser);
  } finally {
    await browser.close();
  }
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
