import Link from "next/link";
import { useAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import { isSettingClickedAtom } from "../../utils/store";
import Image from "next/image";
// Define the interface for the props

const SettingModal = () => {
  const [viewModal, setViewModal] = useAtom(isSettingClickedAtom);
  const ref = useRef<HTMLDivElement>(null);
  const handleClickOutside = (event: any) => {
    if (ref.current && !ref.current?.contains(event.target)) {
      if (viewModal) setViewModal(false);
    }
  };
  const slippage_tolerance = ["0.1%", "0.3%", "0.5%"];
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
    {
      name: "Turbo",
      value: "0.005 DOT",
    },
  ];
  const explorers = [
    { name: "subID", url: "https://sub.id/" },
    { name: "subscan", url: "https://www.subscan.io/" },
    { name: "statescan", url: "https://www.statescan.io/" },
  ];
  const [toleranceState, setToleranceState] = useState("0.3%");
  const [priorityState, setPriorityState] = useState("Normal");
  const [clickedBlockExplorer, setClickedBlockExplorer] = useState("");
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);
  return (
    <>
      <div className="w-screen h-screen absolute top-0 left-0 z-50 bg-black bg-opacity-75" />
      <div
        className="bg-gradient-to-br from-[#5100FE] to-[#B4D2FF] dark:to-[#5100FE] p-[1px] absolute rounded-3xl w-[95vw] z-50 top-[50vh] left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        ref={ref}
      >
        <div className="flex flex-col gap-6 px-9 py-6 bg-[#220068] dark:bg-white text-[var(--text-maincolor)] dark:text-[#5100FE] rounded-3xl relative">
          <div className="absolute top-5 right-5">
            <div
              className="flex justify-center items-center rounded-full w-12 h-12 text-2xl text-[var(--text-maincolor)] dark:text-[#120038] hover:bg-[#81818165] hover:text-white cursor-pointer"
              onClick={() => setViewModal(false)}
            >
              X
            </div>
          </div>
          {/* SLIPPAGE TOLERANCE */}
          <div className="flex flex-col gap-4">
            <div className="text-3xl font-bold text-white dark:text-[#120038]">Settings</div>
            <div className="text-base">SLIPPAGE TOLERANCE</div>
            <div className="flex flex-row justify-between items-center">
              {slippage_tolerance.map((tolerance) => (
                <div
                  key={tolerance}
                  className={` rounded-xl p-[1px] text-[var(--text-maincolor)] dark:text-[#120038] ${
                    toleranceState === tolerance
                      ? "bg-gradient-to-r from-[#e6007b93] to-[#9646ff93]"
                      : "bg-[#0F002ED9] dark:bg-[#E9E9E9] "
                  }`}
                  onClick={() => setToleranceState(tolerance)}
                >
                  <div className=" w-full h-full bg-[#0f002e] dark:bg-[#E9E9E9] rounded-xl px-4 py-1.5 cursor-pointer">
                    <p className=" font-bold">{tolerance}</p>
                  </div>
                </div>
              ))}

              <div className="w-20 h-full bg-[#0f002e] dark:bg-[#E9E9E9] rounded-xl px-4 py-2 cursor-pointer">
                <input
                  className="w-full bg-transparent outline-none text-white text-right font-bold  placeholder:text-[var(--text-maincolor)] dark:placeholder:text-[#120038b5] dark:text-[#120038]"
                  placeholder="0.0%"
                ></input>
              </div>
            </div>
          </div>
          {/* TRANSACTION PRIORITY */}
          <div className="flex flex-col gap-4 w-full">
            <div className="text-base">TRANSACTION PRIORITY</div>
            <div className="flex flex-col gap-3.5 ">
              {trasaction_priority.map((priority) => (
                <div
                  key={priority.name}
                  className={` rounded-xl p-[1px] w-full text-[var(--text-maincolor)] dark:text-[#120038] ${
                    priorityState === priority.name
                      ? "bg-gradient-to-r from-[#e6007b93] to-[#9646ff93]"
                      : "bg-[#0F002ED9] dark:bg-[#E9E9E9]"
                  }`}
                >
                  <div
                    className="flex flex-row justify-between items-center bg-[#0f002e] dark:bg-[#E9E9E9] dark:text-[#5100FE] rounded-xl px-4 py-1.5 "
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
            <div className="flex flex-col gap-3.5 justify-between items-center w-full">
              <div className="flex flex-row justify-between items-center w-full bg-[#0F002ED9] dark:bg-[#E9E9E9] rounded-xl px-4 py-1.5">
                <p>Custom</p>
                <input
                  className="w-full pr-2 bg-transparent outline-none text-right text-white dark:text-[#120038] font-bold placeholder:text-[var(--text-maincolor)] dark:placeholder:text-[#120038bb]"
                  placeholder="0.000"
                  style={{ textAlign: "right" }}
                ></input>
                <p className="text-white dark:text-[#120038] font-bold cursor-pointer">DOT</p>
              </div>
            </div>
          </div>
          {/* DEFAULT EXPLORER */}
          <div className="flex flex-col gap-4 w-full">
            <div className="text-base">DEFAULT EXPLORER</div>
            <div className="flex flex-wrap gap-3.5 justify-between items-center ">
              {explorers.map((explorer) => (
                <Link href={explorer.url} target="_blank" className="w-[45%]" key={explorer.name}>
                  <div
                    className={` rounded-xl p-[1px] w-full text-[var(--text-maincolor)] dark:text-[#120038] ${
                      clickedBlockExplorer === explorer.name
                        ? "bg-gradient-to-r from-[#e6007b93] to-[#9646ff93] text-white"
                        : "bg-[#0F002ED9] dark:bg-[#E9E9E9]  "
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
    </>
  );
};

export default SettingModal;
