import { Pool, Route, SwapOptions, SwapQuoter, SwapRouter, Trade } from "@uniswap/v3-sdk";
import { CurrentConfig, Environment } from "./config";
import { getPoolConstants } from "./pool";
import { Currency, CurrencyAmount, Percent, Token, TradeType } from "@uniswap/sdk-core";
import { ERC20_ABI, MAX_FEE_PER_GAS, MAX_PRIORITY_FEE_PER_GAS, QUOTER_CONTRACT_ADDRESS, SWAP_ROUTER_ADDRESS, TOKEN_AMOUNT_TO_APPROVE_FOR_TRANSFER } from "./constants";
import { ethers } from "ethers";
import { fromReadableAmount } from "./conversion";
import JSBI from "jsbi";
import { getWalletAddress, sendTransaction, TransactionState } from "./provider";


export type TokenTrade = Trade<Token, Token, TradeType>

export async function createTrade(amountIn: number, account: any, env: Environment): Promise<any> {
    const poolInfo = await getPoolConstants(env);
    const pool = new Pool(
        CurrentConfig.tokens.in,
        CurrentConfig.tokens.out,
        CurrentConfig.tokens.poolFee,
        poolInfo.sqrtPriceX96.toString(),
        poolInfo.liquidity.toString(),
        poolInfo.tick
    )

    const swapRoute = new Route(
        [pool],
        CurrentConfig.tokens.in,
        CurrentConfig.tokens.out
    )
    const amountInCurrency = CurrencyAmount.fromRawAmount(CurrentConfig.tokens.in, amountIn).currency;
    const amountOut = await getAmountOut(swapRoute, amountInCurrency, account);

    const uncheckedTrade = ({
        route: swapRoute,
        inputAmount: CurrencyAmount.fromRawAmount(
            amountInCurrency,
            fromReadableAmount(
                amountIn,
                CurrentConfig.tokens.in.decimals
            ).toString(),
        ),
        outputAmount: CurrencyAmount.fromRawAmount(
            CurrentConfig.tokens.out,
            JSBI.BigInt(amountOut.toString())
        ),
        tradeType: TradeType.EXACT_INPUT,

    });

    return uncheckedTrade;
}

export async function executeTrade(trade: any, env: Environment, account: any): Promise<any> {
    const walletAddress = getWalletAddress(env, account);
    const provider = account.provider;

    if (!walletAddress || !provider) {
        throw new Error('Cannot execute a trade without a connected wallet')
    }

    // Give approval to the router to spend the token
    const tokenApproval = await getTokenTransferApproval(CurrentConfig.tokens.in, account, env)

    // Fail if transfer approvals do not go through
    if (tokenApproval !== TransactionState.Sent) {
        return TransactionState.Failed
    }

    const options: SwapOptions = {
        slippageTolerance: new Percent(50, 10_000), // 50 bips, or 0.50%
        deadline: Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes from the current Unix time
        recipient: walletAddress.toString(),
    }

    const methodParameters = SwapRouter.swapCallParameters([trade], options)

    const tx = {
        data: methodParameters.calldata,
        to: SWAP_ROUTER_ADDRESS,
        value: methodParameters.value,
        from: await walletAddress,
        maxFeePerGas: MAX_FEE_PER_GAS,
        maxPriorityFeePerGas: MAX_PRIORITY_FEE_PER_GAS,
    }

    const res = await sendTransaction(tx, env, provider)

    return res
}



export async function getAmountOut(route: Route<Currency, Currency>, amountIn: Currency, provider: any) {
    const { calldata } = await SwapQuoter.quoteCallParameters(route,
        CurrencyAmount.fromRawAmount(
            amountIn,
            CurrentConfig.tokens.in.decimals
        ),
        TradeType.EXACT_INPUT,
        {
            useQuoterV2: true,
        }
    )

    const quoteCallReturnData = await provider.call({
        to: QUOTER_CONTRACT_ADDRESS,
        data: calldata,
    })

    return ethers.AbiCoder.defaultAbiCoder().decode(['uint256'], quoteCallReturnData);

}

export async function getTokenTransferApproval(
    token: Token,
    account: any,
    env: Environment
  ): Promise<TransactionState> {
    const provider = account
    const address = getWalletAddress(env, account)
    if (!provider || !address) {
      console.log('No Provider Found')
      return TransactionState.Failed
    }
  
    try {
      const tokenContract = new ethers.Contract(
        token.address,
        ERC20_ABI,
        provider
      )
  
      const transaction = await tokenContract.approve(
        SWAP_ROUTER_ADDRESS,
        fromReadableAmount(
          TOKEN_AMOUNT_TO_APPROVE_FOR_TRANSFER,
          token.decimals
        ).toString()
      )
  
      return sendTransaction({
        ...transaction,
        from: address,
      }, env, account)
    } catch (e) {
      console.error(e)
      return TransactionState.Failed
    }
  }
  