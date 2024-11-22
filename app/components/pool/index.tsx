"use client";
import { useState, useEffect } from "react";
import { useAtom } from "jotai";
import Link from "next/link";
import Image from "next/image";
import MainButton from "@/app/components/button/main-button";
import PoolsListTableHead from "@/app/components/side-bar/pools/PoolsListTableHead";
import PoolsListTableHeadMobile from "@/app/components/side-bar/pools/PoolsListTableHeadMobile";
import PoolSelection from "@/app/components/side-bar/pools/PoolSelection";
import MobilePoolInformation from "@/app/components/side-bar/pools/MobilePoolInformation";
import MobilePoolInfoModal from "@/app/components/side-bar/pools/MobilePoolInfoModal";

import {
  themeDarkAtom,
  initialPoolInfoAtom,
  rangePoolInfoAtom
} from "@/app/utils/store";
import { initialPoolInfoType } from "@/app/utils/type";
import { useAppContext } from "@/app/state/hook";
import { LottieLarge, LottieMedium } from "@/app/components/loader";
import { PoolCardProps } from "@/app/types";

export default function Pools() {
  const time_arrangement = ["24H", "7D", "30D"];
  const [isClickedSortByTime, setIsClickedSortByTime] = useState(false);
  const [sortPeriod, setSortPeriod] = useState("24H");
  const [isShowPoolInfoModal, setIsShowPoolInfoModal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [themeDark] = useAtom(themeDarkAtom);
  const [initialPoolInfo, setinitialPoolInfo] = useAtom(initialPoolInfoAtom);
  const [rangePoolInfo] = useAtom(rangePoolInfoAtom)
  const [poolInfo, setPoolInfo] = useState<initialPoolInfoType[]>([]);

  const { state } = useAppContext();
  const { selectedAccount, pools, poolsCards } = state;

  const [isPoolsLoading, setPoolsIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (pools.length > 0 && poolsCards.length > 0) {
      setPoolsIsLoading(false);
    }
  }, [pools, poolsCards]);

  // When star is clicked
  function handleStarClick(id: number) {
    setinitialPoolInfo(
      initialPoolInfo.map((pool: initialPoolInfoType) =>
        pool.id === id
          ? {
            ...pool,
            favourite: !pool.favourite,
          }
          : pool
      )
    );
  }

  // Create a filtered version of the poolInfo array
  useEffect(() => {
    const sortedByStarPoolInfo = initialPoolInfo.filter(
      (pool: initialPoolInfoType) => pool.favourite
    );
    const sortedByUnStarPoolInfo = initialPoolInfo.filter(
      (pool: initialPoolInfoType) => !pool.favourite
    );
    const sortedBySearchPoolInfo = sortedByUnStarPoolInfo.filter(
      (pool: initialPoolInfoType) =>
        pool.tokenA.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pool.tokenB.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (rangePoolInfo == false) {
      setPoolInfo([...sortedByStarPoolInfo, ...sortedBySearchPoolInfo]);
    }
    else {
      setPoolInfo([...rangePoolInfo]);
      // setRangePoolInfo([]);
    }

  }, [initialPoolInfo, searchQuery, rangePoolInfo])

  return (
    <>
      {/* For Desktop Screen */}
      <div className="hidden sm:flex flex-col h-[calc(100vh-90px)] p-8 md:p-12 lg:p-14 py-20 gap-6">
        {/* Pools Header with TVL and 24H Volume */}
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-col 2xl:flex-row items-start justify-between px-5 gap-6 text-2xl">
            <p className="text-3xl text-white dark:text-[#120038] font-bold">
              Pools
            </p>
            <div className="flex flex-row justify-center items-center">
              <p className="text-[#7BB0FF] dark:text-[#120038] whitespace-nowrap">
                TVL:{" "}
                <span className="text-[var(--text-maincolor)] dark:text-[#32009C] font-bold">
                  $888,888,888.88
                </span>
              </p>
            </div>
            <div className="flex flex-row justify-center items-center">
              <p className="text-[#7BB0FF] dark:text-[#120038] whitespace-nowrap">
                Volume {sortPeriod}:{" "}
                <span className="text-[var(--text-maincolor)] dark:text-[#32009C] font-bold">
                  $888,888,888.88
                </span>
              </p>
            </div>
          </div>
          {/* Create Pool Button */}
          <div className="flex flex-row-reverse justify-center items-center px-14">
            <Link key={"create-pool"} href="/dashboard/pools">
              <MainButton
                content="Create Pool"
                imgURL="/pools-icon/pools-icon.png"
                imgURLDark="/pools-icon/pools-white-desktop.png"
                className="justify-center text-base py-1.5 pl-5 rounded-md sm:rounded-xl bg-gradient-to-r"
              />
            </Link>
          </div>
        </div>
        {/* The Pools List Body */}
        <div className="h-[70vh] bg-gradient-to-br from-[#5100FE] to-[#B4D2FF] dark:bg-gradient dark:from-[#5100FE] dark:to-[#5100FE] p-0.5 rounded-[50px]">
          <div className="flex flex-col h-full w-full bg-gradient-to-br from-[#2B0281] via-[#1D0058] to-[#220068] dark:from-[#E9E9E9] dark:via-[#E9E9E9] dark:to-[#E9E9E9] rounded-[50px] sm:box-shadow-out md:px-12 lg:px-16 md:pt-8 lg:pt-12 pb-6">
            {/* The title of Liquidity Pools, arrangement method and search bar */}
            <div className="flex flex-col lg:flex-row justify-between items-center ">
              <div className="flex flex-col justify-start font-bold">
                <p className="text-white dark:text-[#120038] text-3xl">
                  Liquidity Pools
                </p>
                <p className="text-2xl text-[#7BB0FFBF] dark:text-[#32009C] ">
                  Earn yield on trading fees by providing liquidity
                </p>
              </div>
              <div className="flex flex-row gap-5">
                {/* The arrangement method */}
                <div
                  className={`flex flex-row justify-center items-center p-3 gap-10 bg-[#1C0057] dark:bg-white border border-[var(--text-maincolor)] dark:border-[#5100FE] z-20 cursor-pointer relative ${isClickedSortByTime ? "rounded-t-xl" : "rounded-xl"
                    }`}
                  onClick={() => {
                    setIsClickedSortByTime(!isClickedSortByTime);
                  }}
                >
                  <p className="whitespace-nowrap text-[#7BB0FF] dark:text-[#5100FE]">
                    Time Basis:{" "}
                    <span className="text-[var(--text-maincolor)] dark:text-[#120038]">
                      {sortPeriod}
                    </span>
                  </p>
                  <div>
                    {themeDark ? (
                      <Image
                        width={10}
                        height={10}
                        src="/swap-icons/ArrowDownDark.svg"
                        alt="Arrow Down"
                      />
                    ) : (
                      <Image
                        width={10}
                        height={10}
                        src="/swap-icons/ArrowDownLight.svg"
                        alt="Arrow Down"
                      />
                    )}
                  </div>
                  {isClickedSortByTime ? (
                    <>
                      <div
                        className={`flex flex-col justify-start items-center absolute w-full bg-[#32009C] dark:bg-[#E9E9E9] rounded-b-xl top-[50px]`}
                      >
                        {time_arrangement.map((time) => (
                          <div
                            className={`text-base p-4 hover:bg-gradient-to-r hover:from-[#1C0057] to-[#32009C] dark:from-[#E9E9E9] dark:to-[#cbcbcb] w-full ${sortPeriod === time &&
                              "border-l-3 border-[#ABFFBE] dark:border-[#5100FE]"
                              } ${sortPeriod === "30D" && "rounded-b-xl"}`}
                            key={time}
                            onClick={() => {
                              setSortPeriod(time);
                            }}
                          >
                            {time}
                          </div>
                        ))}
                      </div>
                    </>
                  ) : null}
                </div>
                {/* The search bar */}
                <div className="flex flex-row justify-center items-center px-4 py-3 gap-2 bg-[#1C0057] dark:bg-white rounded-xl border border-[var(--text-maincolor)] dark:border-[#5100FE]">
                  <Image
                    width={12}
                    height={12}
                    src="/pools-icon/search.svg"
                    alt="Search"
                  />
                  <input
                    className="w-full bg-transparent border-none border-[#1C0057] outline-none placeholder-[#7BB0FF] dark:placeholder-[#120038] focus:placeholder-[#526481] dark:focus:placeholder-[#5264816f]"
                    placeholder="Search All"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                    }}
                  ></input>
                </div>
              </div>
            </div>
            {/* The list of pools */}
            <PoolsListTableHead sortPeriod={sortPeriod} />
            <div
              className={`flex flex-col my-2 py-2 gap-4 rounded-md overflow-auto ${themeDark
                ? "pools-list-scrollbar-desktop-dark"
                : "pools-list-scrollbar-desktop"
                }`}
            >
              {poolsCards.map((item: PoolCardProps, index: number) => (
                <div key={index}>
                  <PoolSelection
                    tokenPair={item.name}
                    nativeTokens={item.totalTokensLocked.nativeToken.formattedValue}
                    assetTokens={item.totalTokensLocked.assetToken.formattedValue}
                    lpTokenAsset={item.lpTokenAsset}
                    assetToken={item.totalTokensLocked.assetToken}
                    nativeToken={item.totalTokensLocked.nativeToken}
                    assetTokenId={item.assetTokenId}
                    lpTokenId={item.lpTokenId}
                    sortPeriod={sortPeriod}
                  />
                </div>
              ))}
              {/* {sortedByNonStarPoolInfo.map((pool) => (
                <PoolSelection
                  key={pool.id}
                  id={pool.id}
                  tokenA={pool.tokenA}
                  tokenB={pool.tokenB}
                  favourite={pool.favourite}
                  liquidity={pool.liquidity}
                  volume24h={pool.volume24h}
                  volume7d={pool.volume7d}
                  volume30d={pool.volume30d}
                  fees24h={pool.fees24h}
                  fees7d={pool.fees7d}
                  fees30d={pool.fees30d}
                  apr24h={pool.apr24h}
                  apr7d={pool.apr7d}
                  apr30d={pool.apr30d}
                  sortPeriod={sortPeriod}
                  handleFavourite={handleStarClick}
                />
              ))} */}
            </div>
            {/* The End */}
          </div>
        </div>
      </div>

      {/* For Mobile Screen */}
      <div className="flex sm:hidden justify-center items-center h-screen py-[20%]">
        <div className="w-[90%] h-[95%] min-w-[370px] rounded-2xl bg-gradient-to-r from-[#5100FE] to-[#B4D2FF]  dark:bg-gradient-to-b dark:from-[#5100FE] dark:to-[#5100FE] p-0.5">
          <div className="w-full h-full flex flex-col bg-gradient-to-br from-[#220068] to-[#2B0281] dark:bg-gradient-to-t dark:from-[#E8E8E8] dark:to-[#E8E8E8] rounded-2xl pb-4">
            {/* The title of Liquidity Pools, arrangement method and search bar */}
            <div className="flex flex-col gap-3 w-full pt-5 pb-2.5 px-4 text-sm">
              <div className="flex flex-row justify-between">
                <p className="text-[#7BB0FF] dark:text-[#120038]">
                  TVL:
                  <span className="font-bold text-[var(--text-maincolor)] dark:text-[#32009C]">
                    {" "}
                    $888,888,888.88
                  </span>
                </p>
                <p className="text-[#7BB0FF] dark:text-[#120038]">
                  Volume <span>{sortPeriod}</span>:
                  <span className="font-bold text-[var(--text-maincolor)] dark:text-[#32009C]">
                    {" "}
                    $888,888,888.88
                  </span>
                </p>
              </div>
              <div className="flex flex-row justify-between items-center gap-[2%]">
                <div className="flex flex-row p-1.5 bg-[#120038] dark:bg-white rounded-xl">
                  {time_arrangement.map((time) => (
                    <div
                      className={`py-1 px-4 w-full rounded-md ${sortPeriod == time &&
                        "bg-[#5100FE] dark:bg-[#E8E8E8] text-[var(--text-maincolor)] dark:text-[#5100FE] font-bold"
                        }`}
                      key={time}
                      onClick={() => {
                        setSortPeriod(time);
                      }}
                    >
                      {time}
                    </div>
                  ))}
                </div>
                {/* Time Series Setting */}
                <div>
                  <MainButton
                    content="Create Pool"
                    className="px-2 py-1 rounded-md bg-gradient-to-r"
                    imgURL="/pools-icon/pools-icon.png"
                    imgURLDark="/pools-icon/pools-icon.png"
                  />
                </div>
              </div>
              {/* Search Bar */}
              <div className="flex flex-row justify-start items-center px-4 py-2 gap-2 bg-[#1C0057] dark:bg-white rounded-md border border-[var(--text-maincolor)] dark:border-[#5100FE]">
                <Image
                  width={12}
                  height={12}
                  src="/pools-icon/search.svg"
                  alt="Search"
                />
                <input
                  className="w-full bg-transparent border-none outline-none placeholder-[#7BB0FF] dark:placeholder-[#1C0057] focus:placeholder-[#526481] dark:focus:placehoder-[#1C0057]"
                  placeholder="Search All"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                  }}
                />
              </div>
            </div>
            {/* The list of pools */}
            <div
              className={`w-full overflow-auto ${themeDark
                ? "pools-list-scrollbar-mobile-dark"
                : "pools-list-scrollbar-mobile"
                }`}
            >
              <table className="w-full text-sm font-bold">
                <thead className="bg-[#1C0056] dark:bg-[white] sticky top-0 z-20">
                  <tr className="flex flex-row pl-6 py-2.5">
                    <PoolsListTableHeadMobile sortPeriod={sortPeriod} />
                  </tr>
                </thead>
                <tbody>
                  {isPoolsLoading ? (
                    <tr className="mt-60 flex items-center justify-center">
                      <LottieMedium />
                    </tr>
                  ) : pools.length > 0 && poolsCards.length > 0 ? (
                    <>
                      {poolInfo.map((pool, index) => (
                        <tr key={pool.id}>
                          <div
                            className={`${index % 2 == 0
                              ? "bg-[#270175] dark:bg-white"
                              : "bg-[#fcfcfc0c] dark:bg-[#E8E8E8]"
                              }`}
                            onClick={() => setIsShowPoolInfoModal(pool.id)}
                          >
                            <MobilePoolInformation
                              id={pool.id}
                              tokenA={pool.tokenA}
                              tokenB={pool.tokenB}
                              favourite={pool.favourite}
                              volume24h={pool.volume24h}
                              volume7d={pool.volume7d}
                              volume30d={pool.volume30d}
                              apr24h={pool.apr24h}
                              apr7d={pool.apr7d}
                              apr30d={pool.apr30d}
                              sortPeriod={sortPeriod}
                            />
                          </div>
                          {/* Pool Info Modal */}
                          {isShowPoolInfoModal === pool.id && (
                            <MobilePoolInfoModal
                              id={pool.id}
                              tokenA={pool.tokenA}
                              tokenB={pool.tokenB}
                              volume24h={pool.volume24h}
                              volume7d={pool.volume7d}
                              volume30d={pool.volume30d}
                              apr24h={pool.apr24h}
                              apr7d={pool.apr7d}
                              apr30d={pool.apr30d}
                              fees24h={pool.fees24h}
                              fees7d={pool.fees7d}
                              fees30d={pool.fees30d}
                              liquidity={pool.liquidity}
                              favourite={pool.favourite}
                              sortPeriod={sortPeriod}
                              handleFavourite={handleStarClick}
                              setIsShowPoolInfoModal={setIsShowPoolInfoModal}
                            />
                          )}
                        </tr>
                      ))}
                    </>
                  ) : (
                    <div className="flex h-[664px] flex-col items-center justify-center gap-4 rounded-2xl bg-white p-6">
                      Token Icon
                      <div className="text-center text-gray-300">
                        {selectedAccount ? "No active liquidity positions." : "Connect wallet to view your liquidity positions."}
                      </div>
                    </div>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
