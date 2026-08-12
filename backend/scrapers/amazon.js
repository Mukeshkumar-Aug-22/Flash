const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const cheerio = require('cheerio');

puppeteer.use(StealthPlugin());

const scrapeAmazon = async (query) => {
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
      'AppleWebKit/537.36 (KHTML, like Gecko) ' +
      'Chrome/120.0.0.0 Safari/537.36'
    );

    await page.setViewport({ width: 1366, height: 768 });

    const searchUrl = `https://www.amazon.in/s?k=${encodeURIComponent(query)}`;

    console.log(`🔍 Amazon: Searching for "${query}"...`);

    await page.goto(searchUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // Scroll to load more products
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 500;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= scrollHeight || totalHeight > 3000) {
            clearInterval(timer);
            resolve();
          }
        }, 500);
      });
    });

    await page.waitForSelector('[data-component-type="s-search-result"]', {
      timeout: 10000,
    }).catch(() => {
      console.warn('⚠️  Amazon: Product selector not found');
    });

    const html = await page.content();
    const $ = cheerio.load(html);
    const results = [];

    $('[data-component-type="s-search-result"]').each((i, el) => {
      if (i >= 8) return false;

      // ✅ FULL TITLE - No truncation
      const title = $('h2 span.a-text-normal', el).text().trim() ||
                    $('h2 a span', el).text().trim() ||
                    $('h2', el).text().trim() ||
                    $('[data-cy="title"]', el).text().trim() ||
                    '';

      // Price extraction
      let priceWhole = $('.a-price-whole', el).first().text()
        .replace(/[,\.]/g, '').trim();

      if (!priceWhole) {
        priceWhole = $('.a-price .a-offscreen', el).first().text()
          .replace(/[₹,\.]/g, '').trim();
      }

      if (!priceWhole) {
        priceWhole = $('.a-price span[aria-hidden="true"]', el).first().text()
          .replace(/[,\.]/g, '').trim();
      }

      const originalPriceText = $('.a-price.a-text-price span.a-offscreen', el)
        .first().text().replace(/[₹,]/g, '').trim();

      const discount = $('.a-badge-text', el).first().text().trim();

      const image = $('img.s-image', el).attr('src') || 
                    $('img[src*=".jpg"]', el).first().attr('src') || '';

      const relativeLink = $('h2 a.a-link-normal', el).attr('href') || 
                           $('a.a-link-normal[href*="/dp/"]', el).first().attr('href') || '';
      
      const productUrl = relativeLink.startsWith('http')
        ? relativeLink
        : relativeLink 
          ? `https://www.amazon.in${relativeLink}`
          : '';

      const ratingText = $('.a-icon-alt', el).first().text();
      const rating = parseFloat(ratingText) || null;

      const ratingCount = $('.a-size-base.s-underline-text', el).first().text().trim();

      // ✅ Only add if title AND price exist
      if (title && priceWhole && parseFloat(priceWhole) > 0) {
        results.push({
          site: 'Amazon',
          title: title,  // ✅ FULL TITLE - no substring
          price: parseFloat(priceWhole),
          originalPrice: originalPriceText ? parseFloat(originalPriceText) : null,
          discount: discount || null,
          image: image,
          url: productUrl,
          rating: rating,
          ratingCount: ratingCount || null,
          inStock: true,
        });
      }
    });

    console.log(`✅ Amazon: Found ${results.length} results`);
    return results;

  } catch (error) {
    console.error(`❌ Amazon scrape error: ${error.message}`);
    return [];
  } finally {
    if (browser) await browser.close();
  }
};

module.exports = { scrapeAmazon };