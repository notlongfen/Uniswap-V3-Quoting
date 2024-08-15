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
//     const provider = new ethers.providers.JsonRpcProvider('https://mainnet.infura.io/v3/b16af739c052476296e746e51a577b8c');
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
import { CurrentConfig } from './config';

dotenv.config();

export async function getProvider(): Promise<ethers.JsonRpcProvider> {
    const provider = new ethers.JsonRpcProvider(CurrentConfig.rpc.mainnet);
    console.log(`Provider: ${provider}`);
    console.log(`CurrentConfig.rpc.mainnet: ${CurrentConfig.rpc.mainnet}`);
    
    const network = await checkProvider(provider);
    console.log(network);
    
    return provider;
}

async function checkProvider(provider: ethers.JsonRpcProvider) {
    try {
        const network = await provider.getNetwork();
        console.log(`Network: ${network}`);
        return network;
    } catch (e) {
        console.log(e);
        throw new Error('Error fetching network');
    }
}

