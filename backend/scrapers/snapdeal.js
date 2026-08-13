const axios = require('axios');
const cheerio = require('cheerio');

const scrapeSnapdeal = async (query, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const searchUrl = `https://www.snapdeal.com/search?keyword=${encodeURIComponent(query)}&sort=rlvncy`;

      console.log(`🔍 Snapdeal: Searching for "${query}" (Attempt ${attempt}/${retries})...`);

      // Add random delay
      const delay = Math.floor(Math.random() * 3000) + 1000;
      await new Promise(resolve => setTimeout(resolve, delay));

      const { data } = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
                        'AppleWebKit/537.36 (KHTML, like Gecko) ' +
                        'Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-IN,en;q=0.9',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        timeout: 20000,
      });

      if (!data || data.length < 500) {
        console.warn(`⚠️ Snapdeal: Received empty or partial HTML (Attempt ${attempt})`);
        continue;
      }

      const $ = cheerio.load(data);
      const results = [];

      $('.product-tuple-listing, .product-tuple-description').slice(0, 5).each((i, el) => {
        const title = $('p.product-title', el).text().trim() ||
                      $('.product-title', el).text().trim() ||
                      '';

        const priceText = $('span.product-price', el).text().replace(/[₹,\s]/g, '').trim() ||
                          $('.lfloat.product-price', el).text().replace(/[₹,\s]/g, '').trim() ||
                          '';

        const originalPriceText = $('span.product-desc-price.strike', el).text().replace(/[₹,\s]/g, '').trim();

        const discount = $('div.product-discount span', el).text().trim();

        const image = $('img.product-image', el).attr('src') ||
                      $('img.product-image', el).attr('data-src') || '';

        const link = $('a.dp-widget-link', el).attr('href') || '';

        if (title && priceText && parseFloat(priceText) > 0) {
          results.push({
            site: 'Snapdeal',
            title: title,
            price: parseFloat(priceText),
            originalPrice: originalPriceText ? parseFloat(originalPriceText) : null,
            discount: discount || null,
            image: image,
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
      console.error(`❌ Snapdeal scrape error (Attempt ${attempt}): ${error.message}`);
      if (attempt === retries) {
        return [];
      }
    }
  }
  
  return [];
};

module.exports = { scrapeSnapdeal };