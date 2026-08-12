// const puppeteer = require('puppeteer-extra');
// const StealthPlugin = require('puppeteer-extra-plugin-stealth');
// const cheerio = require('cheerio');

// puppeteer.use(StealthPlugin());

// const scrapeFlipkart = async (query) => {
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

//     const searchUrl = `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`;

//     console.log(`🔍 Flipkart: Searching for "${query}"...`);

//     await page.goto(searchUrl, {
//       waitUntil: 'domcontentloaded',
//       timeout: 30000,
//     });

//     // Dismiss login popup if appears
//     await page.evaluate(() => {
//       const closeBtn = document.querySelector('button._2KpZ6l._2doB4z');
//       if (closeBtn) closeBtn.click();
//     }).catch(() => {});

//     await new Promise(resolve => setTimeout(resolve, 2000));

//     const html = await page.content();
//     const $ = cheerio.load(html);
//     const results = [];

//     const productSelectors = [
//       '._1AtVbE',
//       '._2kHMtA',
//       '.cPHDOP',
//       '._13oc-S',
//     ];

//     let productEls = $();
//     for (const sel of productSelectors) {
//       productEls = $(sel);
//       if (productEls.length > 0) break;
//     }

//     productEls.slice(0, 5).each((i, el) => {
//       const title = $('._4rR01T', el).first().text().trim() ||
//                     $('.s1Q9rs', el).first().text().trim() ||
//                     $('.IRpwTa', el).first().text().trim() ||
//                     $('a[title]', el).first().attr('title') || '';

//       const priceText = $('._30jeq3', el).first().text().replace(/[₹,]/g, '').trim() ||
//                         $('.Nx9bqj', el).first().text().replace(/[₹,]/g, '').trim() ||
//                         $('._16Jk6d', el).first().text().replace(/[₹,]/g, '').trim();

//       const originalPriceText = $('._3I9_wc', el).first().text().replace(/[₹,]/g, '').trim() ||
//                                 $('.yRaY8j', el).first().text().replace(/[₹,]/g, '').trim();

//       const discount = $('._3Ay6Sb', el).first().text().trim();

//       const image = $('img._396cs4', el).first().attr('src') ||
//                     $('img._2r_T1I', el).first().attr('src') ||
//                     $('img.DByuf4', el).first().attr('src') || '';

//       const relativeLink = $('a._1fQZEK', el).first().attr('href') ||
//                            $('a.s1Q9rs', el).first().attr('href') ||
//                            $('a.CGtC98', el).first().attr('href') ||
//                            $('a', el).first().attr('href') || '';

//       const productUrl = relativeLink.startsWith('http')
//         ? relativeLink
//         : `https://www.flipkart.com${relativeLink}`;

//       const ratingText = $('._3LWZlK', el).first().text().trim() ||
//                          $('.XQDdHH', el).first().text().trim();
//       const rating = parseFloat(ratingText) || null;

//       const ratingCount = $('._2_R_DZ span', el).first().text().trim() ||
//                           $('.Wphh3N span', el).first().text().trim();

//       if (title && priceText) {
//         results.push({
//           site: 'Flipkart',
//           title: title,
//           price: parseFloat(priceText),
//           originalPrice: originalPriceText ? parseFloat(originalPriceText) : null,
//           discount: discount || null,
//           image: image,
//           url: productUrl,
//           rating: rating,
//           ratingCount: ratingCount || null,
//           inStock: true,
//         });
//       }
//     });

//     console.log(`✅ Flipkart: Found ${results.length} results`);
//     return results;

//   } catch (error) {
//     console.error(`❌ Flipkart scrape error: ${error.message}`);
//     return [];
//   } finally {
//     if (browser) await browser.close();
//   }
// };

// module.exports = { scrapeFlipkart };

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const cheerio = require('cheerio');

puppeteer.use(StealthPlugin());

const scrapeFlipkart = async (query) => {
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

    const searchUrl = `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`;

    console.log(`🔍 Flipkart: Searching for "${query}"...`);

    await page.goto(searchUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // Dismiss login popup
    await page.evaluate(() => {
      const closeBtn = document.querySelector('button._2KpZ6l._2doB4z');
      if (closeBtn) closeBtn.click();
    }).catch(() => { });

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

    await new Promise(resolve => setTimeout(resolve, 2000));

    const html = await page.content();
    const $ = cheerio.load(html);
    const results = [];

    // ✅ Multiple selectors for Flipkart products
    const productSelectors = [
      '._1AtVbE',      // Old grid
      '._2kHMtA',      // New grid
      '.cPHDOP',       // List view
      '._13oc-S',      // Alternative
      '.tUxRFH',       // New layout
      '._75nlfW',      // Another layout
      '.col-12-12',    // Column layout
      '[data-id]',     // Any element with data-id
    ];
    let productEls = $();
    for (const sel of productSelectors) {
      productEls = $(sel);
      if (productEls.length > 0) {
        console.log(`✅ Flipkart: Using selector "${sel}"`);
        break;
      }
    }

    // ✅ Get ALL products
    productEls.each((i, el) => {
      if (i >= 8) return false;

      // Multiple title selectors
      const title = $('._4rR01T', el).first().text().trim() ||
        $('.s1Q9rs', el).first().text().trim() ||
        $('.IRpwTa', el).first().text().trim() ||
        $('a[title]', el).first().attr('title') ||
        $('.wjcEIp', el).first().text().trim() ||
        $('.B_NuCI', el).first().text().trim() ||
        $('._2UzuFa', el).first().text().trim() ||
        '';

      // ✅ Multiple price selectors
      let priceText = $('._30jeq3', el).first().text().replace(/[₹,]/g, '').trim();
      if (!priceText) {
        priceText = $('.Nx9bqj', el).first().text().replace(/[₹,]/g, '').trim();
      }
      if (!priceText) {
        priceText = $('._16Jk6d', el).first().text().replace(/[₹,]/g, '').trim();
      }
      if (!priceText) {
        priceText = $('.yRaY8j', el).first().text().replace(/[₹,]/g, '').trim();
      }

      const originalPriceText = $('._3I9_wc', el).first().text().replace(/[₹,]/g, '').trim() ||
        $('.yRaY8j', el).first().text().replace(/[₹,]/g, '').trim();

      const discount = $('._3Ay6Sb', el).first().text().trim() ||
        $('._1localz span', el).first().text().trim();

      const image = $('img._396cs4', el).first().attr('src') ||
        $('img._2r_T1I', el).first().attr('src') ||
        $('img.DByuf4', el).first().attr('src') ||
        $('img[loading="eager"]', el).first().attr('src') || '';

      const relativeLink = $('a._1fQZEK', el).first().attr('href') ||
        $('a.s1Q9rs', el).first().attr('href') ||
        $('a.CGtC98', el).first().attr('href') ||
        $('a', el).first().attr('href') || '';

      const productUrl = relativeLink.startsWith('http')
        ? relativeLink
        : relativeLink
          ? `https://www.flipkart.com${relativeLink}`
          : '';

      const ratingText = $('._3LWZlK', el).first().text().trim() ||
        $('.XQDdHH', el).first().text().trim();
      const rating = parseFloat(ratingText) || null;

      const ratingCount = $('._2_R_DZ span', el).first().text().trim() ||
        $('.Wphh3N span', el).first().text().trim();

      if (title && priceText && parseFloat(priceText) > 0) {
        results.push({
          site: 'Flipkart',
          title: title.substring(0, 100),
          price: parseFloat(priceText),
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

    console.log(`✅ Flipkart: Found ${results.length} results`);
    return results;

  } catch (error) {
    console.error(`❌ Flipkart scrape error: ${error.message}`);
    return [];
  } finally {
    if (browser) await browser.close();
  }
};

module.exports = { scrapeFlipkart };

