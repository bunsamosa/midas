import { DeFiRiskAssessor } from '../riskAssessment';
import { SwapParameters, TokenInfo } from '../riskAssessment';

// Mock provider for testing
const mockProvider = {
  getGasPrice: jest.fn().mockResolvedValue('20000000000'), // 20 gwei
};

jest.mock('ethers', () => ({
  providers: {
    JsonRpcProvider: jest.fn().mockImplementation(() => mockProvider),
  },
  Contract: jest.fn().mockImplementation(() => ({
    totalSupply: jest.fn().mockResolvedValue('1000000000000000000000000'),
    owner: jest.fn().mockResolvedValue('0x0000000000000000000000000000000000000000'),
  })),
  utils: {
    formatUnits: jest.fn().mockReturnValue('20'),
    parseEther: jest.fn().mockReturnValue('1000000000000000000'),
  },
  constants: {
    AddressZero: '0x0000000000000000000000000000000000000000',
  },
}));

describe('DeFiRiskAssessor', () => {
  let riskAssessor: DeFiRiskAssessor;

  beforeEach(() => {
    riskAssessor = new DeFiRiskAssessor('https://test-rpc.com');
  });

  describe('Liquidity Risk Assessment', () => {
    it('should detect high liquidity risk for large swaps', async () => {
      const swapParams: SwapParameters = {
        fromToken: '0x123',
        toToken: '0x456',
        amount: '1000000', // $1M swap
        slippageTolerance: 1,
      };

      const fromToken: TokenInfo = {
        address: '0x123',
        symbol: 'ETH',
        name: 'Ethereum',
        decimals: 18,
        liquidity: 10000000, // $10M liquidity
      };

      const toToken: TokenInfo = {
        address: '0x456',
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        liquidity: 5000000, // $5M liquidity
      };

      const assessment = await riskAssessor.assessSwapRisk(swapParams, fromToken, toToken);
      
      const liquidityRisk = assessment.riskFactors.find(f => f.type === 'LIQUIDITY_RISK');
      expect(liquidityRisk).toBeDefined();
      expect(liquidityRisk?.severity).toBe('HIGH');
    });

    it('should detect medium liquidity risk for low liquidity tokens', async () => {
      const swapParams: SwapParameters = {
        fromToken: '0x123',
        toToken: '0x456',
        amount: '1000',
        slippageTolerance: 1,
      };

      const fromToken: TokenInfo = {
        address: '0x123',
        symbol: 'ETH',
        name: 'Ethereum',
        decimals: 18,
        liquidity: 1000000,
      };

      const toToken: TokenInfo = {
        address: '0x456',
        symbol: 'UNKNOWN',
        name: 'Unknown Token',
        decimals: 18,
        liquidity: 50000, // Low liquidity
      };

      const assessment = await riskAssessor.assessSwapRisk(swapParams, fromToken, toToken);
      
      const liquidityRisk = assessment.riskFactors.find(f => f.type === 'LIQUIDITY_RISK');
      expect(liquidityRisk).toBeDefined();
      expect(liquidityRisk?.severity).toBe('MEDIUM');
    });
  });

  describe('Contract Risk Assessment', () => {
    it('should detect high contract risk for unverified tokens', async () => {
      const swapParams: SwapParameters = {
        fromToken: '0x123',
        toToken: '0x456',
        amount: '1000',
        slippageTolerance: 1,
      };

      const fromToken: TokenInfo = {
        address: '0x123',
        symbol: 'ETH',
        name: 'Ethereum',
        decimals: 18,
        isVerified: true,
      };

      const toToken: TokenInfo = {
        address: '0x456',
        symbol: 'UNKNOWN',
        name: 'Unknown Token',
        decimals: 18,
        isVerified: false, // Unverified contract
      };

      const assessment = await riskAssessor.assessSwapRisk(swapParams, fromToken, toToken);
      
      const contractRisk = assessment.riskFactors.find(f => f.type === 'CONTRACT_RISK');
      expect(contractRisk).toBeDefined();
      expect(contractRisk?.severity).toBe('HIGH');
    });

    it('should detect medium contract risk for unaudited tokens', async () => {
      const swapParams: SwapParameters = {
        fromToken: '0x123',
        toToken: '0x456',
        amount: '1000',
        slippageTolerance: 1,
      };

      const fromToken: TokenInfo = {
        address: '0x123',
        symbol: 'ETH',
        name: 'Ethereum',
        decimals: 18,
        isVerified: true,
        auditStatus: 'AUDITED',
      };

      const toToken: TokenInfo = {
        address: '0x456',
        symbol: 'NEW',
        name: 'New Token',
        decimals: 18,
        isVerified: true,
        auditStatus: 'UNAUDITED', // Unaudited
      };

      const assessment = await riskAssessor.assessSwapRisk(swapParams, fromToken, toToken);
      
      const contractRisk = assessment.riskFactors.find(f => f.type === 'CONTRACT_RISK');
      expect(contractRisk).toBeDefined();
      expect(contractRisk?.severity).toBe('MEDIUM');
    });
  });

  describe('Volatility Risk Assessment', () => {
    it('should detect high volatility risk for volatile tokens', async () => {
      const swapParams: SwapParameters = {
        fromToken: '0x123',
        toToken: '0x456',
        amount: '1000',
        slippageTolerance: 1,
      };

      const fromToken: TokenInfo = {
        address: '0x123',
        symbol: 'ETH',
        name: 'Ethereum',
        decimals: 18,
        priceChange24h: 2.5,
      };

      const toToken: TokenInfo = {
        address: '0x456',
        symbol: 'VOLATILE',
        name: 'Volatile Token',
        decimals: 18,
        priceChange24h: 45.5, // High volatility
      };

      const assessment = await riskAssessor.assessSwapRisk(swapParams, fromToken, toToken);
      
      const volatilityRisk = assessment.riskFactors.find(f => f.type === 'VOLATILITY_RISK');
      expect(volatilityRisk).toBeDefined();
      expect(volatilityRisk?.severity).toBe('HIGH');
    });

    it('should detect medium volatility risk for moderately volatile tokens', async () => {
      const swapParams: SwapParameters = {
        fromToken: '0x123',
        toToken: '0x456',
        amount: '1000',
        slippageTolerance: 1,
      };

      const fromToken: TokenInfo = {
        address: '0x123',
        symbol: 'ETH',
        name: 'Ethereum',
        decimals: 18,
        priceChange24h: 2.5,
      };

      const toToken: TokenInfo = {
        address: '0x456',
        symbol: 'MODERATE',
        name: 'Moderate Token',
        decimals: 18,
        priceChange24h: 15.5, // Moderate volatility
      };

      const assessment = await riskAssessor.assessSwapRisk(swapParams, fromToken, toToken);
      
      const volatilityRisk = assessment.riskFactors.find(f => f.type === 'VOLATILITY_RISK');
      expect(volatilityRisk).toBeDefined();
      expect(volatilityRisk?.severity).toBe('MEDIUM');
    });
  });

  describe('Slippage Risk Assessment', () => {
    it('should detect high slippage risk for high slippage tolerance', async () => {
      const swapParams: SwapParameters = {
        fromToken: '0x123',
        toToken: '0x456',
        amount: '1000',
        slippageTolerance: 10, // High slippage
      };

      const fromToken: TokenInfo = {
        address: '0x123',
        symbol: 'ETH',
        name: 'Ethereum',
        decimals: 18,
      };

      const toToken: TokenInfo = {
        address: '0x456',
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        liquidity: 1000000,
      };

      const assessment = await riskAssessor.assessSwapRisk(swapParams, fromToken, toToken);
      
      const slippageRisk = assessment.riskFactors.find(f => f.type === 'SLIPPAGE_RISK');
      expect(slippageRisk).toBeDefined();
      expect(slippageRisk?.severity).toBe('HIGH');
    });
  });

  describe('MEV Risk Assessment', () => {
    it('should detect medium MEV risk for large swaps', async () => {
      const swapParams: SwapParameters = {
        fromToken: '0x123',
        toToken: '0x456',
        amount: '50000', // Large swap
        slippageTolerance: 1,
      };

      const fromToken: TokenInfo = {
        address: '0x123',
        symbol: 'ETH',
        name: 'Ethereum',
        decimals: 18,
      };

      const toToken: TokenInfo = {
        address: '0x456',
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
      };

      const assessment = await riskAssessor.assessSwapRisk(swapParams, fromToken, toToken);
      
      const mevRisk = assessment.riskFactors.find(f => f.type === 'MEV_RISK');
      expect(mevRisk).toBeDefined();
      expect(mevRisk?.severity).toBe('MEDIUM');
    });
  });

  describe('Token Risk Assessment', () => {
    it('should detect high token risk for tokens with few holders', async () => {
      const swapParams: SwapParameters = {
        fromToken: '0x123',
        toToken: '0x456',
        amount: '1000',
        slippageTolerance: 1,
      };

      const fromToken: TokenInfo = {
        address: '0x123',
        symbol: 'ETH',
        name: 'Ethereum',
        decimals: 18,
      };

      const toToken: TokenInfo = {
        address: '0x456',
        symbol: 'SCAM',
        name: 'Suspicious Token',
        decimals: 18,
        holders: 50, // Very few holders
      };

      const assessment = await riskAssessor.assessSwapRisk(swapParams, fromToken, toToken);
      
      const tokenRisk = assessment.riskFactors.find(f => f.type === 'TOKEN_RISK');
      expect(tokenRisk).toBeDefined();
      expect(tokenRisk?.severity).toBe('HIGH');
    });

    it('should detect medium token risk for low market cap tokens', async () => {
      const swapParams: SwapParameters = {
        fromToken: '0x123',
        toToken: '0x456',
        amount: '1000',
        slippageTolerance: 1,
      };

      const fromToken: TokenInfo = {
        address: '0x123',
        symbol: 'ETH',
        name: 'Ethereum',
        decimals: 18,
      };

      const toToken: TokenInfo = {
        address: '0x456',
        symbol: 'SMALL',
        name: 'Small Token',
        decimals: 18,
        marketCap: 50000, // Low market cap
      };

      const assessment = await riskAssessor.assessSwapRisk(swapParams, fromToken, toToken);
      
      const tokenRisk = assessment.riskFactors.find(f => f.type === 'TOKEN_RISK');
      expect(tokenRisk).toBeDefined();
      expect(tokenRisk?.severity).toBe('MEDIUM');
    });
  });

  describe('Overall Risk Calculation', () => {
    it('should calculate LOW risk for safe swaps', async () => {
      const swapParams: SwapParameters = {
        fromToken: '0x123',
        toToken: '0x456',
        amount: '1000',
        slippageTolerance: 1,
      };

      const fromToken: TokenInfo = {
        address: '0x123',
        symbol: 'ETH',
        name: 'Ethereum',
        decimals: 18,
        marketCap: 200000000000,
        volume24h: 5000000000,
        priceChange24h: 2.5,
        liquidity: 1000000000,
        holders: 1000000,
        isVerified: true,
        auditStatus: 'AUDITED',
      };

      const toToken: TokenInfo = {
        address: '0x456',
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        marketCap: 25000000000,
        volume24h: 2000000000,
        priceChange24h: 0.1,
        liquidity: 500000000,
        holders: 500000,
        isVerified: true,
        auditStatus: 'AUDITED',
      };

      const assessment = await riskAssessor.assessSwapRisk(swapParams, fromToken, toToken);
      
      expect(assessment.overallRisk).toBe('LOW');
      expect(assessment.riskScore).toBeLessThan(25);
    });

    it('should calculate CRITICAL risk for dangerous swaps', async () => {
      const swapParams: SwapParameters = {
        fromToken: '0x123',
        toToken: '0x456',
        amount: '100000',
        slippageTolerance: 10,
      };

      const fromToken: TokenInfo = {
        address: '0x123',
        symbol: 'ETH',
        name: 'Ethereum',
        decimals: 18,
      };

      const toToken: TokenInfo = {
        address: '0x456',
        symbol: 'SCAM',
        name: 'Suspicious Token',
        decimals: 18,
        marketCap: 1000,
        volume24h: 100,
        priceChange24h: 200.0,
        liquidity: 100,
        holders: 5,
        isVerified: false,
        auditStatus: 'UNAUDITED',
      };

      const assessment = await riskAssessor.assessSwapRisk(swapParams, fromToken, toToken);
      
      expect(assessment.overallRisk).toBe('CRITICAL');
      expect(assessment.riskScore).toBeGreaterThanOrEqual(75);
    });
  });

  describe('Recommendations', () => {
    it('should generate appropriate recommendations for high risk', async () => {
      const swapParams: SwapParameters = {
        fromToken: '0x123',
        toToken: '0x456',
        amount: '50000',
        slippageTolerance: 5,
      };

      const fromToken: TokenInfo = {
        address: '0x123',
        symbol: 'ETH',
        name: 'Ethereum',
        decimals: 18,
      };

      const toToken: TokenInfo = {
        address: '0x456',
        symbol: 'UNKNOWN',
        name: 'Unknown Token',
        decimals: 18,
        isVerified: false,
        liquidity: 50000,
      };

      const assessment = await riskAssessor.assessSwapRisk(swapParams, fromToken, toToken);
      
      expect(assessment.recommendations.length).toBeGreaterThan(0);
      expect(assessment.recommendations.some(rec => rec.includes('HIGH RISK'))).toBe(true);
    });
  });
}); 