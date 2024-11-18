"use client";

import { useAtom } from "jotai";
import { themeDarkAtom, isShowChartModalAtom } from "@/app/utils/store";
import Image from "next/image";

interface TokenPriceGraphProps {
  name: string;
  price: number;
  changeRate: string;
}

const TokenPriceGraph = ({ name, price, changeRate }: TokenPriceGraphProps) => {
  const [themeDark] = useAtom(themeDarkAtom);
  const [, setShowChartModal] = useAtom(isShowChartModalAtom);

  const handleChartClick = () => setShowChartModal(true);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row justify-between gap-2 text-[#B4D2FF99] dark:text-[#120038]">
        <div
          className="flex flex-col p-1 cursor-pointer"
          onClick={handleChartClick}
        >
          <div className="flex flex-row justify-center items-center w-8 h-8 rounded-full bg-gradient-to-r from-[#5100FE] to-[#32009C] p-1 font-bold">
            <Image
              src={`/logos/${name}.png`}
              alt="Token Logo"
              width={48}
              height={48}
              onError={e => {
                e.currentTarget.src = "/logos/DOT.png"
                e.currentTarget.srcset = "/logos/DOT.png"
              }}
            />
          </div>
          <p className="text-[var(--text-maincolor)] dark:text-[#5100FE] text-lg font-bold">
            {name}
          </p>
        </div>
        <div className="flex flex-col justify-center items-center text-lg font-bold">
          <p className="text-base">Price</p>
          <p
            className="text-[var(--text-maincolor)] dark:text-[#5100FE] font-bold cursor-pointer"
            onClick={handleChartClick}
          >
            ${price}
          </p>
        </div>
        <div className="flex flex-col justify-center items-center text-lg font-bold">
          <p className="text-base">24H</p>
          <p
            className="text-[#ABFFBE] dark:text-[#5100FE] cursor-pointer"
            onClick={handleChartClick}
          >
            +{changeRate}%
          </p>
        </div>
        <div
          className="flex justify-center items-center cursor-pointer"
          onClick={handleChartClick}
        >
          <Image
            src={`/graph/${name}${themeDark ? "-dark" : ""}.png`}
            alt="Token Price"
            width={120}
            height={56}
            onError={e => {
              e.currentTarget.src = `/graph/DOT${themeDark ? "-dark" : ""}.png`
              e.currentTarget.srcset = `/graph/DOT${themeDark ? "-dark" : ""}.png`
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default TokenPriceGraph;
