"use client";
import Link from "next/link";
import CreatePool from "@/app/components/create-pool";

export default function Liquidity() {


  return (
    <div className="flex flex-col justify-start min-w-[360px] items-center h-screen sm:h-[calc(100vh-90px)] pt-[27%] pb-[30%] sm:pb-[10%] sm:pt-16 gap-6 sm:gap-10 text-[var(--text-maincolor)] dark:text-[#120038] overflow-auto">
      <div className="hidden sm:flex flex-row p-1 w-[280px] bg-[#220068] dark:bg-[#E9E9E9] font-bold rounded-full">
        <Link href="/dashboard/swap" className="w-1/2">
          <div className="w-full py-2.5 px-6 text-center text-2xl rounded-full ">
            Swap
          </div>
        </Link>
        <Link href="/dashboard/liquidity" className="w-1/2">
          <button
            className="w-full text-white py-2.5 px-6 text-2xl
            bg-gradient-to-r from-[#E6007A] to-[#9746FF] rounded-full shadow-down-black"
          >
            Liquidity
          </button>
        </Link>
      </div>
      <CreatePool/>
    </div>
  )
}