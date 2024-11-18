/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useState } from "react";
import { useAtom } from "jotai";
import PoolInformation from "./PoolInformation";
import { themeDarkAtom } from "@/app/utils/store";
import numberToString from "@/app/utils/numberToString";
import { LpTokenAsset, Token } from "@/app/types";
import { urlTo } from "@/app/utils/helper";
import { useAppContext } from "@/app/state/hook";
import { LiquidityPageType } from "@/app/types/enum";
import { useRouter } from "next/navigation";
import Image from "next/image";
import TokenIcon from "../../token-icon";
interface PoolSelectionProps {
  tokenPair: string;
  nativeToken: Token;
  assetToken: Token;
  lpTokenAsset: LpTokenAsset | null;
  assetTokenId: string;
  lpTokenId: string | null;
}
const PoolSelection: React.FC<PoolSelectionProps> = ({
  tokenPair,
  nativeToken,
  assetToken,
  lpTokenAsset,
  assetTokenId,
  lpTokenId,
}) => {
  const [isClicked, setIsClicked] = useState(false);
  const [themeDark] = useAtom(themeDarkAtom);

  const router = useRouter();
  const { state } = useAppContext();
  const { tokenBalances, selectedAccount } = state;

  const onDepositClick = () => {
    // router.push(urlTo(ADD_LIQUIDITY_TO_EXISTING, { id: assetTokenId }), {
    //   state: { pageType: LiquidityPageType.addLiquidity },
    // });
  };

  const onWithdrawClick = () => {
    // navigate(urlTo(REMOVE_LIQUIDITY_FROM_EXISTING, { id: assetTokenId }), {
    //   state: { pageType: LiquidityPageType.removeLiquidity, lpTokenId: lpTokenId },
    // });
  };

  // let volume: string,
  //   fees: string,
  //   apr: string = "";

  // if (sortPeriod === "24H") {
  //   volume = numberToString(volume24h);
  //   fees = numberToString(fees24h);
  //   apr = numberToString(apr24h);
  // } else if (sortPeriod === "7D") {
  //   volume = numberToString(volume7d);
  //   fees = numberToString(fees7d);
  //   apr = numberToString(apr7d);
  // } else {
  //   volume = numberToString(volume30d);
  //   fees = numberToString(fees30d);
  //   apr = numberToString(apr30d);
  // }

  const checkIfDepositDisabled = () => {
    return !tokenBalances?.assets?.find((token: any) => token.tokenId === assetTokenId);
  };

  const checkIfWithdrawDisabled = () => {
    if (lpTokenAsset) {
      if (parseInt(lpTokenAsset?.balance) > 0 && tokenBalances?.balance) {
        return false;
      }
    }
    return true;
  };

  return (
    <div className="relative flex flex-col first:items-start ">
      {/* Star Setting */}
      <Image
        src={
          "/pools-icon/star-fill.svg"
          // favourite
          //   ? "/pools-icon/star-fill.svg"
          //   : `${
          //       themeDark ? "/pools-icon/star-dark.svg" : "/pools-icon/star.svg"
          //     }`
        }
        alt="Star Icon"
        width={36}
        height={36}
        // onClick={() => {
        //   handleFavourite(id);
        // }}
        className="flex w-9 h-9 cursor-pointer absolute mt-7 ml-9 z-30"
      />
      <div
        className={`flex flex-row justify-between w-full items-center bg-[#120037] dark:bg-white px-5 py-6 relative cursor-pointer ${isClicked ? "rounded-t-xl" : " rounded-xl"
          }`}
        onClick={() => setIsClicked(!isClicked)}
      >
        {/* Token pair images */}
        <div className="w-[7%]"></div>
        <div className="flex">
          <div className="flex flex-row justify-center items-center w-11 h-11 rounded-full bg-gradient-to-r from-[#5100FE] box-shadow-black to-[#32009C] z-30">
            <TokenIcon
              token={nativeToken.symbol}
              width={36}
              height={36}
            />
          </div>
          <div className="flex flex-row justify-center items-center w-11 h-11 rounded-full bg-gradient-to-r from-[#5100FE] to-[#32009C] -ml-[8%] z-20">
            <TokenIcon
              token={assetToken.symbol}
              width={36}
              height={36}
            />
          </div>
        </div>
        <div className="w-[5%]"></div>

        {/* Token pair pool, price and change rate */}
        <div className="w-1/6">
          <p className="font-bold whitespace-nowrap">
            {tokenPair}
          </p>
        </div>
        <div className="w-1/6">
          <p>${"numberToString(liquidity)"}</p>
        </div>
        <div className="w-1/6">
          <p>${"volume"}</p>
        </div>
        <div className="w-1/6">
          <p>${"fees"}</p>
        </div>
        <div className="w-1/6">
          <p>
            {">"}
            {"apr"}%
          </p>
        </div>
        <div className="flex flex-row justify-end items-center w-1/6">
          <Image
            src={`${themeDark
              ? "/swap-icons/ArrowUpDark.svg"
              : "/swap-icons/ArrowUp.svg"
              }`}
            className={`${isClicked ? "" : "rotate-180"}`}
            alt="ArrowDown"
            width={24}
            height={24}
          />
        </div>
      </div>
      {isClicked ? <PoolInformation /> : null}
    </div>
  );
};

export default PoolSelection;
