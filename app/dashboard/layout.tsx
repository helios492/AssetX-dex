"use client";
import ConnectWalletModal from "@/app/components/connectwallet";
import ConnectWalletMobileModal from "@/app/components/connectwallet-mobile";
import MobileMenu from "@/app/components/mobile-menu";
import Community from "@/app/components/side-bar/community/community";
import Settings from "@/app/components/side-bar/settings/settings";
import NavBarMobile from "@/app/ui/navbar-mobile";
import { isConnectWalletAtom, viewModalAtom } from "@/app/utils/store";
import { useAtom } from "jotai";
import Image from "next/image";
import { isMobile } from "react-device-detect";

export default function DashboardLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  const [isConnectWallet] = useAtom(isConnectWalletAtom);
  const [viewModal] = useAtom(viewModalAtom);
  return (
    <>
      <div className="sticky top-[90px] flex-col justify-center items-center w-full rounded-none xl:rounded-tl-3xl min-w-[360px] bg-gradient-to-br from-[#3F055A] via-[#310099] to-[#5F20E5] dark:bg-gradient-to-t dark:from-white dark:to-white sm:box-shadow-inner">
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
          <Image
            width={1200}
            height={600}
            src={"/background.png"}
            alt="Background Logo"
            className="opacity-30 scale-[1.8]"
          />
        </div>
        <div className="text-[var(--text-maincolor)] dark:text-[#120038] w-full relative">
          <NavBarMobile />
          {isConnectWallet && isMobile ? <ConnectWalletMobileModal /> : null}
          {isConnectWallet && !isMobile ? <ConnectWalletModal /> : null}
          {viewModal === "Settings" && <Settings />}
          {viewModal === "Community" && <Community />}
          {!isConnectWallet && <MobileMenu />}
          {children}
        </div>
      </div>
    </>
  );
}
