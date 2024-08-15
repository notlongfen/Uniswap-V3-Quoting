import QuotePage from "@/app/page";
import { use, useCallback, useEffect, useState } from "react";
import { quote } from '../api/libs/quote';
import { CurrentConfig } from "../api/libs/config";
import axios from 'axios';
import { useRouter } from "next/navigation";
import * as dotenv from 'dotenv'
dotenv.config()

const Quoting = () => {
    const  [outputAmount, setOutputAmount] = useState<string>();
    const router = useRouter();
    const [inputAmount, setInputAmount] = useState<number>(0);
    const [showError, setshowError] = useState<boolean>(false);
    // const onQuote = useCallback(async () => {
    //     const inputElement = document.getElementById("USDC") as HTMLInputElement;
    //     setOutputAmount(await quote(parseFloat(inputElement?.value || "0")));
    // }, [])

    useEffect(() => {
        // const INFURA_RPC = process.env.NEXT_PUBLIC_INFURA_RPC_URL;
        if( CurrentConfig.rpc.mainnet === ''){
            console.log(process.env.NEXT_PUBLIC_INFURA_RPC_URL);
            setshowError(true);
        }
        console.log(CurrentConfig.rpc.mainnet);
        console.log(process.env.INFURA_RPC_URL);
    }, [])

    const handleOnClick = async () => {
        // const inputElement = document.getElementById("USDC") as HTMLInputElement;
        try{
        const response = await axios.post('/api/quote', {amountIn: inputAmount})
        setOutputAmount(response.data.amountOut)
        console.log(response.data)
        router.push('/')
        }catch(e){
            console.log(e)
        }
        // if(!showError){
        //     return null;
        // }
    }

    return (
    <div>
        <h1 className="text-center"> Get your Quote </h1>
        {showError && (
        <h2 className="text-red-600">Please set your mainnet RPC URL in config.ts</h2>
      )}
        <h3>
            {`Quote input amount: `}
            <input className="text-black"
            type="number"
             id="USDC"
             value={inputAmount}
            onChange={(e) => {setInputAmount(parseFloat(e.target.value))}}
            required placeholder="Enter amount"></input> {`${CurrentConfig.tokens.in.symbol}`}
        </h3>

        <h3>{`Quote output amount: ${outputAmount} ${CurrentConfig.tokens.out.symbol}`}</h3>

        <button className="border-amber-600" onClick={handleOnClick}>Quote</button>
    </div>
    );
};

export default Quoting;