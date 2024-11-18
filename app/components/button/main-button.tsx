"use client";
import { useState } from "react";
import { useAtom } from "jotai";
import { themeDarkAtom } from "@/app/utils/store";
import Image from "next/image";

export default function MainButton(props: any) {
  const [isClicked, SetIsClicked] = useState(false);
  const [clickedWhat, SetClickedWhat] = useState("");
  const [isDarkTheme] = useAtom(themeDarkAtom);
  return (
    <button
      disabled={props.disabled}
      id="main-button"
      className={`flex flex-row disabled:opacity-50 items-center cursor-pointer border md:text-xl font-bold pr-2 whitespace-nowrap ${isClicked
          ? "from-[#E6007A] to-[#9746FF] border-white text-white"
          : "hover:from-[#3800AE] hover:to-[#210068] from-[#5200FF] to-[#310099] border-[#7BB0FF] text-[var(--text-maincolor)] dark:bg-gradient-to-b dark:from-[#5100FE] dark:to-[#32009C] dark:text-white"
        } ${props.className ? props.className : ""}`}
      onMouseDown={() => {
        SetClickedWhat(props.content);
        SetIsClicked(true);
      }}
      onMouseUp={() => {
        SetIsClicked(false);
        SetClickedWhat("");
      }}
      onClick={props.onClick}
    >
      {props.imgURL && isDarkTheme && props.content !== "Show Chart" ? (
        <Image
          width={24}
          height={24}
          src={
            clickedWhat === "Fearless"
              ? "/logos/fearless-white.png"
              : props.imgURLDark
          }
          className="w-6 h-6 sm:h-10 sm:w-10"
          alt="Icon"
        />
      ) : null}
      {props.imgURL && !isDarkTheme && props.content !== "Show Chart" ? (
        <Image
          width={28}
          height={28}
          src={
            clickedWhat === "Fearless"
              ? "/logos/fearless-white.png "
              : props.imgURL
          }
          className="w-7 h-7 sm:h-10 sm:w-10"
          alt="Icon"
        />
      ) : null}
      &nbsp;
      {props.content}
      &nbsp;
      {props.imgURL && isDarkTheme && props.content === "Show Chart" ? (
        <Image width={14} height={14} src="/icons/expand.svg" alt="Icon" className="w-3.5 h-3.5 sm:h-10 sm:w-10" />
      ) : null}
      {props.imgURL && !isDarkTheme && props.content === "Show Chart" ? (
        <Image width={14} height={14} src="/icons/expand.png" alt="Icon" className="w-3.5 h-3.5 sm:h-10 sm:w-10" />
      ) : null}
    </button>
  );
}
