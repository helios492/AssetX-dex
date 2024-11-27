"use client";
import { isShowChartModalAtom } from "@/app/utils/store";
import MainButton from "@/app/components/button/main-button";
import Image from "next/image";
import { useAtom } from "jotai";
import { themeDarkAtom } from "@/app/utils/store";

interface TokenProps {
  tokenA: string;
  tokenB: string;
  price: number;
  changeRate: string;
}

const TokenPriceGraphMobile = ({
  tokenA,
  tokenB,
  price,
  changeRate,
}: TokenProps) => {
  const [, setShowChartModal] = useAtom(isShowChartModalAtom);

  const [isThemeDark] = useAtom(themeDarkAtom);
  console.log("tokens", tokenA, tokenB)
  return (
    <div className="flex flex-col p-7 gap-5">
      <div className="flex flex-row justify-start gap-7">
        <div className="flex flex-col justify-between w-1/3 gap-2">
          <div className="flex flex-row cursor-pointer justify-start items-center gap-4">
            <div className="flex flex-row justify-center items-center rounded-full p-0.5 relative cursor-pointer" onClick={() => setShowChartModal(true)}>
              <div className="flex flex-row justify-center items-center w-6 h-6 rounded-full bg-gradient-to-r from-[#5100FE] to-[#32009C] p-0.5 ">
                <Image src={`/logos/${tokenA}.png`} alt="Token Logo" width={16} height={16} onError={e => {
                  e.currentTarget.src = "/logos/DOT.png"
                  e.currentTarget.srcset = "/logos/DOT.png"
                }} />
              </div>

              <div className="flex flex-row justify-center items-center w-6 h-6 rounded-full bg-gradient-to-r from-[#5100FE] to-[#32009C] p-0.5 absolute left-[70%]">
                <Image src={`/logos/${tokenB}.png`} alt="Token Logo" width={16} height={16} onError={e => {
                  e.currentTarget.src = "/logos/DOT.png"
                  e.currentTarget.srcset = "/logos/DOT.png"
                }} />
              </div>
            </div>
            <p className="text-lg text-white font-bold whitespace-nowrap cursor-pointer" onClick={() => setShowChartModal(true)}>
              {tokenA} / {tokenB}
            </p>
          </div>
          <div className="flex flex-row justify-between items-center gap-1">
            <p className="cursor-pointer  text-base font-bold">{price}</p>
            <p className="text-[#ABFFBE] dark:text-[#5100FE] cursor-pointer text-sm" onClick={() => setShowChartModal(true)}>
              {changeRate}
            </p>
          </div>
        </div>
        <div className="flex justify-center items-center w-full cursor-pointer" onClick={() => setShowChartModal(true)}>
          {isThemeDark ? (
            <Image src={`/graph/${tokenB}-dark1.png`} alt="Token Price" width={100} height={100} onError={e => {
              e.currentTarget.src = `/graph/DOT-dark.png`
              e.currentTarget.srcset = `/graph/DOT-dark.png`
            }} />
          ) : (
            <Image src={`/graph/${tokenB}.png`} alt="Token Price" width={100} height={100} onError={e => {
              e.currentTarget.src = `/graph/DOT.png`
              e.currentTarget.srcset = `/graph/DOT.png`
            }} />
          )}
        </div>
      </div>
      <div className="px-5" onClick={() => setShowChartModal(true)}>
        <MainButton
          imgURL="/icons/expand.png"
          content="Show Chart"
          className="justify-center rounded-md py-2 bg-gradient-to-r"
        />
      </div>
    </div>
  );
};

export default TokenPriceGraphMobile;
