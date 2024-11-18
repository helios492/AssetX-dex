import { useState } from "react";
import Tooltip from "@/app/components/tooltip";
import Link from "next/link";
import Image from "next/image";

const PoolInformation = () => {
  const [isClickedAddRequidityButton, SetIsClickedAddRequidityButton] =
    useState(false);
  const [isClickedRemoveLiquidityButton, SetIsClickedRemoveLiquidityButton] =
    useState(false);
  const [isClickedSwapButton, SetIsClickedSwapButton] = useState(false);
  return (
    <div className="flex flex-row justify-between items-center w-full bg-[#18004A] dark:bg-[#E9E9E9] dark:border dark:border-white rounded-b-xl px-9 py-4">
      {/* Your Liquidity Amount */}
      <div className="w-1/7 py-4">
        <p>Your Liquidiy</p>
        <p className="text-white dark:text-[#5100FE] font-bold">$0</p>
        <p>0 LP</p>
      </div>

      <div className="w-1/7" />
      <div className="w-1/7 py-4">
        <p>Assets Pooled</p>
        <p className="font-bold text-white dark:text-[#5100FE]">0 DOT</p>
        <p className="font-bold text-white dark:text-[#5100FE]">0 ASX</p>
      </div>
      <div className="w-1/7" />
      <div className="w-1/7 py-4 ">
        <p>Your share</p>
        <p className="text-white dark:text-[#5100FE] font-bold">$0</p>
        <p className="text-transparent">Amount </p>
      </div>
      <div className="w-1/7 flex flex-row justify-end items-center self-center">
        <div className="px-2">
          <Link href={"/dashboard/liquidity"}>
            <div
              className={`rounded-md border border-[#B4D2FF] px-7 py-2 whitespace-nowrap font-bold cursor-pointer dark:text-white ${
                isClickedAddRequidityButton
                  ? "text-white bg-gradient-to-r from-[#E6007A] to-[#9746FF]"
                  : "bg-gradient-to-b from-[#5100FE] to-[#32009C]  hover:from-[#1C0057] hover:to-[#1A0050] "
              }`}
              onMouseDown={() => SetIsClickedAddRequidityButton(true)}
              onMouseUp={() => SetIsClickedAddRequidityButton(false)}
            >
              Add Liquidity
            </div>
          </Link>
        </div>
        <Tooltip content="Farm" direction="top">
          <Image
            src="/sidebar-icons/Farming.png"
            width={40}
            height={40}
            className="w-10 h-10 cursor-pointer"
            alt="farming"
          />
        </Tooltip>
        <Tooltip content="Remove Liquidity" direction="top">
          <Image
            src={`${
              isClickedRemoveLiquidityButton
                ? "/sidebar-icons/SubtractLight.png"
                : "/sidebar-icons/SubtractDark.png"
            }`}
            width={40}
            height={40}
            className="w-10 h-10 cursor-pointer"
            alt="subtract"
            onMouseEnter={() => SetIsClickedRemoveLiquidityButton(true)}
            onMouseLeave={() => SetIsClickedRemoveLiquidityButton(false)}
          />
        </Tooltip>
        <Tooltip content="Swap" direction="top">
          <Image
            src={`${
              isClickedSwapButton
                ? "/sidebar-icons/SwapLight.png"
                : "/sidebar-icons/SwapDark.png"
            }`}
            width={40}
            height={40}
            className="w-10 h-10 cursor-pointer"
            alt="swapdark"
            onMouseEnter={() => SetIsClickedSwapButton(true)}
            onMouseLeave={() => SetIsClickedSwapButton(false)}
          />
        </Tooltip>
      </div>
    </div>
  );
};

export default PoolInformation;
