import { useState } from "react";
import { useAtom } from "jotai";
import { viewFilterAtom, initialPoolInfoAtom } from "../../../utils/store";
import handleArrangeByName from "../../../utils/handleArrangeByName";
import handleArrangeByNumber from "../../../utils/handleArrangeByNumber";
import PoolFilter from "./pool-filter";
import Image from "next/image";
const pool_head_content = ["Volume", "APR"];
const PoolsListTableHeadMobile = ({ sortPeriod }: { sortPeriod: string }) => {
  const [isClickedArrangement, setIsClickedArrangement] = useState("");
  const [isClickedArrangementUp, setIsClickedArrangementUp] = useState(false);
  const [isClickedArrangementDown, setIsClickedArrangementDown] =
    useState(false);
  const [isClickedFilter, setIsClickedFilter] = useState(false);
  const [viewFilter, setViewFilter] = useAtom(viewFilterAtom);
  const [initialPoolInfo, setInitialPoolInfo] = useAtom(initialPoolInfoAtom);
  const arrangeByName = (sortBy: string, direction: string) => {
    const sortedPoolInfo = handleArrangeByName(initialPoolInfo, sortBy, direction);
    if (Array.isArray(sortedPoolInfo)) {
      setInitialPoolInfo(
        sortedPoolInfo.map((pool) =>
          pool.id === 1
            ? {
              ...pool,
              arranged: !pool.arranged,
            }
            : pool
        )
      );
    } else {
      console.error('sortedPoolInfo is undefined or not an array');
    }
  };
  const arrangeByNumber = (sortBy: string, direction: string) => {
    const sortedPoolInfo = handleArrangeByNumber(initialPoolInfo, sortBy, direction);
    if (Array.isArray(sortedPoolInfo)) {
      setInitialPoolInfo(
        sortedPoolInfo.map((pool) =>
          pool.id === 1
            ? {
              ...pool,
              arranged: !pool.arranged,
            }
            : pool
        )
      );
    } else {
      console.error('sortedPoolInfo is undefined or not an array');
    }
  };
  return (
    <div className="flex flex-row w-full justify-between pr-[5%] py-0.5 bg-[#1C0056] dark:bg-white font-bold">
      <div className="flex flex-row justify-start items-center">
        <div className="flex flex-row cursor-pointer gap-0.5 relative">
          <p className="text-[var(--text-maincolor)] dark:text-[#120038] whitespace-nowrap">
            Pool&nbsp;
          </p>
          <div className="flex flex-col justify-center items-center gap-0.5 ">
            {/* Icon for arrange up */}
            <Image
              src={
                isClickedArrangementUp && isClickedArrangement == "Pool"
                  ? "/pools-icon/arrangeuplight.svg"
                  : "/pools-icon/arrangeup.svg"
              }
              width={10}
              height={12}
              alt="Arrange Icon"
              className={`${isClickedArrangementUp &&
                isClickedArrangement == "Pool" &&
                "scale-125"
                }`}
              onMouseDown={() => {
                setIsClickedArrangement("Pool");
                setIsClickedArrangementUp(true);
                arrangeByName("pool", "up");
              }}
              onMouseUp={() => {
                setIsClickedArrangementUp(false);
              }}
            />
            {/* Icon for arrange down */}
            <Image
              src={
                isClickedArrangementDown && isClickedArrangement == "Pool"
                  ? "/pools-icon/arrangeuplight.svg"
                  : "/pools-icon/arrangeup.svg"
              }
              alt="Arrange Icon"
              width={10}
              height={12}
              className={`rotate-180 ${isClickedArrangementDown &&
                isClickedArrangement == "Pool" &&
                "scale-125"
                }`}
              onMouseDown={() => {
                setIsClickedArrangement("Pool");
                setIsClickedArrangementDown(true);
                arrangeByName("pool", "down");
              }}
              onMouseUp={() => {
                setIsClickedArrangementDown(false);
              }}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-row justify-end items-center gap-3">
        {pool_head_content.map((content, idx) => (
          <div
            key={idx}
            className="flex flex-row cursor-pointer gap-0.5 relative"
          >
            <p className="text-[var(--text-maincolor)] dark:text-[#120038] whitespace-nowrap">
              {content}&nbsp;<span>{sortPeriod}&nbsp;</span>
            </p>
            <div className="flex flex-col justify-center items-center gap-0.5 ">
              {/* Icon for arrange up */}
              <Image
                src={
                  isClickedArrangementUp && isClickedArrangement == content
                    ? "/pools-icon/arrangeuplight.svg"
                    : "/pools-icon/arrangeup.svg"
                }
                width={10}
                height={12}
                alt="Arrange Icon"
                className={`${isClickedArrangementUp &&
                  isClickedArrangement == content &&
                  "scale-125"
                  }`}
                onMouseDown={() => {
                  setIsClickedArrangement(content);
                  setIsClickedArrangementUp(true);
                  if (content === "Volume") arrangeByNumber("volume", "up");
                  if (content === "APR") arrangeByNumber("apr", "up");
                }}
                onMouseUp={() => {
                  setIsClickedArrangementUp(false);
                }}
              />
              {/* Icon for arrange down */}
              <Image
                src={
                  isClickedArrangementDown && isClickedArrangement == content
                    ? "/pools-icon/arrangeuplight.svg"
                    : "/pools-icon/arrangeup.svg"
                }
                alt="Arrange Icon"
                width={10}
                height={12}
                className={`rotate-180 ${isClickedArrangementDown &&
                  isClickedArrangement == content &&
                  "scale-125"
                  }`}
                onMouseDown={() => {
                  setIsClickedArrangement(content);
                  setIsClickedArrangementDown(true);
                  if (content === "Volume") arrangeByNumber("volume", "down");
                  if (content === "APR") arrangeByNumber("apr", "down");
                }}
                onMouseUp={() => {
                  setIsClickedArrangementDown(false);
                }}
              />
            </div>
            {/* Icon for filter value */}
            <Image
              src={
                isClickedFilter && isClickedArrangement == content
                  ? "/pools-icon/filterlight.svg"
                  : "/pools-icon/filter.svg"
              }
              alt="Filter Icon"
              width={11}
              height={11}
              className={`${isClickedFilter &&
                isClickedArrangement == content &&
                "scale-125"
                }`}
              onMouseDown={() => {
                setIsClickedArrangement(content);
                setIsClickedFilter(true);
                setViewFilter(true);
              }}
              onMouseUp={() => {
                setIsClickedFilter(false);
              }}
            />
            {viewFilter && isClickedArrangement == content && <PoolFilter sortBy={content} sortPeriod={sortPeriod} />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PoolsListTableHeadMobile;
