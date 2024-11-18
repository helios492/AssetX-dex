"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAtom } from "jotai";
import { viewModalAtom } from "../../utils/store";
import Image from "next/image";

const SideBarButton = (props: any) => {
  const { id, name, icon, href, clickedIcon } = props;
  const pathname = usePathname();
  const [isClickedOnSideBarItem, setIsClickedOnSideBarItem] = useState("");
  const [viewModal, setViewModal] = useAtom(viewModalAtom);

  return (
    <div
      className={`flex flex-row justify-center lg:justify-between items-center rounded-xl px-2.5 w-full h-20 bg-transparent cursor-pointer hover:bg-[rgb(27,3,85) ]
        ${
          pathname === href &&
          "bg-gradient-to-r from-[#220068] to-[#310099] dark:bg-gradient-to-r dark:from-[#E9E9E9] dark:to-[#d3d3d3] sidebar-shadow-down-black"
        } 
        ${
          viewModal === name && isClickedOnSideBarItem === name
            ? "bg-gradient-to-br from-[#3F055A] via-[#310099] to-[#5F20E5] dark:bg-gradient-to-r dark:from-[#E9E9E9] dark:to-[#d3d3d3] sidebar-shadow-down-black"
            : null
        }
        ${isClickedOnSideBarItem === "Settings" && null}
      )`}
      onMouseDown={() => {
        setViewModal(name);
        setIsClickedOnSideBarItem(name);
      }}
      onMouseUp={() => {
        setIsClickedOnSideBarItem("");
        if (viewModal === "Docs") setViewModal("");
      }}
    >
      <div className="flex flex-row justify-center items-center">
        <Image
          key={id}
          src={
            isClickedOnSideBarItem === name && viewModal === name
              ? clickedIcon
              : icon
          }
          width={48}
          height={48}
          alt={name}
        />
        <p
          className={`hidden lg:block text-xl font-bold text-[var(--text-maincolor)] dark:text-[#120038] ${
            name === "Farming" || name === "Mint" ? "opacity-25" : ""
          }`}
        >
          &nbsp;&nbsp;{name}
        </p>
      </div>
      {/* Arrow right*/}
      {name === "Settings" || name === "Community" || name === "Docs" ? (
        <div className="justify-center items-center hidden xl:block">
          <Image
            src={"/sidebar-icons/arrow.png"}
            alt={name}
            width={12}
            height={20}
            color="var(--text-maincolor)"
          />
        </div>
      ) : null}

    </div>
  );
};

const links_up = [
  {
    id: 1,
    name: "Swap",
    href: "/dashboard/swap",
    icon: "/sidebar-icons/Swap.png",
    clickedIcon: "/sidebar-icons/SwapRed.png",
  },
  {
    id: 2,
    name: "Liquidity",
    href: "/dashboard/liquidity",
    icon: "/sidebar-icons/Liquidity.png",
    clickedIcon: "/sidebar-icons/LiquidityRed.png",
  },
  {
    id: 3,
    name: "Pools",
    href: "/dashboard/pools",
    icon: "/sidebar-icons/Pools.png",
    clickedIcon: "/sidebar-icons/PoolsRed.png",
  },
  {
    id: 4,
    name: "Farming",
    href: "/",
    icon: "/sidebar-icons/Farming.png",
    clickedIcon: "/sidebar-icons/Farming.png",
  },
  {
    id: 5,
    name: "Mint",
    href: "/",
    icon: "/sidebar-icons/Mint.png",
    clickedIcon: "/sidebar-icons/Mint.png",
  },
];
const links_down = [
  {
    id: 1,
    name: "Settings",
    href: "/",
    icon: "/sidebar-icons/Settings.png",
    clickedIcon: "/sidebar-icons/SettingsRed.png",
  },
  {
    id: 2,
    name: "Community",
    href: "/",
    icon: "/sidebar-icons/Community.png",
    clickedIcon: "/sidebar-icons/CommunityRed.png",
  },
  {
    id: 3,
    name: "Docs",
    href: "https://docs.asset-x.io/",
    icon: "/sidebar-icons/Docs.png",
    clickedIcon: "/sidebar-icons/DocsRed.png",
  },
];
export default function SideBarLinks() {
  return (
    <>
      {/* up links like swap, liquidity and pools */}
      <div className="flex flex-col gap-1.5">
        {links_up.map((link) => {
          const LinkIcon = link.icon;
          const ClickedLinkIcon = link.clickedIcon;
          return (
            <Link key={link.id} href={link.href}>
              <SideBarButton
                key={link.id}
                id={link.id}
                name={link.name}
                href={link.href}
                icon={LinkIcon}
                clickedIcon={ClickedLinkIcon}
              />
            </Link>
          );
        })}
      </div>
      {/* horizontal line */}
      <div className="flex justify-center py-8">
        <hr
          className="w-4/5"
          style={{ borderColor: "var(--text-maincolor)" }}
        />
      </div>
      {/* down links likes settings, community and docs */}
      <div className="flex flex-col justify-start gap-1.5">
        {links_down.map((link) => {
          const LinkIcon = link.icon;
          const ClickedIcon = link.clickedIcon;
          return (
            <Link key={link.id} href={link.href} target="_blank">
              <SideBarButton
                key={link.id}
                id={link.id}
                name={link.name}
                icon={LinkIcon}
                clickedIcon={ClickedIcon}
              />
            </Link>
          );
        })}
      </div>
    </>
  );
}
