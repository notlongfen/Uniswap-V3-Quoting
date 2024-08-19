// import { providers } from 'ethers';
// import { ethers } from 'ethers';
// import dotenv from 'dotenv';
// import { CurrentConfig } from './config';
// dotenv.config();
// console.log(process.env.NEXT_PUBLIC_INFURA_RPC_URL); // Thêm dòng này để kiểm tra

// export async function getProvider(): Promise<providers.Provider> {
//     const provider: providers.Provider = new ethers.providers.JsonRpcProvider(CurrentConfig.rpc.mainnet);
//     console.log(`Provider: ${provider}`);
//     console.log(`CurrentConfig.rpc.mainnet: ${CurrentConfig.rpc.mainnet}`);
//     const network = await checkProvider();
//     console.log(network);
//     // const network: any = provider.getNetwork()
//     //     .then(network => console.log(`Connect successful to ${network}`))
//     //     .catch(error => console.error("Error"+ error));
//     // const nw = checkProvider();
//     // console.log(`NW: ${nw}`);
//     // console.log(`Network: ${network}`);
//     return provider;
// }

// async function checkProvider(){
//     try{
//     // const provider: providers.Provider = new ethers.providers.JsonRpcProvider(CurrentConfig.rpc.mainnet);
//     const provider = new ethers.providers.JsonRpcProvider('https://mainnet.infura.io/v3/a2c16a1f739c052476296e746e51a577b8c');
//     console.log(`Provider: ${provider}`);
//     console.log(`CurrentConfig.rpc.mainnet: ${CurrentConfig.rpc.mainnet}`);
//     const network = await provider.getNetwork();
//         // .then(network => console.log(`Connect successful to ${network}`))
//         // .catch(error => console.error("Error"+ error));
//     console.log(`Network: ${await network}`);
//     return network;
//     }catch(e){
//         console.log(e)
//         throw new Error('Error fetching network')
//     }
// }

import { ethers } from 'ethers';
import dotenv from 'dotenv';
import { CurrentConfig, Environment } from './config';

dotenv.config();

export enum TransactionState {
    Failed = 'Failed',
    New = 'New',
    Rejected = 'Rejected',
    Sending = 'Sending',
    Sent = 'Sent',
}

export async function getProvider(environment: Environment): Promise<ethers.JsonRpcProvider> { //getProvider == createWallet
    let provider = new ethers.JsonRpcProvider(CurrentConfig.rpc.mainnet);
    if (environment === Environment.LOCAL) {
        provider = new ethers.JsonRpcProvider(CurrentConfig.rpc.local);
    } else {
        const network = await checkProvider(provider);
        if (network === undefined) {
            throw new Error('Error fetching network');
        }

    }
    console.log(`Provider: ${provider}`);
    // console.log(`Provider: ${provider}`);
    // console.log(`CurrentConfig.rpc.mainnet: ${CurrentConfig.rpc.mainnet}`);

    // console.log(network);
    const wallet = new ethers.Wallet(CurrentConfig.wallet.privateKey, provider);
    return wallet.provider as ethers.JsonRpcProvider;
}

async function checkProvider(provider: ethers.JsonRpcProvider) {
    try {
        const network = await provider.getNetwork();
        // console.log(`Network: ${network}`);
        return network;
    } catch (e) {
        console.log(e);
        throw new Error('Error fetching network');
    }
}

export async function getWalletAddress(env: Environment, accountWallet: ethers.Wallet){
    return env == Environment.WALLET_EXTENSION ?  accountWallet: accountWallet.address;
}

export async function sendTransaction(transaction: ethers.TransactionRequest, env: Environment, provider: any)
: Promise<TransactionState> {
    if (env === Environment.WALLET_EXTENSION) {
        return sendTransactionMetamask(transaction, provider);
    } else {
        if (transaction.value) {
            transaction.value = BigInt(transaction.value);
        }
        return sendTransactionViaWallet(transaction, provider, env);
    }
}

async function sendTransactionViaWallet(transaction: ethers.TransactionRequest, wallet: ethers.Wallet, env: Environment)
: Promise<TransactionState> {
    if (transaction.value) {
        transaction.value = BigInt(transaction.value);
    }

    const txResponse = await wallet.sendTransaction(transaction);
    let txReceipt = null; //await txResponse.wait();
    const provider = await getProvider(env);
    if (!provider) {
        return TransactionState.Failed;
    }
    while (txReceipt === null) {
        try {
            txReceipt = provider.getTransactionReceipt(txResponse.hash);

            if (txReceipt === null) {
                continue;
            }
        } catch (error) {
            console.log(error);
            break;
        }
    }

    if (txReceipt) {
        return TransactionState.Sent;
    } else {
        return TransactionState.Failed;
    }

}


async function sendTransactionMetamask(transaction: ethers.TransactionRequest, provider: ethers.BrowserProvider)
: Promise<TransactionState> {
    try {
        const receipt = await provider?.send(
            'eth_sendTransaction',
            [transaction]
        );
        if (receipt) {
            return TransactionState.Sent;
        } else {
            return TransactionState.Failed;
        }

    } catch (error) {
        console.log(error);
        return TransactionState.Rejected;
    }



}

