#!/usr/bin/env node

const { DeFiRiskAssessor } = require('../app/utils/riskAssessment');

// Test scenarios
const testScenarios = [
  {
    name: "Safe ETH to USDC Swap",
    fromToken: {
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      marketCap: 200000000000,
      volume24h: 5000000000,
      priceChange24h: 2.5,
      liquidity: 1000000000,
      holders: 1000000,
      isVerified: true,
      auditStatus: 'AUDITED'
    },
    toToken: {
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      marketCap: 25000000000,
      volume24h: 2000000000,
      priceChange24h: 0.1,
      liquidity: 500000000,
      holders: 500000,
      isVerified: true,
      auditStatus: 'AUDITED'
    },
    amount: "1000",
    slippage: 1
  },
  {
    name: "Risky Unknown Token Swap",
    fromToken: {
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      marketCap: 200000000000,
      volume24h: 5000000000,
      priceChange24h: 2.5,
      liquidity: 1000000000,
      holders: 1000000,
      isVerified: true,
      auditStatus: 'AUDITED'
    },
    toToken: {
      address: '0x1234567890123456789012345678901234567890',
      symbol: 'UNKNOWN',
      name: 'Unknown Token',
      decimals: 18,
      marketCap: 100000,
      volume24h: 50000,
      priceChange24h: 45.5,
      liquidity: 50000,
      holders: 50,
      isVerified: false,
      auditStatus: 'UNAUDITED'
    },
    amount: "10000",
    slippage: 5
  },
  {
    name: "Large Swap with High Slippage",
    fromToken: {
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      marketCap: 200000000000,
      volume24h: 5000000000,
      priceChange24h: 2.5,
      liquidity: 1000000000,
      holders: 1000000,
      isVerified: true,
      auditStatus: 'AUDITED'
    },
    toToken: {
      address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
      symbol: 'UNI',
      name: 'Uniswap',
      decimals: 18,
      marketCap: 5000000000,
      volume24h: 100000000,
      priceChange24h: 15.5,
      liquidity: 20000000,
      holders: 100000,
      isVerified: true,
      auditStatus: 'AUDITED'
    },
    amount: "50000",
    slippage: 10
  }
];

async function runTests() {
  console.log('🧪 Risk Assessment Testing\n');
  
  const riskAssessor = new DeFiRiskAssessor('https://mainnet.infura.io/v3/your-project-id');
  
  for (let i = 0; i < testScenarios.length; i++) {
    const scenario = testScenarios[i];
    console.log(`\n${i + 1}. Testing: ${scenario.name}`);
    console.log('='.repeat(50));
    
    try {
      const swapParams = {
        fromToken: scenario.fromToken.address,
        toToken: scenario.toToken.address,
        amount: scenario.amount,
        slippageTolerance: scenario.slippage,
        protocol: 'Uniswap V3'
      };

      const assessment = await riskAssessor.assessSwapRisk(swapParams, scenario.fromToken, scenario.toToken);
      
      // Display results
      console.log(`Risk Level: ${assessment.overallRisk}`);
      console.log(`Risk Score: ${assessment.riskScore}/100`);
      console.log(`Risk Factors Found: ${assessment.riskFactors.length}`);
      
      if (assessment.riskFactors.length > 0) {
        console.log('\nRisk Factors:');
        assessment.riskFactors.forEach((factor, index) => {
          console.log(`  ${index + 1}. ${factor.severity} ${factor.type.replace('_', ' ')}`);
          console.log(`     Description: ${factor.description}`);
          console.log(`     Impact: ${factor.impact}`);
        });
      }
      
      if (assessment.recommendations.length > 0) {
        console.log('\nRecommendations:');
        assessment.recommendations.forEach((rec, index) => {
          console.log(`  ${index + 1}. ${rec}`);
        });
      }
      
      // Color-coded summary
      const riskColors = {
        'LOW': '🟢',
        'MEDIUM': '🟡', 
        'HIGH': '🟠',
        'CRITICAL': '🔴'
      };
      
      console.log(`\n${riskColors[assessment.overallRisk]} Summary: ${assessment.overallRisk} Risk`);
      
    } catch (error) {
      console.error(`❌ Test failed: ${error.message}`);
    }
    
    console.log('\n' + '-'.repeat(50));
  }
  
  console.log('\n✅ Testing completed!');
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests, testScenarios }; 