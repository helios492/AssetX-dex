import { useState } from "react";
import { useAtom } from "jotai";
import { viewFilterAtom, initialPoolInfoAtom } from "../../../utils/store";
import PoolFilter from "./pool-filter";
import handleArrangeByName from "../../../utils/handleArrangeByName";
import handleArrangeByNumber from "../../../utils/handleArrangeByNumber";
import Image from "next/image";

const pool_head_content = ["Pool", "Liquidity", "Volume", "Fees", "APR"];

const PoolsListTableHead = ({ sortPeriod }: { sortPeriod: string }) => {
  const [activeSort, setActiveSort] = useState({ column: "", direction: "" });
  const [viewFilter, setViewFilter] = useAtom(viewFilterAtom);
  const [initialPoolInfo, setInitialPoolInfo] = useAtom(initialPoolInfoAtom);

  const handleSort = (content: string, direction: string) => {
    setActiveSort({ column: content, direction });
    const sortFunction = content === "Pool" ? handleArrangeByName : handleArrangeByNumber;
    const sortedPoolInfo = sortFunction(initialPoolInfo, content.toLowerCase(), direction);
    if (Array.isArray(sortedPoolInfo)) {
      setInitialPoolInfo(sortedPoolInfo.map(pool => ({ ...pool, arranged: pool.id === 1 ? !pool.arranged : pool.arranged })));
    }
    setTimeout(() => {
      setActiveSort({ column: "", direction: "" });
    }, 500);
  };

  return (
    <div className="flex flex-row justify-between px-5 py-3 bg-[#1C0056] dark:bg-white rounded-2xl box-shadow-down-black font-bold mt-5">
      <div className="w-1/5"></div>
      {pool_head_content.map((content) => (
        <div key={content} className="flex flex-row cursor-pointer gap-0.5 w-1/6 relative">
          <p className="text-[var(--text-maincolor)] dark:text-[#120038] whitespace-nowrap">
            {content} {["APR", "Fees", "Volume"].includes(content) && <span>{sortPeriod}&nbsp;</span>}
          </p>
          <div className="flex flex-col justify-center items-center gap-0.5">
            {["up", "down"].map((direction) => (
              <Image
                key={direction}
                src={`/pools-icon/arrange${activeSort.column === content && activeSort.direction === direction ? "uplight" : "up"}.svg`}
                width={10}
                height={12}
                alt="Arrange Icon"
                className={`${direction === "down" ? "rotate-180" : ""} ${activeSort.column === content && activeSort.direction === direction ? "scale-110" : ""}`}
                onClick={() => handleSort(content, direction)}
              />
            ))}
          </div>
          {content !== "Pool" && (
            <Image
              src={`/pools-icon/filter${viewFilter && activeSort.column === content ? "light" : ""}.svg`}
              alt="Filter Icon"
              width={12}
              height={12}
              className={viewFilter && activeSort.column === content ? "scale-110" : ""}
              onClick={() => {
                setActiveSort({ column: content, direction: "" });
                setViewFilter(true);
              }}
            />
          )}
          {viewFilter && activeSort.column === content && <PoolFilter sortBy={content} sortPeriod={sortPeriod} />}
        </div>
      ))}
      <div className="w-1/6"></div>
    </div>
  );
};

export default PoolsListTableHead;