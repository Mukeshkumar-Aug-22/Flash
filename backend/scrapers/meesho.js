// const puppeteer = require('puppeteer-extra');
// const StealthPlugin = require('puppeteer-extra-plugin-stealth');
// const cheerio = require('cheerio');

// puppeteer.use(StealthPlugin());

// const scrapeMeesho = async (query) => {
//   let browser;

//   try {
//     browser = await puppeteer.launch({
//       headless: 'new',
//       args: [
//         '--no-sandbox',
//         '--disable-setuid-sandbox',
//         '--disable-dev-shm-usage',
//         '--disable-gpu',
//       ],
//     });

//     const page = await browser.newPage();

//     await page.setUserAgent(
//       'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
//       'AppleWebKit/537.36 (KHTML, like Gecko) ' +
//       'Chrome/120.0.0.0 Safari/537.36'
//     );

//     await page.setViewport({ width: 1366, height: 768 });

//     const searchUrl = `https://www.meesho.com/search?q=${encodeURIComponent(query)}`;

//     console.log(`🔍 Meesho: Searching for "${query}"...`);

//     await page.goto(searchUrl, {
//       waitUntil: 'networkidle2',
//       timeout: 30000,
//     });

//     await new Promise(resolve => setTimeout(resolve, 3000));

//     const html = await page.content();
//     const $ = cheerio.load(html);
//     const results = [];

//     $('div[data-testid="product-container"], .sc-dkrFOg, .NewProductCard__CardWrapper-sc').slice(0, 5).each((i, el) => {
//       const title = $('p.NewProductCard__ProductName-sc, p[class*="ProductName"]', el).first().text().trim() ||
//                     $('p', el).first().text().trim();

//       const priceText = $('h5.NewProductCard__ProductPrice-sc, h5[class*="ProductPrice"]', el).first().text()
//         .replace(/[₹,\s]/g, '').trim() ||
//         $('h5', el).first().text().replace(/[₹,\s]/g, '').trim();

//       const image = $('img', el).first().attr('src') ||
//                     $('img', el).first().attr('data-src') || '';

//       const link = $('a', el).first().attr('href') || '';
//       const productUrl = link.startsWith('http')
//         ? link
//         : `https://www.meesho.com${link}`;

//       if (title && priceText && parseFloat(priceText) > 0) {
//         results.push({
//           site: 'Meesho',
//           title: title,
//           price: parseFloat(priceText),
//           originalPrice: null,
//           discount: null,
//           image: image,
//           url: productUrl,
//           rating: null,
//           ratingCount: null,
//           inStock: true,
//         });
//       }
//     });

//     console.log(`✅ Meesho: Found ${results.length} results`);
//     return results;

//   } catch (error) {
//     console.error(`❌ Meesho scrape error: ${error.message}`);
//     return [];
//   } finally {
//     if (browser) await browser.close();
//   }
// };

// module.exports = { scrapeMeesho };

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const cheerio = require('cheerio');

puppeteer.use(StealthPlugin());

const scrapeMeesho = async (query) => {
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

    const searchUrl = `https://www.meesho.com/search?q=${encodeURIComponent(query)}`;

    console.log(`🔍 Meesho: Searching for "${query}"...`);

    await page.goto(searchUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // ✅ SCROLL to load more
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

    // ✅ Multiple selectors for Meesho
    const productSelectors = [
      'div[data-testid="product-container"]',
      '.sc-dkrFOg',
      '.NewProductCard__CardWrapper-sc',
      '.ProductList__ProductCard-sc',
      '.product-card',
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

      // ✅ Multiple price selectors
      let priceText = $('h5.NewProductCard__ProductPrice-sc, h5[class*="ProductPrice"]', el).first().text()
        .replace(/[₹,\s]/g, '').trim();
      
      if (!priceText) {
        priceText = $('h5[class*="Price"]', el).first().text()
          .replace(/[₹,\s]/g, '').trim();
      }
      if (!priceText) {
        priceText = $('.product-price', el).first().text()
          .replace(/[₹,\s]/g, '').trim();
      }

      const image = $('img', el).first().attr('src') ||
                    $('img', el).first().attr('data-src') ||
                    $('img[loading="lazy"]', el).first().attr('src') || '';

      const link = $('a', el).first().attr('href') || '';
      const productUrl = link.startsWith('http')
        ? link
        : link 
          ? `https://www.meesho.com${link}`
          : '';

      if (title && priceText && parseFloat(priceText) > 0) {
        results.push({
          site: 'Meesho',
          title: title.substring(0, 100),
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