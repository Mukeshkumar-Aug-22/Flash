const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

const scrapeAmazon = async (query, retries = 3) => {
  let browser;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔍 Amazon: Searching for "${query}" (Attempt ${attempt}/${retries})...`);

      // ✅ Chrome path for Render
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--window-size=1366,768',
          '--disable-blink-features=AutomationControlled',
        ],
        ignoreHTTPSErrors: true,
      });

      const page = await browser.newPage();

      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
        'AppleWebKit/537.36 (KHTML, like Gecko) ' +
        'Chrome/120.0.0.0 Safari/537.36'
      );

      await page.setViewport({ width: 1366, height: 768 });

      const searchUrl = `https://www.amazon.in/s?k=${encodeURIComponent(query)}`;

      const delay = Math.floor(Math.random() * 3000) + 1000;
      await new Promise(resolve => setTimeout(resolve, delay));

      await page.goto(searchUrl, {
        waitUntil: 'networkidle2',
        timeout: 45000,
      });

      await page.waitForSelector('[data-component-type="s-search-result"]', {
        timeout: 20000,
      }).catch(() => {
        console.warn('⚠️ Amazon: Product selector not found');
      });

      const html = await page.content();
      
      if (!html || html.length < 1000) {
        console.warn('⚠️ Amazon: Received empty HTML');
        continue;
      }

      const $ = cheerio.load(html);
      const results = [];

      $('[data-component-type="s-search-result"]').each((i, el) => {
        if (i >= 8) return false;

        const title = $('h2 span.a-text-normal', el).text().trim() ||
                      $('h2 a span', el).text().trim() ||
                      $('h2', el).text().trim() ||
                      '';

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

        const image = $('img.s-image', el).attr('src') || '';
        const relativeLink = $('h2 a.a-link-normal', el).attr('href') || '';
        const productUrl = relativeLink.startsWith('http')
          ? relativeLink
          : `https://www.amazon.in${relativeLink}`;

        if (title && priceWhole && parseFloat(priceWhole) > 0) {
          results.push({
            site: 'Amazon',
            title: title,
            price: parseFloat(priceWhole),
            originalPrice: null,
            discount: null,
            image: image,
            url: productUrl,
            rating: null,
            ratingCount: null,
            inStock: true,
          });
        }
      });

      console.log(`✅ Amazon: Found ${results.length} results`);
      return results;

    } catch (error) {
      console.error(`❌ Amazon scrape error (Attempt ${attempt}): ${error.message}`);
      if (attempt === retries) {
        return [];
      }
    } finally {
      if (browser) await browser.close();
    }
  }
  
  return [];
};

module.exports = { scrapeAmazon };