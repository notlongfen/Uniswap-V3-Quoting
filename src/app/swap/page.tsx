'use client'
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from 'axios';
import { ethers } from 'ethers';
import { CurrentConfig, Environment } from "../api/libs/config";


const SingleSwap = () => {
    const [amountIn, setAmountIn] = useState<number>(0);
    const [amountOut, setAmountOut] = useState<number>(0);
    const [txState, setTxState] = useState<string>('New');
    const [showError, setShowError] = useState<boolean>(false);
    const [account, setAccount] = useState<string>('');
    const [accountAddress, setAccountAddress] = useState<string>('');
    const [wethAmount, setWEthAmount] = useState<number>(0);
    const [env, setEnv] = useState<Environment>(Environment.LOCAL);
    const [balanceIn, setBalanceIn] = useState<number>(0);
    const [balanceOut, setBalanceOut] = useState<number>(0);

    const router = useRouter();

    const handleOnClick = async () => {
        try {
            const response = await axios.post('/api/swap', { amountIn: amountIn, account: account, env: env });
            setAmountOut(response.data.amountOut);
            setWEthAmount(response.data.wethAmount);
            setTxState(response.data.txState);
            setBalanceIn(response.data.balanceIn);
            setBalanceOut(response.data.balanceOut);
            console.log(response.data);
            router.push('/swap');
        } catch (e) {
            console.log(e);
        }
    }

    const connectToMetaMask = async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                // Request account access
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                setAccount(accounts[0]);

                // Create a provider and signer
                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = provider.getSigner();

                console.log('Connected account:', accounts[0]);
                console.log('Signer:', signer);
                
                setEnv(Environment.WALLET_EXTENSION);
            } catch (error) {
                console.error('User refused the connection or another error occurred:', error);
            }
        } else {
            console.error('MetaMask is not installed. Please install it to use this application.');
        }
    };


    return (
        <div className="">
            <h1>Single Swap</h1>
            <button
                className="border-amber-600 text-black bg-white absolute top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded"
             onClick={connectToMetaMask}>
            {account? `Connected: ${account}` : 'Connect to Metamask'}</button>

            {showError && (
                <h2>Please set your mainnet RPC URL in config.ts</h2>
            )}

                <h3>{`Transaction State: ${txState}`} </h3> <br/>
                {`Swap input amount: `}
                <input
                    type="number"
                    value={amountIn}
                    onChange={(e) => { setAmountIn(parseFloat(e.target.value)) }}
                    required
                    placeholder="Enter amount"
                    className="text-black"
                ></input> <br/>
            <h3> {`Balance In: ${balanceIn}`}</h3> <br/>

            <h3> {`Balance Out: ${balanceOut}`}</h3> <br/>

            <h3> {`Wrapped ETH: ${wethAmount} ${CurrentConfig.tokens.in}`}</h3>

            <h3>{`Swap output amount: ${amountOut} ${CurrentConfig.tokens.out}`}</h3> <br/>

            <button onClick={handleOnClick}>Swap</button> <br/>
            </div>
    );
}

export default SingleSwap;