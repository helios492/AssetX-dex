import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAtom } from "jotai";
import { slippageValueAtom, viewModalAtom } from "@/app/utils/store";
import Image from "next/image";
const Settings = () => {
  const [viewModal, setViewModal] = useAtom(viewModalAtom);
  const ref = useRef<HTMLDivElement>(null);
  const handleClickOutside = (event: any) => {
    if (ref.current && !ref.current?.contains(event.target)) {
      if (viewModal) setViewModal("");
    }
  };
  const slippage_tolerance = ["0.1", "0.3", "0.5"];
  const trasaction_priority = [
    {
      name: "Auto",
      value: "Dynamic",
    },
    {
      name: "Normal",
      value: "0 DOT",
    },
    {
      name: "High",
      value: "0.00005 DOT",
    },
  ];
  const explorers = [
    { name: "subID", url: "https://sub.id/" },
    { name: "subscan", url: "https://www.subscan.io/" },
    { name: "statescan", url: "https://www.statescan.io/" },
  ];
  const [slippageValue, setSlippageValue] = useAtom(slippageValueAtom);
  const [priorityState, setPriorityState] = useState("Normal");
  const [clickedBlockExplorer, setClickedBlockExplorer] = useState("");
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);
  
  return (
    <div className="fixed top-0 left-0 w-full h-full z-50 flex justify-center items-center">
      <div className="absolute bg-black bg-opacity-75 w-full h-full" />
      <div
        className="bg-gradient-to-br from-[#5100FE] to-[#B4D2FF] dark:from-[#5100FE] dark:to-[#5100FE] p-0.5 rounded-[50px] z-50"
        ref={ref}
      >
        <div className="flex flex-col gap-6 px-9 py-10 bg-gradient-to-br from-[#2B0281] to-[#220068] dark:from-[#FFF] dark:to-[#FFFFFF] text-[var(--text-maincolor)] dark:text-[#120038] rounded-[50px] relative">
          <div className="absolute top-5 right-5">
            <div
              className="flex justify-center items-center rounded-full w-12 h-12 text-2xl text-[var(--text-maincolor)] dark:text-[#120038] hover:bg-[#81818165] hover:text-white cursor-pointer"
              onClick={() => setViewModal("")}
            >
              X
            </div>
          </div>
          {/* SLIPPAGE TOLERANCE */}
          <div className="flex flex-col gap-4">
            <div className="text-base dark:text-[#32009C]">SLIPPAGE TOLERANCE</div>
            <div className="flex flex-row gap-24 justify-between items-center">
              {slippage_tolerance.map((tolerance) => (
                <div
                  key={tolerance}
                  className={` rounded-xl p-[1px] ${slippageValue === Number(tolerance)
                      ? "bg-gradient-to-r from-[#e6007b93] to-[#9646ff93] text-white dark:text-black"
                      : "bg-[#0F002ED9] dark:bg-[#E9E9E9] text-[var(--text-maincolor)] dark:text-[#120038]"
                    }`}
                  onClick={() => setSlippageValue(Number(tolerance))}
                >
                  <div className=" w-full h-full bg-[#0f002e]  dark:bg-[#E9E9E9] rounded-xl px-4 py-1.5 cursor-pointer">
                    <p className=" font-bold">{tolerance}%</p>
                  </div>
                </div>
              ))}

              <div className="w-20 h-full bg-[#0f002e] dark:bg-[#E9E9E9] rounded-xl px-4 py-2 cursor-pointer">
                <input
                  className="text-white font-bold bg-transparent outline-none placeholder:text-[var(--text-maincolor)] dark:placeholder:text-[#12003896] dark:text-[#120038]"
                  placeholder="0.0%"
                  onChange={(e)=>setSlippageValue(Number(e.target.value))}
                ></input>
              </div>
            </div>
          </div>
          {/* TRANSACTION PRIORITY */}
          <div className="flex flex-col gap-4 w-full">
            <div className="text-base dark:text-[#32009C]">TRANSACTION PRIORITY</div>
            <div className="flex flex-row  gap-3.5 ">
              {trasaction_priority.map((priority) => (
                <div
                  key={priority.name}
                  className={` rounded-xl p-[1px] w-full text-[var(--text-maincolor)] dark:text-[#5100FE] ${priorityState === priority.name
                      ? "bg-gradient-to-r from-[#e6007b93] to-[#9646ff93] "
                      : "bg-[#0F002ED9] dark:bg-[#E9E9E9]"
                    }`}
                >
                  <div
                    className="flex flex-row justify-between items-center bg-[#0f002e] dark:bg-[#E9E9E9] rounded-xl px-4 py-1.5 "
                    onClick={() => setPriorityState(priority.name)}
                  >
                    <p>{priority.name}</p>
                    <p className="text-white dark:text-[#120038] font-bold cursor-pointer">
                      {priority.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-row gap-3.5 justify-between items-center">
              <div
                className={` rounded-xl w-1/3 p-[1px] text-[var(--text-maincolor)] dark:text-[#5100FE] ${priorityState === "0.005 DOT"
                    ? "bg-gradient-to-r from-[#e6007b93] to-[#9646ff93]"
                    : "bg-[#0F002ED9] dark:bg-[#E9E9E9]"
                  }`}
              >
                <div
                  className="flex flex-row justify-between items-center bg-[#0f002e] dark:bg-[#E9E9E9] w-full h-full rounded-xl px-4 py-1.5 "
                  onClick={() => setPriorityState("0.005 DOT")}
                >
                  <p>Turbo</p>
                  <p className="text-white dark:text-[#120038] font-bold cursor-pointer">
                    0.005 DOT
                  </p>
                </div>
              </div>
              <div className="flex flex-row justify-between items-center bg-[#0F002ED9] dark:bg-[#E9E9E9] dark:text-[#5100FE] rounded-xl px-4 py-1.5 w-2/3">
                <p>Custom</p>
                <input
                  className="w-full pr-2 bg-transparent outline-none text-white font-bold text-right placeholder:text-[#dfd0ff67] dark:placeholder:text-[#120038af] dark:text-[#120038]"
                  placeholder="0.0"
                  style={{ textAlign: "right" }}
                ></input>
                <p>DOT</p>
              </div>
            </div>
          </div>
          {/* DEFAULT EXPLORER */}
          <div className="flex flex-col gap-4 w-full">
            <div className="text-base dark:text-[#32009C]">DEFAULT EXPLORER</div>
            <div className="flex flex-row gap-3.5 justify-between items-center">
              {explorers.map((explorer) => (
                <Link href={explorer.url} target="_blank" className="w-full" key={explorer.name}>
                  <div
                    className={`rounded-xl p-[1px] w-full ${clickedBlockExplorer === explorer.name
                        ? "bg-gradient-to-r from-[#e6007b93] to-[#9646ff93] text-white"
                        : "bg-[#0F002ED9] dark:bg-[#E9E9E9] text-[var(--text-maincolor)] dark:text-[#120038]"
                      }`}
                    onMouseOver={() => {
                      setClickedBlockExplorer(explorer.name);
                      console.log("clickedBlockexplorer");
                    }}
                    onMouseLeave={() => setClickedBlockExplorer("")}
                  >
                    <div className="flex flex-row justify-center items-center bg-[#0f002e] dark:bg-[#E9E9E9] rounded-xl px-4 py-1.5 gap-2 cursor-pointer">
                      <Image
                        width={22}
                        height={22}
                        alt={explorer.name}
                        src={`/sidebar-icons/settings-modal/${explorer.name}.png`}
                      />
                      <p className="text-white dark:text-[#120038] font-bold">
                        {explorer.name.charAt(0).toUpperCase() +
                          explorer.name.slice(1)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
