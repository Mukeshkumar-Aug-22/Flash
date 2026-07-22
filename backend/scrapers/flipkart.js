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
//         '--window-size=1366,768',
//       ],
//     });

//     const page = await browser.newPage();

//     await page.setUserAgent(
//       'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
//     );
//     await page.setViewport({ width: 1366, height: 768 });

//     // Extra headers to look like a real browser
//     await page.setExtraHTTPHeaders({
//       'Accept-Language': 'en-IN,en;q=0.9',
//       'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
//     });

//     const searchUrl = `https://www.flipkart.com/search?q=${encodeURIComponent(query)}&otracker=search`;
//     console.log(`🔍 Flipkart: Searching for "${query}"...`);

//     await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 35000 });

//     // Close login popup if it appears
//     await page.evaluate(() => {
//       const btns = document.querySelectorAll('button');
//       for (const btn of btns) {
//         if (btn.textContent.trim() === '✕' || btn.textContent.includes('✕')) {
//           btn.click();
//           break;
//         }
//       }
//     }).catch(() => {});

//     // Wait for products to load
//     await new Promise(resolve => setTimeout(resolve, 2000));

//     const html = await page.content();
//     const $ = cheerio.load(html);
//     const results = [];

//     // Try every known Flipkart product card selector
//     const cardSelectors = [
//       'div[data-id]',           // universal product cards
//       '._1AtVbE',
//       '._2kHMtA',
//       '.cPHDOP',
//       '.col-12-12',
//     ];

//     let cards = $();
//     for (const sel of cardSelectors) {
//       const found = $(sel).filter((i, el) => {
//         // Only pick cards that actually have a price inside
//         return $(el).find('[class*="price"], [class*="Price"]').length > 0 ||
//                $(el).text().includes('₹');
//       });
//       if (found.length > 2) { cards = found; break; }
//     }

//     console.log(`   Flipkart: Found ${cards.length} raw cards`);

//     cards.slice(0, 6).each((i, el) => {
//       // Title — try all known title selectors
//       const title =
//         $('[class*="KzDlHZ"]', el).first().text().trim() ||
//         $('[class*="WKTcLC"]', el).first().text().trim() ||
//         $('[class*="s1Q9rs"]', el).first().text().trim() ||
//         $('[class*="_4rR01T"]', el).first().text().trim() ||
//         $('a[title]', el).first().attr('title') ||
//         $('a', el).first().text().trim();

//       // Price — find any element containing ₹
//       let price = null;
//       $('*', el).each((j, elem) => {
//         const text = $(elem).children().length === 0 ? $(elem).text().trim() : '';
//         if (text.startsWith('₹') && text.length < 12) {
//           const num = parseFloat(text.replace(/[₹,]/g, ''));
//           if (num > 100 && !price) price = num;
//         }
//       });

//       // Original price
//       const originalPriceText =
//         $('[class*="yRaY8j"]', el).first().text().replace(/[₹,]/g, '').trim() ||
//         $('[class*="_3I9_wc"]', el).first().text().replace(/[₹,]/g, '').trim();

//       // Discount
//       const discount =
//         $('[class*="UkUFwK"] span', el).first().text().trim() ||
//         $('[class*="_3Ay6Sb"]', el).first().text().trim();

//       // Image
//       const image =
//         $('img', el).first().attr('src') ||
//         $('img', el).first().attr('data-src') || '';

//       // URL
//       const relLink =
//         $('a[href*="/p/"]', el).first().attr('href') ||
//         $('a', el).first().attr('href') || '';
//       const url = relLink.startsWith('http')
//         ? relLink
//         : `https://www.flipkart.com${relLink}`;

//       // Rating
//       const ratingText = $('[class*="XQDdHH"]', el).first().text().trim() ||
//                          $('[class*="_3LWZlK"]', el).first().text().trim();
//       const rating = parseFloat(ratingText) || null;

//       if (title && price && price > 100) {
//         results.push({
//           site: 'Flipkart',
//           title: title.slice(0, 120),
//           price,
//           originalPrice: originalPriceText ? parseFloat(originalPriceText) : null,
//           discount: discount || null,
//           image,
//           url,
//           rating,
//           ratingCount: null,
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

const isRelevant = (title, query) => {
  if (!title || !query) return false;
  const titleLower = title.toLowerCase();
  const queryWords = query.toLowerCase().split(' ').filter(w => w.length > 2);
  const matchCount = queryWords.filter(word => titleLower.includes(word)).length;
  return matchCount >= Math.ceil(queryWords.length / 2);
};

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
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    });

    const searchUrl = `https://www.flipkart.com/search?q=${encodeURIComponent(query)}&otracker=search`;
    console.log(`🔍 Flipkart: Searching for "${query}"...`);

    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 35000 });

    // Close login popup if it appears
    await page.evaluate(() => {
      const btns = document.querySelectorAll('button');
      for (const btn of btns) {
        if (btn.textContent.trim() === '✕' || btn.textContent.includes('✕')) {
          btn.click(); break;
        }
      }
    }).catch(() => {});

    await new Promise(resolve => setTimeout(resolve, 2000));

    const html = await page.content();
    const $ = cheerio.load(html);
    const results = [];

    const cardSelectors = [
      'div[data-id]',
      '._1AtVbE',
      '._2kHMtA',
      '.cPHDOP',
      '.col-12-12',
    ];

    let cards = $();
    for (const sel of cardSelectors) {
      const found = $(sel).filter((i, el) => {
        return $(el).find('[class*="price"], [class*="Price"]').length > 0 ||
               $(el).text().includes('₹');
      });
      if (found.length > 2) { cards = found; break; }
    }

    console.log(`   Flipkart: Found ${cards.length} raw cards`);

    cards.slice(0, 10).each((i, el) => {
      const title =
        $('[class*="KzDlHZ"]', el).first().text().trim() ||
        $('[class*="WKTcLC"]', el).first().text().trim() ||
        $('[class*="s1Q9rs"]', el).first().text().trim() ||
        $('[class*="_4rR01T"]', el).first().text().trim() ||
        $('a[title]', el).first().attr('title') ||
        $('a', el).first().text().trim();

      let price = null;
      $('*', el).each((j, elem) => {
        const text = $(elem).children().length === 0 ? $(elem).text().trim() : '';
        if (text.startsWith('₹') && text.length < 12) {
          const num = parseFloat(text.replace(/[₹,]/g, ''));
          if (num > 100 && !price) price = num;
        }
      });

      const originalPriceText =
        $('[class*="yRaY8j"]', el).first().text().replace(/[₹,]/g, '').trim() ||
        $('[class*="_3I9_wc"]', el).first().text().replace(/[₹,]/g, '').trim();

      const discount =
        $('[class*="UkUFwK"] span', el).first().text().trim() ||
        $('[class*="_3Ay6Sb"]', el).first().text().trim();

      const image =
        $('img', el).first().attr('src') ||
        $('img', el).first().attr('data-src') || '';

      const relLink =
        $('a[href*="/p/"]', el).first().attr('href') ||
        $('a', el).first().attr('href') || '';
      const url = relLink.startsWith('http')
        ? relLink
        : `https://www.flipkart.com${relLink}`;

      const ratingText =
        $('[class*="XQDdHH"]', el).first().text().trim() ||
        $('[class*="_3LWZlK"]', el).first().text().trim();
      const rating = parseFloat(ratingText) || null;

      // ── Only add relevant results ──
      if (title && price && price > 100 && isRelevant(title, query)) {
        results.push({
          site: 'Flipkart',
          title: title.slice(0, 120),
          price,
          originalPrice: originalPriceText ? parseFloat(originalPriceText) : null,
          discount: discount || null,
          image,
          url,
          rating,
          ratingCount: null,
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