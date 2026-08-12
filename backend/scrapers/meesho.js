const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const cheerio = require('cheerio');

const scrapeMeesho = async (query) => {
  let browser;

  try {
    console.log(`🔍 Meesho: Searching for "${query}"...`);

    const executablePath = await chromium.executablePath();

    browser = await puppeteer.launch({
      executablePath: executablePath,
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1366,768'
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

    const searchUrl = `https://www.meesho.com/search?q=${encodeURIComponent(query)}`;

    await page.goto(searchUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

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

    await new Promise(resolve => setTimeout(resolve, 3000));

    const html = await page.content();
    const $ = cheerio.load(html);
    const results = [];

    const productSelectors = [
      'div[data-testid="product-container"]',
      '.sc-dkrFOg',
      '.NewProductCard__CardWrapper-sc',
      '.ProductList__ProductCard-sc',
    ];

    let productEls = $();
    for (const sel of productSelectors) {
      productEls = $(sel);
      if (productEls.length > 0) {
        console.log(`✅ Meesho: Using selector "${sel}"`);
        break;
      }
    }

    productEls.each((i, el) => {
      if (i >= 8) return false;

      const title = $('p.NewProductCard__ProductName-sc, p[class*="ProductName"]', el).first().text().trim() ||
        $('p[class*="Title"]', el).first().text().trim() ||
        $('p', el).first().text().trim() ||
        '';

      let priceText = $('h5.NewProductCard__ProductPrice-sc, h5[class*="ProductPrice"]', el).first().text()
        .replace(/[₹,\s]/g, '').trim();

      if (!priceText) {
        priceText = $('h5[class*="Price"]', el).first().text()
          .replace(/[₹,\s]/g, '').trim();
      }

      const image = $('img', el).first().attr('src') ||
        $('img', el).first().attr('data-src') || '';

      const link = $('a', el).first().attr('href') || '';
      const productUrl = link.startsWith('http')
        ? link
        : link
          ? `https://www.meesho.com${link}`
          : '';

      if (title && priceText && parseFloat(priceText) > 0) {
        results.push({
          site: 'Meesho',
          title: title,
          price: parseFloat(priceText),
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

    console.log(`✅ Meesho: Found ${results.length} results`);
    return results;

  } catch (error) {
    console.error(`❌ Meesho scrape error: ${error.message}`);
    return [];
  } finally {
    if (browser) await browser.close();
  }
};

module.exports = { scrapeMeesho };