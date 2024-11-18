import { useAtom } from "jotai";
import { viewModalAtom } from "../../../utils/store";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

const community_list = [
  {
    name: "X (Twitter)",
    icon: "/sidebar-icons/community-modal/twitter.png",
    href: "https://x.com/DOTAssetX",
  },
  {
    name: "Discord",
    icon: "/sidebar-icons/community-modal/discord.png",
    href: "https://discord.gg/rhQtprMSMr",
  },
  {
    name: "Telegram",
    icon: "/sidebar-icons/community-modal/telegram.png",
    href: "https://t.me/DotAssetX",
  },
  {
    name: "Github",
    icon: "/sidebar-icons/community-modal/github.png",
    href: "https://github.com/AssetXdot",
  },
];

const Community = () => {
  const [viewModal, setViewModal] = useAtom(viewModalAtom);
  const ref = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: any) => {
    if (ref.current && !ref.current?.contains(event.target)) {
      if (viewModal) setViewModal("");
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);

  const [isSelected, setIsSelected] = useState("");
  return (
    <div>
      {/* Black Background */}
      <div className=" bg-black bg-opacity-75 fixed top-0 left-0 w-full h-full z-50" />
      {/* Main Container */}
      <div
        className="bg-gradient-to-br from-[#5100FE]  to-[#B4D2FF] dark:to-[#5100FE] p-0.5 absolute rounded-[50px] bottom-[15%] left-0 z-50 w-[300px]"
        ref={ref}
      >
        <div className="flex flex-col gap-6 px-5 py-10 bg-gradient-to-br from-[#2B0281] to-[#220068] dark:from-[#E9E9E9] dark:to-[#E9E9E9] text-[var(--text-maincolor)] dark:text-[#120038] rounded-[50px] relative ">
          <div className="absolute top-5 right-5">
            <div
              className="flex justify-center items-center rounded-full w-12 h-12 text-2xl text-[var(--text-maincolor)] dark:text-[#120038] hover:bg-[#81818165] hover:text-white cursor-pointer"
              onClick={() => setViewModal("")}
            >
              X
            </div>
          </div>
          {/* Community */}
          <div className="flex flex-col gap-4 ">
            <div className="text-base px-3">COMMUNITY</div>
            <div className="flex flex-col gap-2 justify-between items-center">
              {community_list.map((item, index) => (
                <>
                  <Link
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex flex-row justify-start items-center self-center pl-[5%] py-3 gap-4 w-full rounded-xl text-white hover:bg-[#32009C] ${
                      isSelected === item.name
                        ? "bg-gradient-to-r from-[#5F20E5] to-[#32009C]"
                        : "dark:bg-gradient-to-b dark:from-[#5F20E5] dark:to-[#32009C]"
                    }`}
                    key={index}
                    onMouseDown={() => setIsSelected(item.name)}
                    onMouseUp={() => setIsSelected("")}
                  >
                    <Image
                      src={item.icon}
                      alt={item.name}
                      width={24}
                      height={24}
                    />
                    <p>{item.name}</p>
                  </Link>
                </>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;
