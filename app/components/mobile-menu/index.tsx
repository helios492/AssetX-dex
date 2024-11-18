"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAtom } from "jotai";
import {themeDarkAtom} from "../../utils/store";
import Link from "next/link";
import Image from "next/image";

const menu_items = ["Swap", "Liquidity", "Pools", "More"];

const MobileMenu = () => {
  const [isMenuItemClicked, setMenuItemClicked] = useState(
    "Swap"
  );
  const [isThemeDark] = useAtom(themeDarkAtom);
  const pathname = usePathname();
  useEffect(() => {
    const menuItem = menu_items.find(item => pathname === `/dashboard/${item.toLowerCase()}`);
    if (menuItem) {
      setMenuItemClicked(menuItem);
    }
  }, [pathname]); // Depend on pathname to re-run this effect when it changes

  return (
    <>
      <div className="flex justify-center sm:hidden bottom-0 w-full fixed left-1/2 -translate-x-1/2 py-4 bg-gradient-to-b from-[#d9d9d900] to-[#5e20e5] dark:bg-gradient-to-b dark:from-transparent dark:via-[#FFFFFF] dark:to-[#FFFFFF]">
        <div
          className={`flex sm:hidden flex-row py-1 ${
            isMenuItemClicked === "Swap" ? "pl-1" : "pl-4 pr-1"
          } ${
            isMenuItemClicked === "More" ? "pr-1" : "pr-4 pl-1"
          } bg-[#220068] dark:bg-[#E8E8E8] justify-between gap-3.5 rounded-full`}
        >
          {menu_items.map((item, key) => (
            <div
              key={key}
              className={`flex justify-center items-center rounded-full  ${
                isMenuItemClicked === item
                  ? "bg-gradient-to-b from-[#5100FE] to-[#32009C] px-3.5 py-2"
                  : "bg-transparent"
              } gap-2 cursor-pointer`}
              onClick={() => {
                setMenuItemClicked(item);
              }}
            >
              <Link href={`/dashboard/${item.toLowerCase()}`}>
                <div className="flex justify-center items-center w-8 h-8 rounded-full bg-[#220068] dark:bg-[#E8E8E8]">
                  {isThemeDark ? (
                    <Image
                      src={`/mobile-menu/${item.toLowerCase()}-dark.png`}
                      alt={item}
                      width={24}
                      height={24}
                      className="w-full h-full"
                    />
                  ) : (
                    <Image
                      src={`/mobile-menu/${item.toLowerCase()}.png`}
                      alt={item}
                      width={24}
                      height={24}
                      className="w-full h-full"
                    />
                  )}
                </div>
              </Link>
              {isMenuItemClicked === item ? (
                <p className="font-bold text-white">{item}</p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default MobileMenu;
