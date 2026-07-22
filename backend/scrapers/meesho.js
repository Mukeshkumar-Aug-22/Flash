const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const cheerio = require('cheerio');

puppeteer.use(StealthPlugin());

// =============================================
//   Check if product title is relevant
//   to the search query
//   e.g. query="iphone 17" title="Apple iPhone 17" → true
//   e.g. query="iphone 17" title="Phone Cover"     → false
// =============================================
const isRelevant = (title, query) => {
  if (!title || !query) return false;
  const titleLower = title.toLowerCase();
  const queryWords = query.toLowerCase().split(' ').filter(w => w.length > 2);
  // At least half the query words must appear in the title
  const matchCount = queryWords.filter(word => titleLower.includes(word)).length;
  return matchCount >= Math.ceil(queryWords.length / 2);
};

const scrapeMenush = async (query) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--window-size=1366,768',
      ],
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
    await page.setViewport({ width: 1366, height: 768 });

    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-IN,en;q=0.9',
    });

    const searchUrl = `https://www.meesho.com/search?q=${encodeURIComponent(query)}`;
    console.log(`🔍 Meesho: Searching for "${query}"...`);

    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 35000 });

    // Wait for React to render products
    await new Promise(resolve => setTimeout(resolve, 4000));

    // Scroll to trigger lazy loading
    await page.evaluate(() => window.scrollBy(0, 600));
    await new Promise(resolve => setTimeout(resolve, 1500));

    const html = await page.content();
    const $ = cheerio.load(html);
    const results = [];

    // Try known Meesho card selectors
    const cardSelectors = [
      'div[data-testid="product-container"]',
      'div[class*="ProductCard"]',
      'div[class*="product-card"]',
      'div[class*="NewProductCard"]',
      'div[class*="Card__"]',
      'div[class*="sc-"][class*="Card"]',
    ];

    let cards = $();
    for (const sel of cardSelectors) {
      const found = $(sel);
      if (found.length > 2) { cards = found; break; }
    }

    // Fallback — find divs that look like product cards
    if (cards.length === 0) {
      $('div').each((i, el) => {
        const text = $(el).text();
        const children = $(el).children().length;
        if (
          text.includes('₹') &&
          children >= 2 && children <= 8 &&
          text.length > 10 && text.length < 300
        ) {
          cards = cards.add(el);
        }
      });
    }

    console.log(`   Meesho: Found ${cards.length} raw cards`);

    cards.slice(0, 10).each((i, el) => {
      // Title
      const title =
        $('p[class*="ProductName"], p[class*="product-name"]', el).first().text().trim() ||
        $('h5, h4, h3', el).first().text().trim() ||
        $('p', el).first().text().trim();

      // Price — find ₹ in text
      let price = null;
      $('*', el).each((j, elem) => {
        if ($(elem).children().length > 0) return;
        const text = $(elem).text().trim();
        if (text.startsWith('₹')) {
          const num = parseFloat(text.replace(/[₹,\s]/g, ''));
          if (num > 100 && !price) price = num;
        }
      });

      // Image
      const image = $('img', el).first().attr('src') || '';

      // URL
      const relLink = $('a', el).first().attr('href') || '';
      const url = relLink.startsWith('http')
        ? relLink
        : `https://www.meesho.com${relLink}`;

      // ── KEY FIX: Only add if title matches the query ──
      if (title && price && price > 100 && title.length > 3 && isRelevant(title, query)) {
        results.push({
          site: 'Meesho',
          title: title.slice(0, 120),
          price,
          originalPrice: null,
          discount: null,
          image,
          url,
          rating: null,
          ratingCount: null,
          inStock: true,
        });
      }
    });

    console.log(`✅ Meesho: Found ${results.length} results`);
    return results;

  } catch (error) {
    console.error(`❌ Meesho scrape error: ${error.message}`);
    return [];
  } finally {
    if (browser) await browser.close();
  }
};

module.exports = { scrapeMenush };