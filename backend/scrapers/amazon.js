// ✅ CORRECT - No StealthPlugin
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const cheerio = require('cheerio');

const scrapeAmazon = async (query) => {
    let browser;

    try {
        console.log(`🔍 Amazon: Searching for "${query}"...`);

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
                '--disable-webgl',
                '--disable-software-rasterizer',
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

        const searchUrl = `https://www.amazon.in/s?k=${encodeURIComponent(query)}`;

        await page.goto(searchUrl, {
            waitUntil: 'networkidle2',
            timeout: 30000,
        });

        await page.waitForSelector('[data-component-type="s-search-result"]', {
            timeout: 15000,
        }).catch(() => {
            console.warn('⚠️  Amazon: Product selector not found');
        });

        const html = await page.content();
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

            const image = $('img.s-image', el).attr('src') ||
                $('img[src*=".jpg"]', el).first().attr('src') || '';

            const relativeLink = $('h2 a.a-link-normal', el).attr('href') ||
                $('a.a-link-normal[href*="/dp/"]', el).first().attr('href') || '';

            const productUrl = relativeLink.startsWith('http')
                ? relativeLink
                : relativeLink
                    ? `https://www.amazon.in${relativeLink}`
                    : '';

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
        console.error(`❌ Amazon scrape error: ${error.message}`);
        return [];
    } finally {
        if (browser) await browser.close();
    }
};

module.exports = { scrapeAmazon };