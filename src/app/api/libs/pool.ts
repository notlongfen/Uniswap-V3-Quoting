import { POOL_FACTORY_CONTRACT_ADDRESS } from "./constants";
import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import { ethers } from "ethers";
import { computePoolAddress } from "@uniswap/v3-sdk";
import { CurrentConfig, Environment } from "./config";
import { getProvider } from "./provider";

interface PoolInfo {
    token0: string
    token1: string
    fee: number
    tickSpacing: number
    sqrtPriceX96: ethers.BigNumberish
    liquidity: ethers.BigNumberish
    tick: number
}

export async function getPoolConstants(environment: Environment): Promise<PoolInfo> {
    try {
        const currentPoolAddress = computePoolAddress({
            factoryAddress: POOL_FACTORY_CONTRACT_ADDRESS,
            tokenA: CurrentConfig.tokens.in,
            tokenB: CurrentConfig.tokens.out,
            fee: CurrentConfig.tokens.poolFee,
        });

        const provider = await getProvider(environment);
        const network = await provider.getNetwork();
        if (network === undefined) {
            console.log(network);
            throw new Error('Error fetching network');
        }

        const poolContract = new ethers.Contract(
            currentPoolAddress,
            IUniswapV3PoolABI.abi,
            provider
        );

        const [token0, token1, fee, tickSpacing, liquidity, slot0] = await Promise.all([
            poolContract.token0(),
            poolContract.token1(),
            poolContract.fee(),
            poolContract.tickSpacing(),
            poolContract.liquidity(),
            poolContract.slot0(),
        ]);
        return {
            token0,
            token1,
            fee,
            tickSpacing,
            liquidity,
            sqrtPriceX96: slot0[0],
            tick: slot0[1],
        };
    } catch (e) {
        console.log(e);
        throw new Error('Error fetching pool constants');
    }
}
