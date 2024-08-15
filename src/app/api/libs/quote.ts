import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import Quoter from "@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json";
import { computePoolAddress } from "@uniswap/v3-sdk";
import { ethers } from "ethers";
import {
    POOL_FACTORY_CONTRACT_ADDRESS,
    QUOTER_CONTRACT_ADDRESS,
} from "./constants";

import { CurrentConfig } from "./config";
import { getProvider } from "../libs/provider";
import { Contract } from "ethers";
import { fromReadableAmount } from "../libs/conversion";

export async function getPoolConstants(): Promise<{
    token0: string;
    token1: string;
    fee: number;
}> {
    try {
        const currentPoolAddress = computePoolAddress({
            factoryAddress: POOL_FACTORY_CONTRACT_ADDRESS,
            tokenA: CurrentConfig.tokens.in,
            tokenB: CurrentConfig.tokens.out,
            fee: CurrentConfig.tokens.poolFee,
        });

        const provider = await getProvider();
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

        const [token0, token1, fee] = await Promise.all([
            poolContract.token0(),
            poolContract.token1(),
            poolContract.fee(),
        ]);
        return {
            token0,
            token1,
            fee,
        };
    } catch (e) {
        console.log(e);
        throw new Error('Error fetching pool constants');
    }
}

export async function quote(amountIn: number): Promise<string> {
    try {
        const providerPromise = getProvider();
        const provider = await providerPromise;
        console.log(provider);
        const network = await provider.getNetwork();
        console.log(network);
        const quoterContract: Contract = new ethers.Contract(
            QUOTER_CONTRACT_ADDRESS,
            Quoter.abi,
            provider
        );
        console.log(CurrentConfig.tokens.in.decimals);
        const poolConstants = await getPoolConstants();
        console.log(poolConstants);
        const quoteAmountOut = await quoterContract.quoteExactInputSingle.staticCall(
            poolConstants.token0,
            poolConstants.token1,
            poolConstants.fee,
            fromReadableAmount(amountIn, CurrentConfig.tokens.in.decimals).toString(),
            0
        );
        return quoteAmountOut;
    } catch (e) {
        console.log(e)
    }
    return "a";
}
