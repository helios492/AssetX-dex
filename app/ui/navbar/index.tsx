"use client";
import { reduceAddress } from "@/app/utils/helper";
import LocalStorage from "@/app/utils/localStorage";
import { WalletAccount } from "@talismn/connect-wallets";
import { useAtom } from "jotai";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
// import  from "@/app/components/button/main-button";
import dynamic from "next/dynamic";
import { isConnectWalletAtom, networkModalAtom, themeDarkAtom } from "@/app/utils/store";
import { handleDisconnect } from "@/app/services/polkadotWalletServices";
import { useAppContext } from "@/app/state/hook";
import { ActionType, NetworkKeys } from "@/app/types/enum";
import Image from "next/image";
import NetworkSelectModal from "@/app/components/network-select-modal";

const MainButton = dynamic(
  () => import("@/app/components/button/main-button"),
  {
    ssr: false,
  }
);

export default function NavBar() {
  const { dispatch } = useAppContext();
  const [, setIsConnectWallet] = useAtom(isConnectWalletAtom);
  const [isThemeDark, setIsThemeDark] = useAtom(themeDarkAtom);
  const [walletAccount, setWalletAccount] = useState<WalletAccount>({} as WalletAccount);
  const walletConnected = LocalStorage.get("wallet-connected");
  const [, setNetworkModal] = useAtom(networkModalAtom);
  const [network, setNetwork] = useState<NetworkKeys>(NetworkKeys.Polkadot);

  useEffect(() => {
    if (walletConnected?.address) {
      setWalletAccount(walletConnected);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletConnected?.address]);

  useEffect(() => {
    const network = window.localStorage.getItem("network");
    if (network) {
      setNetwork(network as NetworkKeys);
    }
  }, []);

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

  return (
    <>
      <div className="sm:flex hidden h-[90px] flex-row justify-between items-center pl-[7%] pr-[3%] py-5 sm:bg-[#220068] dark:sm:bg-white navbar-shadow-down-black z-30">
        <Link
          href="/dashboard/swap"
          className="logo flex flex-row justify-center items-center"
        >
          <Image
            width={128}
            height={64}
            src={`${isThemeDark ? "/logo_dark.png" : "/logo_light.png"}`}
            alt="ACX Logo"
            className="h-16"
          />
        </Link>
        <div className="text-gray-300 text-center">
          <p> DEX Under Construction - Enjoy the Testnet</p>
          <p>Get WND Tokens from Faucet here : <a href="https://faucet.polkadot.io/westend?parachain=1000" className="hover:text-blue-400">https://faucet.polkadot.io/westend?parachain=1000</a></p>
        </div>

        <div className="flex flex-row justify-end items-center gap-4">
          <div
            className=" flex flex-row justify-start dark:justify-end items-center w-12 bg-[#070068] dark:bg-[#310099] rounded-full p-0.5 cursor-pointer"
            onClick={() => setIsThemeDark(!isThemeDark)}
          >
            <div className="block dark:hidden h-5 w-5 bg-[#5100FE] rounded-[100%]"></div>
            <div className="hidden dark:block h-5 w-5 bg-[#ffffff] rounded-[100%]"></div>
          </div>
          <MainButton
            imgURL={`/network-icons/${network}.svg`}
            imgURLDark={`/network-icons/${network}.svg`}
            content={
              <div className="flex flex-col pl-2 text-gray-300">
                <div className="font-[500]">{network}</div>
              </div>
            }
            className="pl-2 rounded-xl py-2 bg-gradient-to-r"
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
                content="Connect Wallet"
                className="pl-2 py-1 rounded-xl bg-gradient-to-r"
              />
            </div>
          )}
        </div>
      </div>
      <NetworkSelectModal />
    </>
  );
}
