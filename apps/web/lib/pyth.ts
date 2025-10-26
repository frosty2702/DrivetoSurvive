// Mock Pyth integration since we're having issues with the actual package
// This simulates the functionality while maintaining the same API

// Pyth Price Feed IDs (these are the actual IDs from Pyth)
export const PRICE_FEED_IDS = {
  // Crypto price feeds - we'll use these to simulate driver performance
  BTC_USD: '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
  ETH_USD: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
  SOL_USD: '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d',
  AVAX_USD: '0x93da3352f9f1d105fdfe4971cfa80e9dd777bfc5d0f683ebb6e1294b92137bb7',
  MATIC_USD: '0x5de33a9112c2b700b8d30b8a3402c103578ccfa2765696471cc672bd5cf6ac52',
};

// Driver to price feed mapping
export const DRIVER_PRICE_FEEDS = {
  'Max Verstappen': PRICE_FEED_IDS.BTC_USD,  // Top driver mapped to BTC
  'Yuki Tsunoda': PRICE_FEED_IDS.ETH_USD,    // Second driver mapped to ETH
  'Lewis Hamilton': PRICE_FEED_IDS.SOL_USD,
  'Charles Leclerc': PRICE_FEED_IDS.AVAX_USD,
  'Lando Norris': PRICE_FEED_IDS.MATIC_USD,
  'Andrea Kimi Antonelli': PRICE_FEED_IDS.MATIC_USD,
};

// Mock price data
const MOCK_PRICES = {
  [PRICE_FEED_IDS.BTC_USD]: { price: 68000, confidence: 100, timestamp: Date.now() },
  [PRICE_FEED_IDS.ETH_USD]: { price: 3500, confidence: 50, timestamp: Date.now() },
  [PRICE_FEED_IDS.SOL_USD]: { price: 180, confidence: 30, timestamp: Date.now() },
  [PRICE_FEED_IDS.AVAX_USD]: { price: 35, confidence: 20, timestamp: Date.now() },
  [PRICE_FEED_IDS.MATIC_USD]: { price: 0.85, confidence: 10, timestamp: Date.now() },
};

// Mock Pyth price service connection
class MockPythConnection {
  endpoint: string;
  
  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }
  
  async getLatestPriceFeeds(priceIds: string[]) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Generate slightly different prices each time to simulate market movement
    const variation = () => (Math.random() * 0.1) - 0.05; // -5% to +5%
    
    return priceIds.map(id => {
      const basePrice = MOCK_PRICES[id].price;
      const newPrice = basePrice * (1 + variation());
      
      return {
        id,
        price: {
          price: newPrice,
          conf: MOCK_PRICES[id].confidence,
          expo: 0, // No exponent for simplicity
          publishTime: Date.now(),
        }
      };
    });
  }
}

// Export a mock connection that mimics the Pyth API
export const pythConnection = new MockPythConnection('https://hermes.pyth.network');

// Get price for a specific driver based on price feed
export async function getDriverPrice(driverName: string): Promise<{ 
  price: number; 
  confidence: number;
  timestamp: number;
}> {
  try {
    const feedId = DRIVER_PRICE_FEEDS[driverName as keyof typeof DRIVER_PRICE_FEEDS];
    
    if (!feedId) {
      throw new Error(`No price feed configured for driver: ${driverName}`);
    }
    
    const priceFeeds = await pythConnection.getLatestPriceFeeds([feedId]);
    
    if (!priceFeeds || priceFeeds.length === 0) {
      throw new Error('Failed to fetch price feed');
    }
    
    const priceFeed = priceFeeds[0];
    const price = priceFeed.price.price;
    const confidence = priceFeed.price.conf;
    const timestamp = priceFeed.price.publishTime;
    
    return {
      price,
      confidence,
      timestamp
    };
  } catch (error) {
    console.error('Error fetching driver price:', error);
    throw error;
  }
}

// Calculate driver performance score based on price data
export function calculatePerformanceScore(price: number, priceChange24h: number): number {
  // Simulate performance score based on price and 24h change
  // This is a simplified model - in a real app, you'd have more sophisticated calculations
  const baseScore = Math.min(100, Math.max(0, price / 100)); // Scale price to 0-100 range
  const changeImpact = priceChange24h > 0 ? 
    Math.min(20, priceChange24h * 2) : 
    Math.max(-20, priceChange24h * 2);
  
  return Math.min(100, Math.max(0, baseScore + changeImpact));
}

// Calculate market value based on performance score and other factors
export function calculateMarketValue(
  performanceScore: number, 
  baseValue: number = 1000000, // $1M base value
  sponsorMultiplier: number = 1.5, // Sponsor boost
  fanDemandMultiplier: number = 1.2 // Fan demand boost
): number {
  const performanceMultiplier = performanceScore / 50; // 0-2 range
  return baseValue * performanceMultiplier * sponsorMultiplier * fanDemandMultiplier;
}