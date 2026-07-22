const { scrapeAmazon }   = require('./amazon');
const { scrapeFlipkart } = require('./flipkart');
const { scrapeMenush }   = require('./meesho');
const { scrapeSnapdeal } = require('./snapdeal');

// =============================================
//   detectQueryType
//   Figures out if the user gave a URL or a name
//   e.g. "https://www.amazon.in/..." → 'url'
//   e.g. "iPhone 15"                 → 'name'
// =============================================
const detectQueryType = (query) => {
  try {
    new URL(query);
    return 'url';
  } catch {
    return 'name';
  }
};

// =============================================
//   extractProductNameFromUrl
//   If user pastes a URL, we extract a keyword
//   from it to search other sites
//   e.g. "https://amazon.in/Apple-iPhone-15/dp/..."
//   → "Apple iPhone 15"
// =============================================
const extractProductNameFromUrl = (url) => {
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname;

    // Remove slashes and split by hyphens/underscores
    const segments = pathname
      .replace(/^\//, '')
      .split('/')
      .filter(Boolean);

    // First meaningful segment is usually the product name
    // e.g. /Apple-iPhone-15-128GB-Black/dp/XXXXXXXX
    const productSegment = segments[0] || '';

    // Replace hyphens with spaces and clean up
    const productName = productSegment
      .replace(/-/g, ' ')
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .trim();

    // Return first 6 words max to avoid overly long queries
    return productName.split(' ').slice(0, 6).join(' ');
  } catch {
    return url; // fallback to full url if parsing fails
  }
};

// =============================================
//   runAllScrapers
//   Main function — called by the controller
//   Runs all scrapers at the same time (parallel)
//   If one fails, others still return results
// =============================================
const runAllScrapers = async (query) => {
  const queryType = detectQueryType(query);
  let searchTerm = query;

  // If user pasted a URL, extract a product name from it
  if (queryType === 'url') {
    searchTerm = extractProductNameFromUrl(query);
    console.log(`🔗 URL detected. Extracted search term: "${searchTerm}"`);
  }

  console.log(`\n⚡ Flash AI — Running all scrapers for: "${searchTerm}"`);
  console.log('━'.repeat(50));

  const startTime = Date.now();

  // Run all scrapers simultaneously with Promise.allSettled
  // allSettled means even if Amazon fails, Flipkart still runs
  const scraperPromises = [
    scrapeAmazon(searchTerm),
    scrapeFlipkart(searchTerm),
    scrapeMenush(searchTerm),
    scrapeSnapdeal(searchTerm),
  ];

  const scraperNames = ['Amazon', 'Flipkart', 'Meesho', 'Snapdeal'];
  const settled = await Promise.allSettled(scraperPromises);

  let allResults = [];

  settled.forEach((result, index) => {
    if (result.status === 'fulfilled') {
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

  // Remove items with invalid/zero prices
  allResults = allResults.filter((item) => item.price && item.price > 0);

  // Sort by price: lowest first
  allResults.sort((a, b) => a.price - b.price);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log('━'.repeat(50));
  console.log(`✅ Total results: ${allResults.length} | Time: ${elapsed}s\n`);

  return { results: allResults, searchTerm, queryType };
};

module.exports = { runAllScrapers, detectQueryType };