"use client";
import { useRef } from "react";
import { useAtom } from "jotai";
import {
  isShowChartModalAtom,
  oneTimeSeriesSelectedAtom,
} from "@/app/utils/store";
import useClickOutside from "@/app/hooks/useClickOutside";
import Image from "next/image";

const ShowChartModal = () => {
  const [isShowChartModal, setIsShowChartModal] = useAtom(isShowChartModalAtom);
  const [oneTimeSeriesSelected, setOneTimeSeriesSelected] = useAtom(
    oneTimeSeriesSelectedAtom
  );
  const time_series = ["15m", "1H", "4H", "1D", "1W"];
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => {
    if (isShowChartModal) setIsShowChartModal(false);
  });
  return (
    <>
      <div className="w-screen h-screen absolute top-0 left-0 sm:-translate-x-[17.2%] sm:-translate-y-[90px] z-50 bg-black bg-opacity-75" />
      <div
        className={`w-screen sm:w-[540px] bg-gradient-to-br from-[#5100FE] to-[#B4D2FF] dark:bg-gradient-to-b dark:from-[#5100FE] dark:to-[#5100FE] p-0.5 z-50 rounded-t-3xl sm:left-1/2 sm:-translate-x-1/2 sm:bottom-0 ${
          isShowChartModal && "showchart-none"
        }`}
        ref={ref}
      >
        <div className="w-full flex flex-col gap-6 px-4 pt-5 bg-gradient-to-br from-[#2B0281] to-[#220068] dark:bg-gradient-to-t dark:from-white dark:to-white rounded-t-3xl text-[var(--text-maincolor)] dark:text-[#120038] relative ">
          <div className="absolute top-2 right-2">
            <div
              className="flex justify-center items-center rounded-full w-12 h-12 text-2xl text-[var(--text-maincolor)] dark:text-[#120038] hover:bg-[#81818165] hover:text-white cursor-pointer"
              onClick={() => setIsShowChartModal(false)}
            >
              X
            </div>
          </div>
          {/* SLIPPAGE TOLERANCE */}
          <div className="flex flex-col gap-2.5">
            {/* HEADER of Chart Overlay */}
            <div className="flex flex-row justify-start items-center pl-4 gap-2">
              <div className="flex flex-row justify-start items-center ">
                <div className="w-5 h-5 rounded-full bg-gradient-to-b from-[#5100FE] to-[#32009C] p-0.5 -mr-1">
                  <Image
                    width={20}
                    height={20}
                    src="/logos/DOT.png"
                    alt="DOT"
                    className="w-full h-full"
                  />
                </div>
                <div className="w-5 h-5 rounded-full bg-gradient-to-b from-[#5100FE] to-[#32009C] p-0.5">
                  <Image
                    width={20}
                    height={20}
                    src="/logos/ASX.png"
                    alt="ASX"
                    className="w-full h-full"
                  />
                </div>
              </div>
              <div className="text-sm font-bold">DOT / ASX</div>
              <div>
                <Image
                  width={28}
                  height={28}
                  src="/sidebar-icons/SwapMobile.png"
                  alt="Swap"
                  className="w-7 h-7"
                />
              </div>
              <div>
                <p className="text-sm text-[#b4d2ff73] font-bold">08/08/2024 09:30</p>
              </div>
            </div>
            {/* Time Unit field Selection */}
            <div className="flex flex-row justify-start items-center w-fit rounded-lg p-[3px] bg-[#32009C] dark:bg-[#E8E8E8]">
              {time_series.map((time) => (
                <div
                  key={time}
                  className={`${
                    oneTimeSeriesSelected === time
                      ? "bg-[#5100FE] dark:bg-white font-bold"
                      : "bg-transparent"
                  }  rounded-lg text-[var(--text-maincolor)] dark:text-[#120038] cursor-pointer text-sm px-3 py-1`}
                  onClick={() => setOneTimeSeriesSelected(time)}
                >
                  {time}
                </div>
              ))}
            </div>
            {/* Main Chart */}
            <div className="rounded-t-3xl">
              <Image
                width={540}
                height={200}
                src="/graph/chart.png"
                alt="Chart"
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default ShowChartModal;
