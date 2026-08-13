// const puppeteer = require('puppeteer');
// const cheerio = require('cheerio');

// const scrapeFlipkart = async (query, retries = 3) => {
//   let browser;

//   for (let attempt = 1; attempt <= retries; attempt++) {
//     try {
//       console.log(`🔍 Flipkart: Searching for "${query}" (Attempt ${attempt}/${retries})...`);

//       browser = await puppeteer.launch({
//         headless: true,
//         args: [
//           '--no-sandbox',
//           '--disable-setuid-sandbox',
//           '--disable-dev-shm-usage',
//           '--disable-gpu',
//           '--window-size=1366,768',
//         ],
//         ignoreHTTPSErrors: true,
//       });

//       const page = await browser.newPage();

//       await page.setUserAgent(
//         'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
//         'AppleWebKit/537.36 (KHTML, like Gecko) ' +
//         'Chrome/120.0.0.0 Safari/537.36'
//       );

//       await page.setViewport({ width: 1366, height: 768 });

//       const searchUrl = `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`;

//       const delay = Math.floor(Math.random() * 3000) + 1000;
//       await new Promise(resolve => setTimeout(resolve, delay));

//       await page.goto(searchUrl, {
//         waitUntil: 'networkidle2',
//         timeout: 45000,
//       });

//       await page.evaluate(() => {
//         const closeBtn = document.querySelector('button._2KpZ6l._2doB4z');
//         if (closeBtn) closeBtn.click();
//       }).catch(() => {});

//       await page.evaluate(async () => {
//         await new Promise((resolve) => {
//           let totalHeight = 0;
//           const distance = 500;
//           const timer = setInterval(() => {
//             const scrollHeight = document.body.scrollHeight;
//             window.scrollBy(0, distance);
//             totalHeight += distance;
//             if (totalHeight >= scrollHeight || totalHeight > 3000) {
//               clearInterval(timer);
//               resolve();
//             }
//           }, 500);
//         });
//       });

//       await new Promise(resolve => setTimeout(resolve, 2000));

//       const html = await page.content();
//       const $ = cheerio.load(html);
//       const results = [];

//       const productSelectors = [
//         '._1AtVbE',
//         '._2kHMtA',
//         '.cPHDOP',
//         '._13oc-S',
//         '.tUxRFH',
//         '._75nlfW',
//       ];

//       let productEls = $();
//       for (const sel of productSelectors) {
//         productEls = $(sel);
//         if (productEls.length > 0) {
//           console.log(`✅ Flipkart: Using selector "${sel}"`);
//           break;
//         }
//       }

//       productEls.each((i, el) => {
//         if (i >= 8) return false;

//         const title = $('._4rR01T', el).first().text().trim() ||
//                       $('.s1Q9rs', el).first().text().trim() ||
//                       $('.IRpwTa', el).first().text().trim() ||
//                       $('a[title]', el).first().attr('title') ||
//                       '';

//         let priceText = $('._30jeq3', el).first().text().replace(/[₹,]/g, '').trim();
//         if (!priceText) {
//           priceText = $('.Nx9bqj', el).first().text().replace(/[₹,]/g, '').trim();
//         }
//         if (!priceText) {
//           priceText = $('._16Jk6d', el).first().text().replace(/[₹,]/g, '').trim();
//         }

//         const image = $('img._396cs4', el).first().attr('src') ||
//                       $('img._2r_T1I', el).first().attr('src') ||
//                       $('img.DByuf4', el).first().attr('src') || '';

//         const relativeLink = $('a._1fQZEK', el).first().attr('href') ||
//                              $('a.s1Q9rs', el).first().attr('href') ||
//                              $('a.CGtC98', el).first().attr('href') || '';

//         const productUrl = relativeLink.startsWith('http')
//           ? relativeLink
//           : `https://www.flipkart.com${relativeLink}`;

//         if (title && priceText && parseFloat(priceText) > 0) {
//           results.push({
//             site: 'Flipkart',
//             title: title,
//             price: parseFloat(priceText),
//             originalPrice: null,
//             discount: null,
//             image: image,
//             url: productUrl,
//             rating: null,
//             ratingCount: null,
//             inStock: true,
//           });
//         }
//       });

//       console.log(`✅ Flipkart: Found ${results.length} results`);
//       return results;

//     } catch (error) {
//       console.error(`❌ Flipkart scrape error (Attempt ${attempt}): ${error.message}`);
//       if (attempt === retries) {
//         return [];
//       }
//     } finally {
//       if (browser) await browser.close();
//     }
//   }
  
//   return [];
// };

// module.exports = { scrapeFlipkart };

const cheerio = require('cheerio');

const scrapeFlipkart = async (query, browser) => {
  try {
    console.log(`🔍 Flipkart: Searching for "${query}"...`);

    // ✅ Use the shared browser instance
    const page = await browser.newPage();

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
      'AppleWebKit/537.36 (KHTML, like Gecko) ' +
      'Chrome/120.0.0.0 Safari/537.36'
    );

    await page.setViewport({ width: 1366, height: 768 });

    const searchUrl = `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`;

    await page.goto(searchUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    await page.evaluate(() => {
      const closeBtn = document.querySelector('button._2KpZ6l._2doB4z');
      if (closeBtn) closeBtn.click();
    }).catch(() => {});

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

    const productSelectors = [
      '._1AtVbE',
      '._2kHMtA',
      '.cPHDOP',
      '._13oc-S',
      '.tUxRFH',
      '._75nlfW',
    ];

    let productEls = $();
    for (const sel of productSelectors) {
      productEls = $(sel);
      if (productEls.length > 0) {
        console.log(`✅ Flipkart: Using selector "${sel}"`);
        break;
      }
    }

    productEls.each((i, el) => {
      if (i >= 8) return false;

      const title = $('._4rR01T', el).first().text().trim() ||
                    $('.s1Q9rs', el).first().text().trim() ||
                    $('.IRpwTa', el).first().text().trim() ||
                    $('a[title]', el).first().attr('title') ||
                    '';

      let priceText = $('._30jeq3', el).first().text().replace(/[₹,]/g, '').trim();
      if (!priceText) {
        priceText = $('.Nx9bqj', el).first().text().replace(/[₹,]/g, '').trim();
      }
      if (!priceText) {
        priceText = $('._16Jk6d', el).first().text().replace(/[₹,]/g, '').trim();
      }

      const image = $('img._396cs4', el).first().attr('src') ||
                    $('img._2r_T1I', el).first().attr('src') ||
                    $('img.DByuf4', el).first().attr('src') || '';

      const relativeLink = $('a._1fQZEK', el).first().attr('href') ||
                           $('a.s1Q9rs', el).first().attr('href') ||
                           $('a.CGtC98', el).first().attr('href') || '';

      const productUrl = relativeLink.startsWith('http')
        ? relativeLink
        : `https://www.flipkart.com${relativeLink}`;

      if (title && priceText && parseFloat(priceText) > 0) {
        results.push({
          site: 'Flipkart',
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

    console.log(`✅ Flipkart: Found ${results.length} results`);
    await page.close(); // ✅ Close the page, not the browser
    return results;

  } catch (error) {
    console.error(`❌ Flipkart scrape error: ${error.message}`);
    return [];
  }
};

module.exports = { scrapeFlipkart };