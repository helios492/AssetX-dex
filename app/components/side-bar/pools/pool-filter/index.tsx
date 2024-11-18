import { useRef, useEffect, useState } from "react";
import { useAtom } from "jotai";
import { viewFilterAtom, initialPoolInfoAtom, rangePoolInfoAtom } from "../../../../utils/store";
import handleArrangeByRange from "../../../../utils/handleArrangeByRange";
const PoolFilter = ({ sortBy, sortPeriod }: { sortBy: string, sortPeriod: string }) => {
  const [viewFilter, setViewFilter] = useAtom(viewFilterAtom);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [initialPoolInfo, setInitialPoolInfo] = useAtom(initialPoolInfoAtom);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [rangePoolInfo, setRangePoolInfo] = useAtom(rangePoolInfoAtom)
  const ref = useRef<HTMLDivElement>(null);
  const handleClickOutside = (event: any) => {
    if (ref.current && !ref.current?.contains(event.target)) {
      if (viewFilter) setViewFilter(false);
    }
  };
  const arrangeByRange = (sortBy: string, sortPeriod:string, sortFrom: string, sortTo: string) => {
    const sortedPoolInfo = handleArrangeByRange(
      initialPoolInfo,
      sortBy,
      sortPeriod,
      sortFrom,
      sortTo
    );
    setRangePoolInfo(sortedPoolInfo);
  };
  const [isClickedResetButton, SetIsClickedResetButton] = useState(false);
  const [sortFrom, setSortFrom] = useState("");
  const [sortTo, setSortTo] = useState("");
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);
  return (
    <>
      <div
        className={`w-48 absolute p-0.5 rounded-3xl bg-gradient-to-r from-[#5200FF] to-[#310099] dark:from-[#5200FF] dark:to-[#5200FF] z-20 top-full ${sortBy == "APR" && "-left-[110%]"} sm:left-0`}
        ref={ref}
      >
        <div className=" flex flex-col rounded-3xl w-full py-4 px-4 bg-[#1C0056] dark:bg-[#E9E9E9] font-thin gap-2">
          <div className="flex flex-row justify-start items-center border border-[var(--text-maincolor)] rounded-xl px-4  bg-[#1C0056] dark:bg-white">
            <p className="font-thin">From: </p>
            <input
              type="text"
              placeholder="0"
              // value={Number(sortFrom)}
              className="bg-transparent outline-none placeholder:text-[var(--text-maincolor)] dark:text-[#120038] placeholder:focus:text-[#3b3b3b] px-4 py-1.5"
              onChange={(e) => {
                setSortFrom(e.target.value);
              }}
            />
          </div>
          <div className="flex flex-row justify-start items-center border border-[var(--text-maincolor)] rounded-xl px-4 bg-[#1C0056] dark:bg-white">
            <p>To: </p>
            <input
              type="text"
              placeholder="0"
              // value={Number(sortTo)}
              className="bg-transparent outline-none placeholder:text-[var(--text-maincolor)] dark:text-[#120038] placeholder:focus:text-[#3b3b3b] px-4 py-1.5"
              onChange={(e) => {
                setSortTo(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.code == "Enter") {
                  setViewFilter(false);
                  if (sortBy === "Liquidity")
                    arrangeByRange("liquidity", sortPeriod, sortFrom, sortTo);
                  else if (sortBy === "Volume")
                    arrangeByRange("volume",sortPeriod, sortFrom, sortTo);
                  else if (sortBy === "Fees")
                    arrangeByRange("fees",sortPeriod, sortFrom, sortTo);
                  else if (sortBy === "APR") arrangeByRange("apr", sortPeriod, sortFrom, sortTo);
                }
              }}
            />
          </div>
          <div onClick={() => setViewFilter(false)}>
            <div
              className={`rounded-xl border border-[#B4D2FF] text-center py-1.5 whitespace-nowrap cursor-pointerfont-bold cursor-pointer dark:text-white ${
                isClickedResetButton
                  ? "text-white bg-gradient-to-r from-[#E6007A] to-[#9746FF]"
                  : "bg-gradient-to-b from-[#5100FE] to-[#32009C]  hover:from-[#1C0057] hover:to-[#1A0050] "
              }`}
              onMouseDown={() => {
                SetIsClickedResetButton(true);
                if (sortBy === "Liquidity")
                  arrangeByRange("liquidity", sortPeriod, sortFrom, sortTo);
                if (sortBy === "Volume")
                  arrangeByRange("volume",sortPeriod, sortFrom, sortTo);
                if (sortBy === "Fees") arrangeByRange("fees",sortPeriod, sortFrom, sortTo);
                if (sortBy === "APR") arrangeByRange("apr",sortPeriod, sortFrom, sortTo);
              }}
              onMouseUp={() => SetIsClickedResetButton(false)}
            >
              Reset
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PoolFilter;
