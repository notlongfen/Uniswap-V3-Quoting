import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from 'axios';
import { ethers } from 'ethers';


const SingleSwap = () => {
    const [amountIn, setAmountIn] = useState<number>(0);
    const [amountOut, setAmountOut] = useState<number>(0);
    const [txState, setTxState] = useState<string>('New');
    const [showError, setShowError] = useState<boolean>(false);
    const [account, setAccount] = useState<string>('');
    const [accountAddress, setAccountAddress] = useState<string>('');
    const router = useRouter();

    const handleOnClick = async () => {
        try {
            const response = await axios.post('/api/quote', { amountIn: amountIn });
            setAmountOut(response.data.amountOut);
            console.log(response.data);
            router.push('/');
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
            } catch (error) {
                console.error('User rejected the connection or another error occurred:', error);
            }
        } else {
            console.error('MetaMask is not installed. Please install it to use this application.');
        }
    };


    return (
        <div className="flex">
            <h1>Single Swap</h1>
            <button
                className="border-amber-600 text-black bg-white"
             onClick={connectToMetaMask}>
            {account? `Connected: ${account}` : 'Connect to Metamask'}</button>

            {showError && (
                <h2>Please set your mainnet RPC URL in config.ts</h2>
            )}

                <h3>{`Transaction State: ${txState}`} </h3> 
                {`Swap input amount: `}
                <input
                    type="number"
                    value={amountIn}
                    onChange={(e) => { setAmountIn(parseFloat(e.target.value)) }}
                    required
                    placeholder="Enter amount"
                    className="text-black"
                ></input>

            <h3>{`Swap output amount: ${amountOut}`}</h3>

            <button onClick={handleOnClick}>Swap</button> <br/>

        </div>
    );
}

export default SingleSwap;