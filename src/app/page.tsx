'use client'
import Quoting from "@/components/quote/quotePage"
import SingleSwap from "@/components/swap/singleSwap"
import Link from 'next/link'

export default function HomePage() {
    
    return (
        <div className="">
            <Link
            href="/quote"
            className="border-amber-60 bg-blue-500 text-white px-4 py-2 rounded"
            >Quote</Link>
            <Link
            href="/swap"
            className="border-amber-600 bg-blue-500 text-white px-4 py-2 rounded"
            >Swap</Link>

            <Quoting />
            <SingleSwap />
        </div>
    )
}