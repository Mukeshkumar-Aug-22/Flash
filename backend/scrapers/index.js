const { scrapeAmazon } = require('./amazon');
const { scrapeFlipkart } = require('./flipkart');
const { scrapeMeesho } = require('./meesho');
const { scrapeSnapdeal } = require('./snapdeal');

const detectQueryType = (query) => {
  try {
    new URL(query);
    return 'url';
  } catch {
    return 'name';
  }
};

const extractProductNameFromUrl = (url) => {
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname;

    const segments = pathname
      .replace(/^\//, '')
      .split('/')
      .filter(Boolean);

    const productSegment = segments[0] || '';

    const productName = productSegment
      .replace(/-/g, ' ')
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .trim();

    return productName.split(' ').slice(0, 6).join(' ');
  } catch {
    return url;
  }
};

const runAllScrapers = async (query) => {
  const queryType = detectQueryType(query);
  let searchTerm = query;

  if (queryType === 'url') {
    searchTerm = extractProductNameFromUrl(query);
    console.log(`🔗 URL detected. Extracted search term: "${searchTerm}"`);
  }

  console.log(`\n⚡ Flash AI — Running all scrapers for: "${searchTerm}"`);
  console.log('━'.repeat(50));

  const startTime = Date.now();

  const scraperPromises = [
    scrapeAmazon(searchTerm),
    scrapeFlipkart(searchTerm),
    scrapeMeesho(searchTerm),
    scrapeSnapdeal(searchTerm),
  ];

  const scraperNames = ['Amazon', 'Flipkart', 'Meesho', 'Snapdeal'];
  const settled = await Promise.allSettled(scraperPromises);

  let allResults = [];

  settled.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      console.log(`✅ ${scraperNames[index]}: ${result.value.length} results`);
      allResults = [...allResults, ...result.value];
    } else {
      console.error(`❌ ${scraperNames[index]} failed:`, result.reason?.message);
    }
  });

  // Remove duplicates based on URL
  const seen = new Set();
  allResults = allResults.filter((item) => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });

  // Remove items with invalid prices
  allResults = allResults.filter((item) => item.price && item.price > 0);

  // Sort by price (lowest first)
  allResults.sort((a, b) => a.price - b.price);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log('━'.repeat(50));
  console.log(`✅ Total unique results: ${allResults.length} | Time: ${elapsed}s\n`);

  return { results: allResults, searchTerm, queryType };
};

module.exports = { runAllScrapers, detectQueryType };