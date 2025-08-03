import { Coinbase, Wallet, Account } from "@coinbase/coinbase-sdk";
import { ethers } from 'ethers';
import { Pool } from '@aave/contract-helpers';
import { DeFiRiskAssessor, RiskAssessment, SwapParameters, TokenInfo } from './riskAssessment';

interface LiquidityPool {
    name: string;
    address: string;
    apy: number;
    risk: number; // 1-10, where 10 is highest risk
}

interface InvestmentStrategy {
    riskTolerance: number; // 1-10, where 10 is highest risk tolerance
    investmentAmount: number;
    preferredDuration: number; // in days
}

interface SwapRequest {
    fromToken: TokenInfo;
    toToken: TokenInfo;
    amount: string;
    slippageTolerance: number;
    gasPrice?: string;
    protocol?: string;
}

class AICryptoAgent {
    private coinbase: Coinbase;
    private wallet: Wallet;
    private provider: ethers.providers.JsonRpcProvider;
    private signer: ethers.Wallet;
    private riskAssessor: DeFiRiskAssessor;

    constructor(
        private clientId: string,
        private clientSecret: string,
        private infuraProjectId: string,
        private privateKey: string,
        private rpcUrl: string
    ) {
        this.riskAssessor = new DeFiRiskAssessor(rpcUrl);
    }

    async initialize() {
        this.coinbase = new Coinbase({
            clientId: this.clientId,
            clientSecret: this.clientSecret,
            scopes: ['wallet:accounts:read', 'wallet:transactions:send', 'wallet:buys:create'],
        });

        await this.coinbase.auth.authenticate();
        this.wallet = await this.coinbase.wallet.getWallet();

        this.provider = new ethers.providers.JsonRpcProvider(`https://mainnet.infura.io/v3/${this.infuraProjectId}`);
        this.signer = new ethers.Wallet(this.privateKey, this.provider);
    }

    private async getAvailableLiquidityPools(): Promise<LiquidityPool[]> {
        return [
            { name: "Aave USDC", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", apy: 3.5, risk: 3 },
            { name: "Compound ETH", address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", apy: 4.2, risk: 5 },
            { name: "Uniswap ETH/USDT", address: "0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852", apy: 15.8, risk: 8 },
            { name: "Curve 3pool", address: "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7", apy: 6.7, risk: 4 },
        ];
    }

    private selectBestPool(pools: LiquidityPool[], strategy: InvestmentStrategy): LiquidityPool {
        return pools.reduce((best, current) => {
            const riskScore = Math.abs(strategy.riskTolerance - current.risk);
            const apyScore = current.apy;
            const currentScore = apyScore - riskScore;
            const bestScore = best.apy - Math.abs(strategy.riskTolerance - best.risk);
            return currentScore > bestScore ? current : best;
        });
    }

    async assessSwapRisk(swapRequest: SwapRequest): Promise<RiskAssessment> {
        const swapParams: SwapParameters = {
            fromToken: swapRequest.fromToken.address,
            toToken: swapRequest.toToken.address,
            amount: swapRequest.amount,
            slippageTolerance: swapRequest.slippageTolerance,
            gasPrice: swapRequest.gasPrice,
            protocol: swapRequest.protocol
        };

        return await this.riskAssessor.assessSwapRisk(swapParams, swapRequest.fromToken, swapRequest.toToken);
    }

    async executeSwapWithRiskAssessment(swapRequest: SwapRequest): Promise<{ success: boolean; riskAssessment?: RiskAssessment; error?: string }> {
        try {
            console.log(`AI Agent: Assessing risk for swap ${swapRequest.fromToken.symbol} → ${swapRequest.toToken.symbol}`);

            // Perform risk assessment
            const riskAssessment = await this.assessSwapRisk(swapRequest);

            // Log risk assessment
            console.log(`Risk Assessment: ${riskAssessment.overallRisk} (${riskAssessment.riskScore}/100)`);
            riskAssessment.riskFactors.forEach(factor => {
                console.log(`  ${factor.severity}: ${factor.description}`);
            });

            // If critical risk, abort the transaction
            if (riskAssessment.overallRisk === 'CRITICAL') {
                console.log('AI Agent: CRITICAL RISK detected - aborting transaction');
                return {
                    success: false,
                    riskAssessment,
                    error: 'Critical risk level detected - transaction aborted for safety'
                };
            }

            // If high risk, log warning but proceed
            if (riskAssessment.overallRisk === 'HIGH') {
                console.log('AI Agent: HIGH RISK detected - proceeding with caution');
            }

            // Execute the swap
            console.log(`AI Agent: Executing swap ${swapRequest.fromToken.symbol} → ${swapRequest.toToken.symbol}`);
            
            // Simulate swap execution (replace with actual swap logic)
            await this.simulateSwap(swapRequest);

            console.log(`AI Agent: Swap completed successfully`);
            return { success: true, riskAssessment };

        } catch (error) {
            console.error('AI Agent: Error executing swap:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    private async simulateSwap(swapRequest: SwapRequest): Promise<void> {
        // Simulate swap execution delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // In a real implementation, this would:
        // 1. Get quote from DEX
        // 2. Build transaction
        // 3. Sign and send transaction
        // 4. Wait for confirmation
        console.log(`Simulated swap: ${swapRequest.amount} ${swapRequest.fromToken.symbol} → ${swapRequest.toToken.symbol}`);
    }

    async investInLiquidityPool(strategy: InvestmentStrategy): Promise<void> {
        console.log(`AI Agent: Analyzing investment strategy...`);

        const availablePools = await this.getAvailableLiquidityPools();
        const selectedPool = this.selectBestPool(availablePools, strategy);

        console.log(`AI Agent: Selected ${selectedPool.name} for investment.`);

        // Create mock token info for risk assessment
        const mockFromToken: TokenInfo = {
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
        };

        const mockToToken: TokenInfo = {
            address: selectedPool.address,
            symbol: selectedPool.name.split(' ')[0],
            name: selectedPool.name,
            decimals: 18,
            marketCap: 100000000,
            volume24h: 1000000,
            priceChange24h: 1.2,
            liquidity: 50000000,
            holders: 10000,
            isVerified: true,
            auditStatus: 'AUDITED'
        };

        const swapRequest: SwapRequest = {
            fromToken: mockFromToken,
            toToken: mockToToken,
            amount: strategy.investmentAmount.toString(),
            slippageTolerance: 2.5,
            protocol: 'Uniswap V3'
        };

        // Assess risk before investment
        const result = await this.executeSwapWithRiskAssessment(swapRequest);
        
        if (!result.success) {
            console.log(`AI Agent: Investment aborted due to risk assessment: ${result.error}`);
            return;
        }

        // Proceed with investment if risk is acceptable
        console.log(`AI Agent: Proceeding with investment in ${selectedPool.name}`);

        // Buy the required crypto using Coinbase
        const primaryAccount = await this.wallet.getPrimaryAccount();
        const buyOrder = await primaryAccount.buy({
            amount: strategy.investmentAmount.toString(),
            currency: 'USD',
            paymentMethod: 'bank',
        });

        console.log(`AI Agent: Bought ${strategy.investmentAmount} USD worth of crypto on Coinbase.`);

        // Transfer to Ethereum wallet
        const ethAccount = await this.wallet.getAccount('ETH');
        const transferTransaction = await ethAccount.createTransaction({
            to: await this.signer.getAddress(),
            amount: strategy.investmentAmount.toString(),
            currency: 'ETH',
        });
        await transferTransaction.send();

        console.log(`AI Agent: Transferred crypto to Ethereum wallet.`);

        // Interact with the selected liquidity pool
        const poolContract = new ethers.Contract(selectedPool.address, ['function deposit(uint256) external'], this.signer);
        const amountWei = ethers.utils.parseEther(strategy.investmentAmount.toString());
        await poolContract.deposit(amountWei);

        console.log(`AI Agent: Deposited ${strategy.investmentAmount} into ${selectedPool.name} liquidity pool.`);

        console.log(`AI Agent: Investment complete. Estimated APY: ${selectedPool.apy}%`);
    }
}

export async function runAICryptoAgent(strategy: InvestmentStrategy): Promise<void> {
    const agent = new AICryptoAgent(
        process.env.COINBASE_CLIENT_ID,
        process.env.COINBASE_CLIENT_SECRET,
        process.env.INFURA_PROJECT_ID,
        process.env.ETHEREUM_PRIVATE_KEY,
        process.env.RPC_URL || 'https://mainnet.infura.io/v3/your-project-id'
    );

    await agent.initialize();
    await agent.investInLiquidityPool(strategy);
}

// Export for use in other components
export { AICryptoAgent, SwapRequest };
