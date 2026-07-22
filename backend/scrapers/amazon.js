const puppeteer = require('puppeteer-extra');

const StealthPlugin  = require('puppeteer-extra-plugin-stealth');

const cheerio = require('cheerio');

puppeteer.use(StealthPlugin ());

const scrapeAmazon = async (query) => {

    let browser;

    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
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

        const searchUrl = `https://www.amazon.in/s?k=${encodeURIComponent(query)}&ref=nb_sb_noss`;

        console.log(`🔍 Amazon: Searching for "${query}"...`);

        await page.goto(searchUrl, {
            waitUntil: 'domcontentloaded',
            timeout: 30000,
        });

        // Wait for product results to load
        await page.waitForSelector('[data-component-type="s-search-result"]', {
            timeout: 10000,
        }).catch(() => {
            console.warn('⚠️  Amazon: Product selector not found, page may have changed');
        });

        const html = await page.content();
        const $ = cheerio.load(html);
        const results = [];

        // Loop through first 5 product cards
        $('[data-component-type="s-search-result"]').slice(0, 5).each((i, el) => {
            // Product title
            const title = $('h2 span.a-text-normal', el).text().trim() ||
                $('h2 span', el).first().text().trim();

            // Price (whole number part)
            const priceWhole = $('.a-price-whole', el).first().text()
                .replace(/[,\.]/g, '').trim();

            // Original price (MRP / crossed out)
            const originalPriceText = $('.a-price.a-text-price span.a-offscreen', el)
                .first().text().replace(/[₹,]/g, '').trim();

            // Discount percentage
            const discount = $('.a-badge-text', el).first().text().trim() ||
                $('[data-component-type="s-editorial-image-carousel"] .a-badge-text', el)
                    .first().text().trim();

            // Product image
            const image = $('img.s-image', el).attr('src') || '';

            // Product URL
            const relativeLink = $('h2 a.a-link-normal', el).attr('href') || '';
            const productUrl = relativeLink.startsWith('http')
                ? relativeLink
                : `https://www.amazon.in${relativeLink}`;

            // Rating (e.g. "4.3 out of 5 stars" → 4.3)
            const ratingText = $('.a-icon-alt', el).first().text();
            const rating = parseFloat(ratingText) || null;

            // Rating count (e.g. "12,345")
            const ratingCount = $('.a-size-base.s-underline-text', el).first().text().trim();

            // Only push if title and price both exist
            if (title && priceWhole) {
                results.push({
                    site: 'Amazon',
                    title,
                    price: parseFloat(priceWhole),
                    originalPrice: originalPriceText ? parseFloat(originalPriceText) : null,
                    discount: discount || null,
                    image,
                    url: productUrl,
                    rating,
                    ratingCount: ratingCount || null,
                    inStock: true,
                });
            }
        });

        console.log(`✅ Amazon: Found ${results.length} results`);
        return results;

    } catch (error) {
        console.error(`❌ Amazon scrape error: ${error.message}`);
        return []; // Return empty array so other scrapers still run
    } finally {
        if (browser) await browser.close();
    }
};

module.exports = { scrapeAmazon };
