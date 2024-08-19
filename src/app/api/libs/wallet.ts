import { Currency } from "@uniswap/sdk-core";
import { ethers, Provider, BigNumberish } from "ethers";
import { ERC20_ABI } from "./constants";
import { toReadableAmount } from "./conversion";
import { get } from "http";
import { getProvider } from "./provider";
import { Environment } from "./config";


export async function getCurrencyBalance(
    provider: Provider,
    address: string,
    currency: Currency
): Promise<string> {
    if(currency.isNative) {
        const balance = await provider.getBalance(address);
        return ethers.formatEther(balance);
    }
    const ERC20Contract = new ethers.Contract(
        currency.address, 
        ERC20_ABI
        , provider
    );

    const balance = await ERC20Contract.balanceOf(address);
    const decimals = await ERC20Contract.decimals();

    return toReadableAmount(balance, decimals);
}


export async function wrapETH(eth: number, env: Environment, provider: any): Promise<void> {
    if(provider === undefined) {
        provider = await getProvider(env);
    }
    if(env === Environment.WALLET_EXTENSION){
        
    }
}