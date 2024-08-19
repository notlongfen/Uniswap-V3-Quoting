import Quoter from "@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json";
import { ethers } from "ethers";
import {
    POOL_FACTORY_CONTRACT_ADDRESS,
    QUOTER_CONTRACT_ADDRESS,
} from "./constants";

import { CurrentConfig, Environment } from "./config";
import { getProvider } from "../libs/provider";
import { Contract } from "ethers";
import { fromReadableAmount } from "../libs/conversion";
import { getPoolConstants } from "./pool";


export async function quote(amountIn: number, environment: Environment): Promise<string> {
    try {
        const providerPromise = getProvider(environment);
        const provider = await providerPromise;
        // console.log(provider);
        const network = await provider.getNetwork();
        // console.log(network);
        const quoterContract: Contract = new ethers.Contract(
            QUOTER_CONTRACT_ADDRESS,
            Quoter.abi,
            provider
        );
        // console.log(CurrentConfig.tokens.in.decimals);
        const poolConstants = await getPoolConstants(environment);  
        // console.log(poolConstants);
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
