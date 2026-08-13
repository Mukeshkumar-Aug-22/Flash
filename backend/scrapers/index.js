const puppeteer = require('puppeteer');
const { scrapeAmazon } = require('./amazon');
const { scrapeFlipkart } = require('./flipkart');
const { scrapeMeesho } = require('./meesho');
const { scrapeSnapdeal } = require('./snapdeal');

const detectQueryType = (query) => {
  try {
    new URL(query);
    return 'url';
  } catch {
    return 'name';
  }
};

const extractProductNameFromUrl = (url) => {
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname;

    const segments = pathname
      .replace(/^\//, '')
      .split('/')
      .filter(Boolean);

    const productSegment = segments[0] || '';

    const productName = productSegment
      .replace(/-/g, ' ')
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .trim();

    return productName.split(' ').slice(0, 6).join(' ');
  } catch {
    return url;
  }
};

// ✅ FIX: Single browser instance (saves memory!)
const runAllScrapers = async (query) => {
  const queryType = detectQueryType(query);
  let searchTerm = query;

  if (queryType === 'url') {
    searchTerm = extractProductNameFromUrl(query);
    console.log(`🔗 URL detected. Extracted search term: "${searchTerm}"`);
  }

  console.log(`\n⚡ Flash AI — Running all scrapers for: "${searchTerm}"`);
  console.log('━'.repeat(50));

  const startTime = Date.now();

  // ✅ Launch ONE browser for all scrapers
  const chromePath = process.env.CHROME_PATH || '/opt/render/.cache/puppeteer/chrome/linux-151.0.7922.77/chrome-linux64/chrome';

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--single-process',      // ✅ Helps with memory
      '--no-zygote',           // ✅ Helps with memory
      '--window-size=1366,768'
    ],
    ignoreHTTPSErrors: true,
  });

  try {
    // ✅ Run all scrapers with the SAME browser
    const [amazonResult, flipkartResult, meeshoResult, snapdealResult] = await Promise.allSettled([
      scrapeAmazon(searchTerm, browser),   // Pass browser instance
      scrapeFlipkart(searchTerm, browser), // Pass browser instance
      scrapeMeesho(searchTerm, browser),   // Pass browser instance
      scrapeSnapdeal(searchTerm),          // Snapdeal uses axios, no browser needed
    ]);

    let allResults = [];

    // Process Amazon results
    if (amazonResult.status === 'fulfilled') {
      console.log(`✅ Amazon: ${amazonResult.value.length} results`);
      allResults = [...allResults, ...amazonResult.value];
    } else {
      console.error(`❌ Amazon failed:`, amazonResult.reason?.message);
    }

    // Process Flipkart results
    if (flipkartResult.status === 'fulfilled') {
      console.log(`✅ Flipkart: ${flipkartResult.value.length} results`);
      allResults = [...allResults, ...flipkartResult.value];
    } else {
      console.error(`❌ Flipkart failed:`, flipkartResult.reason?.message);
    }

    // Process Meesho results
    if (meeshoResult.status === 'fulfilled') {
      console.log(`✅ Meesho: ${meeshoResult.value.length} results`);
      allResults = [...allResults, ...meeshoResult.value];
    } else {
      console.error(`❌ Meesho failed:`, meeshoResult.reason?.message);
    }

    // Process Snapdeal results (already handled)
    if (snapdealResult.status === 'fulfilled') {
      console.log(`✅ Snapdeal: ${snapdealResult.value.length} results`);
      allResults = [...allResults, ...snapdealResult.value];
    } else {
      console.error(`❌ Snapdeal failed:`, snapdealResult.reason?.message);
    }

    // Remove duplicates based on URL
    const seen = new Set();
    allResults = allResults.filter((item) => {
      if (seen.has(item.url)) return false;
      seen.add(item.url);
      return true;
    });

    // Remove items with invalid prices
    allResults = allResults.filter((item) => item.price && item.price > 0);

    // Sort by price (lowest first)
    allResults.sort((a, b) => a.price - b.price);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('━'.repeat(50));
    console.log(`✅ Total unique results: ${allResults.length} | Time: ${elapsed}s\n`);

    return { results: allResults, searchTerm, queryType };

  } finally {
    // ✅ Always close the browser
    await browser.close();
  }
};

module.exports = { runAllScrapers, detectQueryType };