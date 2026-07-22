// const axios = require('axios');
// const cheerio = require('cheerio');

// // =============================================
// //   Snapdeal Scraper
// //   Snapdeal allows simple axios requests
// //   No Puppeteer needed — much faster!
// // =============================================

// const scrapeSnapdeal = async (query) => {
//   try {
//     const searchUrl = `https://www.snapdeal.com/search?keyword=${encodeURIComponent(query)}&sort=rlvncy`;

//     console.log(`🔍 Snapdeal: Searching for "${query}"...`);

//     const { data } = await axios.get(searchUrl, {
//       headers: {
//         'User-Agent':
//           'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
//           'AppleWebKit/537.36 (KHTML, like Gecko) ' +
//           'Chrome/120.0.0.0 Safari/537.36',
//         'Accept-Language': 'en-IN,en;q=0.9',
//         'Accept': 'text/html,application/xhtml+xml',
//       },
//       timeout: 15000,
//     });

//     const $ = cheerio.load(data);
//     const results = [];

//     // Snapdeal product card selectors
//     $('.product-tuple-listing, .product-tuple-description').slice(0, 5).each((i, el) => {
//       const title =
//         $('p.product-title', el).text().trim() ||
//         $('.product-title', el).text().trim();

//       const priceText =
//         $('span.product-price', el).text().replace(/[₹,\s]/g, '').trim() ||
//         $('.lfloat.product-price', el).text().replace(/[₹,\s]/g, '').trim();

//       const originalPriceText =
//         $('span.product-desc-price.strike', el).text().replace(/[₹,\s]/g, '').trim();

//       const discount =
//         $('div.product-discount span', el).text().trim();

//       const image =
//         $('img.product-image', el).attr('src') ||
//         $('img.product-image', el).attr('data-src') || '';

//       const link = $('a.dp-widget-link', el).attr('href') || '';

//       if (title && priceText && parseFloat(priceText) > 0) {
//         results.push({
//           site: 'Snapdeal',
//           title,
//           price: parseFloat(priceText),
//           originalPrice: originalPriceText ? parseFloat(originalPriceText) : null,
//           discount: discount || null,
//           image,
//           url: link,
//           rating: null,
//           ratingCount: null,
//           inStock: true,
//         });
//       }
//     });

//     console.log(`✅ Snapdeal: Found ${results.length} results`);
//     return results;

//   } catch (error) {
//     console.error(`❌ Snapdeal scrape error: ${error.message}`);
//     return [];
//   }
// };

// module.exports = { scrapeSnapdeal };

const axios = require('axios');
const cheerio = require('cheerio');

const scrapeSnapdeal = async (query) => {
  try {
    console.log(`🔍 Snapdeal: Searching for "${query}"...`);

    const searchUrl = `https://www.snapdeal.com/search?keyword=${encodeURIComponent(query)}&sort=rlvncy`;

    const { data } = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-IN,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(data);
    const results = [];

    // Try all known Snapdeal card selectors
    const cardSelectors = [
      '.product-tuple-listing',
      '.product-tuple-description',
      '.favDp',
      'div[itemtype="http://schema.org/Product"]',
    ];

    let cards = $();
    for (const sel of cardSelectors) {
      const found = $(sel);
      if (found.length > 0) { cards = found; break; }
    }

    console.log(`   Snapdeal: Found ${cards.length} raw cards`);

    cards.slice(0, 6).each((i, el) => {
      // Title
      const title =
        $('p.product-title', el).text().trim() ||
        $('[class*="product-title"]', el).text().trim() ||
        $('p[itemprop="name"]', el).text().trim() ||
        $('.product-desc-rating p', el).text().trim();

      // Price
      const priceText =
        $('span.product-price', el).text().replace(/[₹,\s]/g, '').trim() ||
        $('[class*="product-price"]', el).first().text().replace(/[₹,\s]/g, '').trim() ||
        $('span[itemprop="price"]', el).text().replace(/[₹,\s]/g, '').trim();

      // Original price
      const originalPriceText =
        $('span.product-desc-price.strike', el).text().replace(/[₹,\s]/g, '').trim() ||
        $('[class*="strike"]', el).first().text().replace(/[₹,\s]/g, '').trim();

      // Discount
      const discount =
        $('div.product-discount span', el).text().trim() ||
        $('[class*="discount"]', el).first().text().trim();

      // Image
      const image =
        $('img.product-image', el).attr('src') ||
        $('img[class*="product"]', el).first().attr('src') ||
        $('img', el).first().attr('src') || '';

      // URL
      const link =
        $('a.dp-widget-link', el).attr('href') ||
        $('a[class*="dp-widget"]', el).attr('href') ||
        $('a', el).first().attr('href') || '';

      const price = parseFloat(priceText);

      if (title && price && price > 50) {
        results.push({
          site: 'Snapdeal',
          title: title.slice(0, 120),
          price,
          originalPrice: originalPriceText ? parseFloat(originalPriceText) : null,
          discount: discount || null,
          image,
          url: link,
          rating: null,
          ratingCount: null,
          inStock: true,
        });
      }
    });

    console.log(`✅ Snapdeal: Found ${results.length} results`);
    return results;

  } catch (error) {
    console.error(`❌ Snapdeal scrape error: ${error.message}`);
    return [];
  }
};

module.exports = { scrapeSnapdeal };