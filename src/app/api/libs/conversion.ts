import {ethers } from 'ethers';

const READABLE_FORM_LEN = 4;
export function fromReadableAmount(amount: number, decimals: number): BigInt {
    const amountBN = ethers.parseUnits(amount.toString(), decimals);
    return amountBN;
}

export function toReadableAmount(amount: number, decimals: number): string {
    const amountStr = ethers.formatUnits(amount, decimals);
    return amountStr.slice(0, amountStr.indexOf('.') + READABLE_FORM_LEN);
}