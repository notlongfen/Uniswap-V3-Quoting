import { NextRequest } from "next/server";
import { getProvider } from "../libs/provider";
import { CurrentConfig, Environment } from "../libs/config";
import { createTrade, executeTrade } from "../libs/trade";
import { getCurrencyBalance, wrapETH } from "../libs/wallet";



export async function POST(request: NextRequest) {
    const { amountIn, account, env } = await request.json();
    const amountInNumber = Number(amountIn);

    if (isNaN(amountInNumber)) {
        return {
            status: 400,
            body: { message: "Invalid amount" },
        };
    }
    let accountAvailable;
    if (env === Environment.LOCAL) {
        accountAvailable = getProvider(env);
    }else{
        accountAvailable = account;
    }

    const tradeCreation = createTrade(amountInNumber, accountAvailable, env);

    const wrapEths = wrapETH(amountInNumber, accountAvailable, env);
    const balanceIn = getCurrencyBalance(accountAvailable, accountAvailable.address, CurrentConfig.tokens.in);
    const balanceOut = getCurrencyBalance(accountAvailable, accountAvailable.address, CurrentConfig.tokens.out);


    const tradeExecution = executeTrade(tradeCreation, env, account);
    

    return {
        status: 200,
        body: { amountOut: tradeExecution },
    };


}