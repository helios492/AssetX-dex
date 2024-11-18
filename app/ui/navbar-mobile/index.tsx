"use client";
import Link from "next/link";
import { useEffect, FC, useCallback, useState } from "react";
// import MainButton from "@/app/components/button/main-button";
import dynamic from "next/dynamic";
import { useAtom } from "jotai";
import {
  isConnectWalletAtom,
  isSettingClickedAtom,
  networkModalAtom,
  themeDarkAtom,
} from "@/app/utils/store";
import SettingModal from "@/app/components/mobile/settingModal";
import Image from "next/image";
import { reduceAddress } from "@/app/utils/helper";
import LocalStorage from "@/app/utils/localStorage";
import { WalletAccount } from "@talismn/connect-wallets";
import { handleDisconnect } from "@/app/services/polkadotWalletServices";
import { ActionType, NetworkKeys } from "@/app/types/enum";
import { useAppContext } from "@/app/state/hook";
import NetworkSelectModal from "@/app/components/network-select-modal";

const MainButton = dynamic(
  () => import("@/app/components/button/main-button"),
  {
    ssr: false,
  }
);

const NavBarMobile: FC = () => {
  const { dispatch } = useAppContext();
  const [isConnectWallet, setIsConnectWallet] = useAtom(isConnectWalletAtom);
  const [isSettingClicked, setIsSettingClicked] = useAtom(isSettingClickedAtom);
  const [isThemeDark, setIsThemeDark] = useAtom(themeDarkAtom);
  const [walletAccount, setWalletAccount] = useState<WalletAccount>({} as WalletAccount);
  const walletConnected = LocalStorage.get("wallet-connected");
  const [network, setNetwork] = useState<NetworkKeys>(NetworkKeys.Polkadot);
  const [networkModal, setNetworkModal] = useAtom(networkModalAtom); 
  
  useEffect(() => {
    if (walletConnected?.address) {
      setWalletAccount(walletConnected);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletConnected?.address]);

  const disconnectWallet = useCallback(() => {
    handleDisconnect(dispatch);
    setWalletAccount({} as WalletAccount);
    dispatch({
      type: ActionType.SET_SWAP_GAS_FEES_MESSAGE,
      payload: "",
    });
    dispatch({
      type: ActionType.SET_SWAP_GAS_FEE,
      payload: "",
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Check the user's preferred theme stored in the browser's local storage
  useEffect(() => {
    const themeDark = localStorage.getItem("theme") === "dark";
    if (themeDark) {
      document.documentElement.classList.add("dark");
      setIsThemeDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsThemeDark(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Toggle between dark and light themes based on the value of isThemeDark stored in the browser's local storage.
  useEffect(() => {
    if (isThemeDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isThemeDark]);

  useEffect(() => {
    const network = window.localStorage.getItem("network");
    if (network) {
      setNetwork(network as NetworkKeys);
    }
  }, []);

  return (
    <>
      <div
        className={`${isConnectWallet ? "hidden" : "flex"
          } sm:hidden flex-row justify-between items-center pl-[6%] pr-[3%] pt-[4%] fixed top-0 bg-gradient-to-b from-[#3F055A] via-[#3f055a] to-[#5F20E500] dark:text-white dark:bg-gradient-to-b dark:from-white dark:via-white dark:to-[#FFFFFF00] w-full z-40`}
      >
        <Link
          href="/dashboard/swap"
          className="logo flex flex-row justify-center items-center"
        >
          <Image
            width={128}
            height={64}
            src={`${isThemeDark ? "/logo_dark.png" : "/logo_light.png"}`}
            className="h-14"
            alt="ACX Logo"
          />
        </Link>

        <div className="flex flex-row justify-end items-center gap-[2%]">
          <div
            className=" flex flex-row justify-start dark:justify-end items-center w-12 bg-[#220068] dark:bg-[#310099] rounded-full p-0.5 cursor-pointer"
            onClick={() => setIsThemeDark(!isThemeDark)}
          >
            <div className="block dark:hidden h-5 w-5 bg-[#5100FE] rounded-[100%]"></div>
            <div className="hidden dark:block h-5 w-5 bg-[#ffffff] rounded-[100%]"></div>
          </div>
          <div
            className="w-8 h-8 rounded-full bg-[#220068] dark:bg-gradient-to-b dark:from-[#5100FE] dark:to-[#32009C] p-1 flex justify-center items-center cursor-pointer"
            onClick={() => setIsSettingClicked(true)}
          >
            {isThemeDark ? (
              <Image
                width={24}
                height={24}
                src="/icons/settings-white.png"
                alt="settings"
                className="w-full h-full"
              />
            ) : (
              <Image
                width={24}
                height={24}
                src="/icons/settings.png"
                alt="settings"
                className="w-full h-full"
              />
            )}
          </div>
          <MainButton
            imgURL={`/network-icons/${network}.svg`}
            imgURLDark={`/network-icons/${network}.svg`}
            className="pl-2 py-1 rounded-xl bg-gradient-to-r"
            onClick={() => setNetworkModal(true)}
          />
          {walletConnected ? (
            <div onClick={disconnectWallet}>
              <MainButton
                imgURL="/icons/wallet.png"
                imgURLDark="/icons/wallet-white.png"
                content={
                  <div className="flex flex-col text-gray-300">
                    <div className="font-[500]">{walletAccount?.name || "Account"}</div>
                    <div className="text-small">{reduceAddress(walletAccount?.address, 6, 6)}</div>
                  </div>
                }
                className="pl-2 py-1 rounded-xl bg-gradient-to-r"
              />
            </div>
          ) : (
            <div onClick={() => setIsConnectWallet(true)}>
              <MainButton
                imgURL="/icons/wallet.png"
                imgURLDark="/icons/wallet-white.png"
                content={<div className="text-gray-300 text-wrap">Connect Wallet</div>}
                className="pl-2 py-1 rounded-xl bg-gradient-to-r"
              />
            </div>
          )}
        </div>
      </div>
      {isSettingClicked ? <SettingModal /> : null}
      <NetworkSelectModal />
    </>
  );
};

export default NavBarMobile;
