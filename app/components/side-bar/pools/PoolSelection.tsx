/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import PoolInformation from "./PoolInformation";
import { themeDarkAtom } from "@/app/utils/store";
import { LpTokenAsset, Token } from "@/app/types";
import { formatDecimalsFromToken, formatInputTokenValue, urlTo } from "@/app/utils/helper";
import { useAppContext } from "@/app/state/hook";
import Image from "next/image";
import TokenIcon from "../../token-icon";
import { getAssetTokenFromNativeToken, getNativeTokenFromAssetToken } from "@/app/services/tokenServices";
import axios from "axios";
interface PoolSelectionProps {
  tokenPair: string;
  nativeTokens: string;
  nativeToken: Token;
  assetTokens: string;
  assetToken: Token;
  lpTokenAsset: LpTokenAsset | null;
  assetTokenId: string;
  lpTokenId: string | null;
  sortPeriod: string
}
const PoolSelection = ({
  tokenPair,
  nativeTokens,
  assetTokens,
  lpTokenAsset,
  nativeToken,
  assetToken,
  assetTokenId,
  lpTokenId,
  sortPeriod
}: PoolSelectionProps) => {

  const [isClicked, setIsClicked] = useState(false);
  const [themeDark] = useAtom(themeDarkAtom);
  const { state } = useAppContext();
  const { tokenBalances, poolsTokenMetadata, api } = state;
  const [usdcPrice, setUsdcPrice] = useState<string>("");
  const [nativeTokenPrice, setNativeTokenPrice] = useState<string>("");
  const [assetTokenPrice, setAssetTokenPrice] = useState<string>("");
  const [nativeLiquidity, setNativeLiquidity] = useState<string>("");
  const [assetLiquidity, setAssetLiquidity] = useState<string>("");
  const [volume, setVolume] = useState<string>("0");
  const [fees, setFees] = useState<string>("0");
  const [apr, setApr] = useState<string>("0");

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


  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const response = await axios.get(`/api/crypto?symbol=usdc`);
        setUsdcPrice(response.data.data.USDC.quote.USD.price);
      } catch (err) {
        console.error(err);
      }
    };
    fetchQuotes();
  }, [poolsTokenMetadata, tokenBalances]);

  useEffect(() => {
    if (nativeToken && assetToken && usdcPrice) {
      getLiquidity();
    }

  }, [nativeToken, assetToken, usdcPrice, nativeTokenPrice, assetTokenPrice]);

  const getVolume = async () => {
    const response = await axios.get(`/api/volume/?assetTokenId=${assetTokenId}`);
    let volume = 0;
    response.data.data?.map((item) => {
      volume += item.tokenAAmount * item.tokenAPrice
    });
    setVolume(parseFloat(volume.toString()).toFixed(5));
  };

  const getFees = async () => {
    const response = await axios.get(`/api/fee/?assetTokenId=${assetTokenId}`);
    let fees = 0;
    response.data.data?.map((item) => {
      fees += item.swapFee || 0
    })
    setFees(parseFloat((fees * 1000000).toString()).toFixed(5));
  }
  useEffect(() => {
    getVolume();
    getFees();
  }, [sortPeriod, assetTokenId])

  const getLiquidity = async () => {
    const nativeTokenPrice = await getPriceOfAssetFromNative("1");
    setNativeTokenPrice(nativeTokenPrice || "");
    const assetTokenPrice = await getPriceOfNativeFromAsset(nativeTokenPrice || "0", assetToken);
    setAssetTokenPrice(assetTokenPrice || "");
    const nativeLiquidity = ((Number(nativeTokenPrice || 0) * Number(nativeTokens))).toString();
    const assetLiquidity = ((Number(assetTokenPrice || 0) * Number(assetTokens))).toString();
    setNativeLiquidity(parseFloat(nativeLiquidity).toFixed(3));
    setAssetLiquidity(parseFloat(assetLiquidity).toFixed(3));
  }

  const getPriceOfAssetFromNative = async (value: string) => {
    const usdcToken = poolsTokenMetadata.filter((item: any) => item.assetTokenMetadata.name === "USD Coin");
    if (api) {
      const valueWithDecimals = formatInputTokenValue(
        value,
        nativeToken.decimals
      );

      const assetTokenPrice = await getAssetTokenFromNativeToken(
        api,
        usdcToken[0].tokenId,
        valueWithDecimals
      );

      if (assetTokenPrice) {
        const assetTokenNoSemicolons = assetTokenPrice.toString()?.replace(/[, ]/g, "");
        const assetTokenNoDecimals = formatDecimalsFromToken(
          parseFloat(assetTokenNoSemicolons),
          "6"
        );
        return (Number(assetTokenNoDecimals) * Number(usdcPrice)).toString();
      }
    }
  };

  const getPriceOfNativeFromAsset = async (value: string, assetToken: Token) => {
    if (api) {
      const valueWithDecimals = formatInputTokenValue(
        value,
        assetToken.decimals
      );

      const nativeTokenPrice = await getNativeTokenFromAssetToken(
        api,
        assetTokenId,
        valueWithDecimals
      );

      if (nativeTokenPrice) {
        const nativeTokenNoSemicolons = nativeTokenPrice.toString()?.replace(/[, ]/g, "");
        const nativeTokenNoDecimals = formatDecimalsFromToken(
          parseFloat(nativeTokenNoSemicolons),
          nativeToken.decimals
        );
        return nativeTokenNoDecimals.toString();
      }
    }
  };

  const totalAmount = Number(nativeLiquidity) + Number(assetLiquidity)

  useEffect(() => {
    if (sortPeriod === "24H") {
      setApr((Number(fees) * 365 / totalAmount).toString())
    } else if (sortPeriod === "7D") {
      setApr((Number(fees) * 52 / totalAmount).toString())
    } else if (sortPeriod === "30D") {
      setApr((Number(fees) * 12 / totalAmount).toString())
    }
  }, [fees, totalAmount])



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
          <p>{"$" + nativeLiquidity + " / " + "$" + assetLiquidity}</p>
        </div>
        <div className="w-1/6">
          <p>${Number(volume) === 0 ? "0" : volume}</p>
        </div>
        <div className="w-1/6">
          <p>{Number(fees) === 0 ? "0" : Number(fees) > 0 ? "$" + fees + "e-6" : "$" + fees}</p>
        </div>
        <div className="w-1/6">
          <p>
            {apr === "0" ? "0" : parseFloat(apr).toFixed(5)}%
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
      {isClicked ?
        <PoolInformation
          tokenPair={tokenPair}
          nativeToken={nativeToken}
          assetToken={assetToken}
          lpTokenAsset={lpTokenAsset}
          assetTokenId={assetTokenId}
          lpTokenId={lpTokenId}
          nativeTokens={nativeTokens}
          assetTokens={assetTokens}
          nativeTokenPrice={nativeTokenPrice}
          assetTokenPrice={assetTokenPrice}
          usdcPrice={usdcPrice}
        />
        : null}
    </div>
  );
};

export default PoolSelection;
