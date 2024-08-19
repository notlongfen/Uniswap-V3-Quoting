import { Token, TradeType } from '@uniswap/sdk-core';
import { Trade } from '@uniswap/v3-sdk';
import { ethers } from 'ethers';

const READABLE_FORM_LEN = 4;
export function fromReadableAmount(amount: number, decimals: number): BigInt {
    const amountBN = ethers.parseUnits(amount.toString(), decimals);
    return amountBN;
}

export function toReadableAmount(amount: number, decimals: number): string {
    const amountStr = ethers.formatUnits(amount, decimals);
    return amountStr.slice(0, amountStr.indexOf('.') + READABLE_FORM_LEN);
}

export function displayTrade(trade: Trade<Token, Token, TradeType>): string {
    return `${trade.inputAmount.toExact()} ${trade.inputAmount.currency.symbol
        } for ${trade.outputAmount.toExact()} ${trade.outputAmount.currency.symbol}`
}