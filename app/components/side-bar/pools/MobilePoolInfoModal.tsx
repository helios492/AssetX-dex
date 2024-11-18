"use client";
import { useState, useRef } from "react";
import { useAtom } from "jotai";
import { VictoryBar, VictoryPie } from "victory";
import MainButton from "../../button/main-button";
import numberToString from "../../../utils/numberToString";
import useClickOutside from "../../../hooks/useClickOutside";
import {
  oneTimeSeriesSelectedAtom,
  themeDarkAtom,
} from "../../../utils/store";
import Image from "next/image";
interface MobilePoolInfoModalProps {
  id: number;
  tokenA: string;
  tokenB: string;
  favourite: boolean;
  liquidity: number;
  volume24h: number;
  volume7d: number;
  volume30d: number;
  fees24h: number;
  fees7d: number;
  fees30d: number;
  apr24h: number;
  apr7d: number;
  apr30d: number;
  sortPeriod?: string;
  setIsShowPoolInfoModal: (value: number) => void;
  handleFavourite: (id: number) => void;
}
const MobilePoolInfoModal:React.FC< MobilePoolInfoModalProps> = ({
  id,
  tokenA,
  tokenB,
  favourite,
  volume24h,
  volume7d,
  volume30d,
  fees24h,
  fees7d,
  fees30d,
  apr24h,
  apr7d,
  apr30d,
  sortPeriod,
  setIsShowPoolInfoModal,
  handleFavourite,
}) => {
  const time_series = ["15m", "1H", "4H", "1D", "1W"];
  const options = ["Volume", "Liquidity"];
  const [option, setOption] = useState("Volume");
  const [oneTimeSeriesSelected, setOneTimeSeriesSelected] = useAtom(
    oneTimeSeriesSelectedAtom
  );
  const [themeDark,] = useAtom(themeDarkAtom);

  let volume: string,
      fees: string,
      apr: string = "";
  if (sortPeriod === "24H") {
    volume = numberToString(volume24h);
    fees = numberToString(fees24h);
    apr = numberToString(apr24h);
  } else if (sortPeriod === "7D") {
    volume = numberToString(volume7d);
    fees = numberToString(fees7d);
    apr = numberToString(apr7d);
  } else {
    volume = numberToString(volume30d);
    fees = numberToString(fees30d);
    apr = numberToString(apr30d);
  }
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setIsShowPoolInfoModal(0));
  return (
    <>
      <div key={id} className="w-screen h-screen absolute top-0 left-0 z-40 bg-black bg-opacity-75" />
      <div
        className={`block sm:hidden w-screen bg-gradient-to-br from-[#5100FE] to-[#B4D2FF] dark:bg-gradient-to-t dark:from-[#5100FE] dark:to-[#5100FE] rounded-t-3xl p-[1px] z-50 showPoolInfo-none
            `}
        ref={ref}
      >
        <div className="w-full h-full flex flex-col gap-6 px-4 pt-5 pb-8 rounded-t-3xl bg-gradient-to-br from-[#2B0281] to-[#220068] dark:bg-gradient-to-br dark:from-[#FFF] dark:to-[#FFF] text-[var(--text-maincolor)] dark:text-[#120038] relative ">
          <div className="absolute top-2 right-2">
            <div
              className="flex justify-center items-center rounded-full w-12 h-12 text-2xl text-[var(--text-maincolor)] dark:text-[#120038] hover:bg-[#81818165] hover:text-white cursor-pointer"
              onClick={() => setIsShowPoolInfoModal(0)}
            >
              X
            </div>
          </div>
          <div className="flex flex-col gap-2.5">
            {/* Token pair */}
            <div className="flex flex-col justify-between items-center">
              {/* Token pair images */}
              <div className="flex">
                <div className="flex flex-row justify-center items-center w-11 h-11 rounded-full bg-gradient-to-r from-[#5100FE] to-[#32009C] -mr-[3%]">
                  <Image
                    width={40}
                    height={40}
                    src={`/logos/${tokenA}.png`}
                    alt="Token Icon"
                  />
                </div>
                <div className="flex flex-row justify-center items-center w-11 h-11 rounded-full bg-gradient-to-r from-[#5100FE] to-[#32009C] -ml-[3%]">
                  <Image
                    width={40}
                    height={40}
                    src={`/logos/${tokenB}.png`}
                    alt="Token Icon"
                  />
                </div>
              </div>
              <div className="flex flex-row justify-center items-center gap-2">
                <p className="text-3xl font-bold">{tokenA} - {tokenB}</p>
                {/* Star Setting */}
                <Image
                  width={36}
                  height={36}
                  src={
                    favourite
                      ? "/pools-icon/star-fill.svg"
                      : `${
                          themeDark
                            ? "/pools-icon/star-dark.svg"
                            : "/pools-icon/star.svg"
                        }`
                  }
                  alt="Star Icon"
                  onClick={() => handleFavourite(id)}
                  className="flex w-9 h-9 z-30 cursor-pointer"
                />
              </div>

            </div>
            {/* Token pair pool, price and change rate */}
            <div className="flex flex-col bg-[#120038] dark:bg-[#E8E8E8] rounded-2xl">
              <div className="flex justify-between items-center text-left pl-5 pr-11 py-3">
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-bold">
                    Volume <span>{sortPeriod}</span>
                  </p>
                  <p>{volume}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-bold">
                    Fees <span>{sortPeriod}</span>
                  </p>
                  <p>{fees}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-bold">TVL</p>
                  <p>888,888</p>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center gap-6 bg-[#120038] dark:bg-[#E8E8E8] rounded-2xl px-5 py-3  text-left">
              <div className="flex flex-row justify-between w-1/2">
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-bold">Total APR</p>
                  <p>{apr}%</p>
                </div>
                <div className="w-12 h-12">
                  <VictoryPie
                    padding={0}
                    colorScale={[
                      `${themeDark ? "#FF4FD8" : "#E6007A"}`,
                      "#9747FF",
                    ]}
                    innerRadius={140}
                    data={[
                      {
                        y: 888.88,
                      },
                      {
                        y: 88.88,
                      },
                    ]}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 w-1/2">
                <div className="flex flex-row justify-between items-center">
                  <div className="flex flex-row gap-2 items-center">
                    <div className="h-2 w-2 bg-[#E6007A] dark:bg-[#FF4FD8] rounded-full" />
                    <p className="text-sm">Trade Fees</p>
                  </div>
                  <p className="text-sm">{fees}%</p>
                </div>
                <div className="flex flex-row justify-between items-center">
                  <div className="flex flex-row items-center gap-2">
                    <div className="h-2 w-2 bg-[#9747FF] rounded-full" />
                    <p className="text-sm">{tokenB}</p>
                    <Image
                      width={16}
                      height={16}
                      src={`/logos/${tokenB}.png`}
                      className="w-4 h-4 border border-[#5100FE]  rounded-full"
                      alt="Token Icon"
                    />
                  </div>
                  <p className="text-sm">88.88%</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center gap-2 bg-[#120038] dark:bg-[#E8E8E8] rounded-2xl px-5 py-3  text-left text-sm">
              <p className="text-sm font-bold">Weekly Rewards</p>
              <div className="flex flex-row justify-start ">
                <Image
                  width={24}
                  height={24}
                  src={`/logos/${tokenB}.png`}
                  className="w-6 h-6 border-2 border-[#5100FE] rounded-full"
                  alt="Token Icon"
                />
                <p className="px-1 font-bold">8,888.8</p>
                <p>ASX</p>
                <p className="pl-4 font-bold">$8,888.88</p>
              </div>
            </div>
            <div className="flex flex-col bg-[#120038] dark:bg-[#E8E8E8] rounded-2xl px-5 py-3">
              <div className="flex flex-row justify-between gap-1.5">
                <div className="flex flex-row justify-center items-center gap-1">
                  {options.map((item, index) => (
                    <div
                      key={index}
                      className={`${
                        option === item
                          ? "bg-[#32009C] dark:bg-white font-bold"
                          : "bg-transparent font-medium"
                      } px-1.5 py-1 text-sm rounded-lg cursor-pointer`}
                      onClick={() => setOption(item)}
                    >
                      {item}
                    </div>
                  ))}
                </div>
                <div className="flex flex-row justify-center items-center gap-1">
                  {time_series.map((item, index) => (
                    <div
                      className={`flex justify-center items-center rounded-md px-1.5 py-1 text-sm cursor-pointer ${
                        oneTimeSeriesSelected === item
                          ? "bg-[#32009C] dark:bg-white font-bold"
                          : "font-medium"
                      }`}
                      key={index}
                      onClick={() => setOneTimeSeriesSelected(item)}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-full h-12 relative">
                <VictoryBar
                  width={2400}
                  cornerRadius={{ top: 15, bottom: 15 }}
                  style={{
                    data: {
                      fill: `${themeDark ? "#FF4FD8" : "#E6007A"}`,
                      width: 30,
                    },
                  }}
                  data={[
                    "0.3",
                    "0.2",
                    "0.3",
                    "0.2",
                    "0.3",
                    "0.2",
                    "0.3",
                    "0.2",
                    "0.6",
                    "0.2",
                    "0.3",
                    "0.2",
                    "0.3",
                    "0.2",
                    "0.3",
                    "0.2",
                    "0.3",
                    "0.2",
                    "0.3",
                    "0.2",
                    "0.3",
                    "0.2",
                    "0.3",
                    "0.2",
                    "0.3",
                    "0.2",
                    "0.3",
                    "0.2",
                  ]}
                />
                <hr className="w-full border-[0.5px] border-[#b4d2ff42] absolute top-[10px]" />
                <hr className="w-full border-[0.5px] border-[#b4d2ff42] absolute top-[26px]" />
              </div>
              <div className="flex flex-row justify-between px-1.5 text-sm text-[#b4d2ff42] dark:text-[#12003882] -mt-3">
                <p>8/8</p>
                <p>8/8</p>
                <p>8/8</p>
                <p>8/8</p>
                <p>8/8</p>
                <p>8/8</p>
                <p>8/8</p>
                <p>8/8</p>
              </div>
            </div>
            <MainButton
              content="Deposit"
              className="w-full rounded-md py-2 justify-center bg-gradient-to-b"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default MobilePoolInfoModal;
