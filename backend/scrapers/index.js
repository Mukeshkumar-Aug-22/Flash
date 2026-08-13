const axios = require('axios');

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
    const segments = pathname.replace(/^\//, '').split('/').filter(Boolean);
    const productSegment = segments[0] || '';
    const productName = productSegment.replace(/-/g, ' ').replace(/[^a-zA-Z0-9\s]/g, '').trim();
    return productName.split(' ').slice(0, 6).join(' ');
  } catch {
    return url;
  }
};

// ✅ FIXED: Handle null, undefined, and non-string values
const parsePrice = (priceStr) => {
  if (!priceStr) return null;
  
  // Convert to string if it's not already
  const str = String(priceStr);
  
  // Remove currency symbols and commas
  const cleaned = str.replace(/[₹$,]/g, '').replace(/,/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
};

const extractSiteName = (source) => {
  if (!source) return 'Unknown';
  const sourceLower = String(source).toLowerCase();
  if (sourceLower.includes('amazon')) return 'Amazon';
  if (sourceLower.includes('flipkart')) return 'Flipkart';
  if (sourceLower.includes('meesho')) return 'Meesho';
  if (sourceLower.includes('snapdeal')) return 'Snapdeal';
  if (sourceLower.includes('myntra')) return 'Myntra';
  if (sourceLower.includes('tata')) return 'Tata CLiQ';
  if (sourceLower.includes('reliance')) return 'Reliance Digital';
  if (sourceLower.includes('croma')) return 'Croma';
  return source.charAt(0).toUpperCase() + source.slice(1);
};

const searchProductWithSerpAPI = async (query) => {
  try {
    console.log(`🔍 Searching for "${query}" via SerpAPI...`);

    const API_KEY = process.env.SERPAPI_KEY;
    if (!API_KEY) {
      console.error('❌ SERPAPI_KEY not found in environment variables');
      return [];
    }

    const response = await axios.get('https://serpapi.com/search', {
      params: {
        api_key: API_KEY,
        engine: 'google_shopping',
        q: query,
        gl: 'in',
        hl: 'en',
        num: 10,
      },
      timeout: 30000,
    });

    const data = response.data;
    
    if (!data.shopping_results || data.shopping_results.length === 0) {
      console.log('⚠️ No shopping results found');
      return [];
    }

    const results = data.shopping_results.map((item) => ({
      site: extractSiteName(item.source || item.merchant || 'Unknown'),
      title: item.title || 'Product',
      price: parsePrice(item.price || '₹0'),
      originalPrice: parsePrice(item.original_price || item.extracted_price || ''),
      discount: item.discount || null,
      image: item.thumbnail || item.image || '',
      url: item.link || item.product_link || '#',
      rating: item.rating || null,
      ratingCount: item.reviews || null,
      inStock: item.in_stock !== false,
    }));

    // Filter out results with no valid price
    const validResults = results.filter(r => r.price !== null && r.price > 0);
    console.log(`✅ Found ${validResults.length} valid results from SerpAPI`);
    return validResults;

  } catch (error) {
    console.error(`❌ SerpAPI search error: ${error.message}`);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    return [];
  }
};

const runAllScrapers = async (query) => {
  const queryType = detectQueryType(query);
  let searchTerm = query;

  if (queryType === 'url') {
    searchTerm = extractProductNameFromUrl(query);
    console.log(`🔗 URL detected. Extracted search term: "${searchTerm}"`);
  }

  console.log(`\n⚡ Flash AI — Searching for: "${searchTerm}"`);
  console.log('━'.repeat(50));

  const startTime = Date.now();
  const results = await searchProductWithSerpAPI(searchTerm);
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  
  console.log('━'.repeat(50));
  console.log(`✅ Total results: ${results.length} | Time: ${elapsed}s\n`);

  return { results, searchTerm, queryType };
};

module.exports = { runAllScrapers, detectQueryType };