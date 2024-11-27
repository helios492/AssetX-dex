"use client";
import Link from "next/link";
import { useState } from "react";
import { useAtom } from "jotai";
import Image from "next/image";
import { isSettingClickedAtom, themeDarkAtom } from "../../utils/store";

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

const More = () => {
  const [isSelected, setSelected] = useState("");
  const [,setIsSettingClicked] = useAtom(isSettingClickedAtom);
  const [themeDark, setThemeDark] = useAtom(themeDarkAtom);
  return (
    <div className="flex flex-col justify-start min-w-[360px] items-center h-screen px-[10%] pt-[27%] pb-[30%] gap-3 text-[var(--text-maincolor)] dark:text-[#120038] overflow-auto">
      <div className="w-full p-0.5  bg-gradient-to-br from-[#5100FE] to-[#B4D2FF] dark:bg-gradient-to-b dark:from-[#5100FE] dark:to-[#5100FE]  rounded-xl">
        <div className="flex flex-col gap-6 w-full h-full px-7 py-6 bg-[#220068] dark:bg-[#E8E8E8] rounded-xl">
          <div className="flex flex-row justify-center items-center gap-3">
            {themeDark ? (
              <Image
                width={36}
                height={36}
                src="/menu/community-dark.png"
                alt="Dark Mode"
              />
            ) : (
              <Image
                width={36}
                height={36}
                src="/menu/community.png"
                alt="Light Mode"
              />
            )}
            <p className="font-bold text-2xl text-[var(--text-maincolor)] dark:text-[#120038] cursor-default">
              Community
            </p>
          </div>
          <div className="flex flex-col justify-center items-center gap-3">
            {community_list.map((item, index) => (
              <Link
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                key={index}
                className={`w-full p-0.5 rounded-xl cursor-pointer
                ${isSelected === item.name
                    ? "bg-gradient-to-r from-[#5F20E5] to-[#32009C] dark:text-[var(--text-maincolor)] text-white "
                    : "bg-gradient-to-br from-[#5100FE] to-[#B4D2FF] dark:bg-gradient-to-t dark:from-[#E8E8E8] text-[var(--text-maincolor)] hover:text-white dark:text-white dark:hover:text-[var(--text-maincolor)]"
                  }`}
                onMouseDown={() => setSelected(item.name)}
                onMouseUp={() => setSelected("")}
              >
                <div className="flex flex-row justify-start items-center gap-3 pl-[25%] py-3 bg-gradient-to-b from-[#5100FE] to-[#32009C] rounded-xl text-lg ">
                  <Image
                    width={30}
                    height={30}
                    src={item.icon}
                    alt={item.name}
                  />
                  <p className="whitespace-nowrap">{item.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="w-full p-0.5 bg-gradient-to-br from-[#5100FE] to-[#B4D2FF] dark:bg-gradient-to-b dark:from-[#5100FE] dark:to-[#5100FE] rounded-xl">
        <div className="flex flex-col gap-5 w-full h-full px-7 py-6 bg-[#220068] dark:bg-[#E8E8E8] rounded-xl">
          <div className="flex flex-row justify-center items-center gap-3 ">
            {themeDark ? (
              <Link
                href="https://docs.asset-x.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-105"
              >
                <Image
                  width={36}
                  height={36}
                  src="/menu/docs-dark.png"
                  alt="Dark Mode"
                />
              </Link>
            ) : (
              <Link
                href="https://docs.asset-x.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-105"
              >
                <Image
                  width={36}
                  height={36}
                  src="/menu/docs.png"
                  alt="Light Mode"
                />
              </Link>
            )}
            <p className="font-bold text-2xl text-[var(--text-maincolor)] dark:text-[#120038] cursor-default">
              Docs
            </p>
          </div>
          <Link
            href="https://docs.asset-x.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-0.5 bg-gradient-to-br from-[#5100FE] to-[#B4D2FF] dark:bg-gradient-to-t dark:from-[#E8E8E8] rounded-xl"
          >
            <div className="w-full h-full flex flex-row justify-center items-center py-3 bg-gradient-to-b from-[#5100FE] to-[#32009C] rounded-xl text-[var(--text-maincolor)] hover:text-fuchsia-50 dark:text-white dark:hover:text-[var(--text-maincolor)] text-lg cursor-pointer">
              <p className="whitespace-nowrap">Read Document</p>
            </div>
          </Link>
        </div>
      </div>
      <div className="w-full p-0.5 bg-gradient-to-br from-[#5100FE] to-[#B4D2FF] dark:bg-gradient-to-b dark:from-[#5100FE] dark:to-[#5100FE] rounded-xl ">
        <div className="flex flex-col gap-4 w-full h-full px-7 py-6 bg-[#220068] dark:bg-[#E8E8E8] rounded-xl">
          <div className="flex flex-row justify-center items-center py-3 gap-3">
            {themeDark ? (
              <div
                className="hover:scale-105"
                onClick={() => setIsSettingClicked(true)}
              >
                <Image
                  width={36}
                  height={36}
                  src="/menu/setting-dark.png"
                  alt="Dark Mode"
                />
              </div>
            ) : (
              <div
                className="hover:scale-105"
                onClick={() => setIsSettingClicked(true)}
              >
                <Image
                  width={36}
                  height={36}
                  src="/menu/setting.png"
                  alt="Light Mode"
                />
              </div>
            )}
            <p className="font-bold text-2xl text-[var(--text-maincolor)] dark:text-[#120038] cursor-default">
              Setting
            </p>
          </div>
          <div className="p-0.5 bg-gradient-to-br from-[#5100FE] to-[#B4D2FF] dark:bg-gradient-to-t dark:from-[#E8E8E8] rounded-xl">
            <div
              className="w-full h-full flex flex-row justify-center items-cente px-16 py-3 bg-gradient-to-b from-[#5100FE] to-[#32009C] rounded-xl text-[var(--text-maincolor)] hover:text-white dark:text-white dark:hover:text-[var(--text-maincolor)] text-lg cursor-pointer"
              onClick={() => setIsSettingClicked(true)}
            >
              <p className=" whitespace-nowrap">Trade Setting</p>
            </div>
          </div>
          <div className="flex flex-row justify-center items-center gap-3 px-4">
            <p className="text-white dark:text-[#120038] text-lg font-bold whitespace-nowrap">
              Dark / Light Mode
            </p>
            <div className="min-w-20 p-0.5 bg-gradient-to-br from-[#5100FE] to-[#B4D2FF] rounded-3xl">
              <div
                className="flex flex-row justify-between dark:justify-end w-full h-full p-1 bg-[#220068] rounded-3xl cursor-pointer"
                onClick={() => setThemeDark(!themeDark)}
              >
                <div className="flex dark:hidden justify-end items-center h-5 w-5 bg-gradient-to-br from-[#5100FE] to-[#B4D2FF] rounded-full ">
                  <div className="h-5 w-5 bg-[#5100FE] rounded-[100%]"></div>
                </div>
                <div className="hidden dark:flex rounded-full justify-end items-center h-5 w-5 bg-gradient-to-b from-[#FED500] to-[#FF8A00] "></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default More;
