import Link from "next/link";
import MainButton from "../button/main-button";
import { useAtom } from "jotai";
import { isConnectWalletAtom, themeDarkAtom } from "../../utils/store";
import Image from "next/image";
import { connectWalletAndFetchBalance } from "@/app/services/polkadotWalletServices";
import { getSupportedWallets } from "@/app/services/polkadotWalletServices";
import { WalletConnectSteps } from "@/app/types/enum";
import { Wallet } from "@talismn/connect-wallets";
import { ModalStepProps } from "@/app/types";
import { useState, useEffect, useCallback } from "react";
import { WalletAccount } from "@talismn/connect-wallets";
import { useAppContext } from "@/app/state/hook";
import dotAcpToast from "@/app/utils/toast";
import { reduceAddress } from "@/app/utils/helper";

const ConnectWalletMobileModal = () => {
  const { state, dispatch } = useAppContext();
  const { api } = state;
  const [isConnectWallet, setIsConnectWallet] = useAtom(isConnectWalletAtom);
  const [isThemeDark] = useAtom(themeDarkAtom);
  const [supportedWallets, setSupportedWallets] = useState<Wallet[]>([] as Wallet[]);
  const [modalStep, setModalStep] = useState<ModalStepProps>({ step: WalletConnectSteps.stepExtensions });
  const [walletAccounts, setWalletAccounts] = useState<WalletAccount[]>([]);

  useEffect(() => {
    const wallets = getSupportedWallets();
    setSupportedWallets(wallets);
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (!isConnectWallet) {
      timeout = setTimeout(() => setModalStep({ step: WalletConnectSteps.stepExtensions }), 1000);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [isConnectWallet]);

  const connectWallet = useCallback(async (account: WalletAccount) => {
    try {
      setIsConnectWallet(false);
      await connectWalletAndFetchBalance(dispatch, api, account);
    } catch (error) {
      dotAcpToast.error(`Error connecting: ${error}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleContinueClick = useCallback((accounts: WalletAccount[]) => {
    setModalStep({ step: WalletConnectSteps.stepAddresses });
    setWalletAccounts(accounts);
  }, []);

  return (
    <>
      <div
        className="h-screen bg-gradient-to-br from-[#2B0281] to-[#220068] dark:bg-gradient-to-b dark:from-[#FFFFFF] dark:to-[#FFFFFF] z-[99] absolute"
      >
        <div className="flex flex-col p-6 bg-gradient-to-br from-[#2B0281] to-[#220068] dark:bg-gradient-to-b dark:from-[#FFFFFF] dark:to-[#FFFFFF] text-[var(--text-maincolor)] dark:text-[#120038] relative">
          <div className="absolute top-5 right-1">
            <div
              className="flex justify-center items-center rounded-full w-12 h-12 text-2xl text-[var(--text-maincolor)] dark:text-[#120038] hover:bg-[#81818165] hover:text-white cursor-pointer"
              onClick={() => setIsConnectWallet(false)}
            >
              X
            </div>
          </div>
          {/* SLIPPAGE TOLERANCE */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-row justify-start items-center whitespace-nowrap px-3 text-lg text-white dark:text-[#120038] font-bold">
              <p>Connect your wallet to &nbsp;</p>{" "}
              <div className="flex flex-row justify-center items-center">
                <Image
                  src={`${isThemeDark ? "/logo_dark.png" : "/logo_light.png"}`}
                  alt="Logo"
                  width={128}
                  height={64}
                  className="h-14"
                />
              </div>
            </div>
            <div className="flex flex-row justify-between items-center bg-[#0F002ED9] dark:bg-[#E8E8E8] rounded-2xl py-2.5 px-3 text-sm font-bold text-[#B4D2FFBF] dark:text-[#120038]">
              <p>
                By connecting your wallet, you acknowledge that you have read,
                understand and accept the terms in the{" "}

                <Link href="https://asset-x.io/disclaimer/" target="_blank" className="text-[#9747FF] dark:text-[#5100FE] hover:underline hover:cursor-pointer">
                  disclaimer
                </Link>
              </p>
            </div>
            <div className="flex flex-wrap justify-between items-center px-2 gap-3">
              {modalStep?.step === WalletConnectSteps.stepExtensions
                ? supportedWallets.map((wallet, index) => (
                  <MainButton
                    key={index}
                    imgURL={wallet.logo.src}
                    imgURLDark={wallet.logo.src}
                    content={
                      <div className="flex flex-row justify-between items-center">
                        {wallet.title}
                        <div className="text-xs font-normal text-gray-300">
                          {wallet.installed ? 'C' : 'D'}
                        </div>
                      </div>}
                    alt={wallet.title}
                    className="pl-6 py-2 rounded-lg bg-gradient-to-r w-full"
                    onClick={async () => {
                      if (wallet.installed) {
                        await wallet?.enable("DOT-ACP");
                        const accounts: WalletAccount[] = await wallet?.getAccounts();
                        handleContinueClick(accounts);
                      } else {
                        console.log(wallet.installUrl);
                        window.open(wallet.installUrl, "_blank");
                      }
                    }}
                  />
                )) : null}
              {modalStep.step === WalletConnectSteps.stepAddresses
                ? walletAccounts?.map((account: WalletAccount, index: any) => {
                  return (
                    <MainButton
                      key={index}
                      index={index}
                      imgURL={account.wallet?.logo.src}
                      imgURLDark={account.wallet?.logo.src}
                      content={
                        <div className="flex flex-col items-start">
                          {account?.name}
                          <div className="text-xs font-normal text-gray-300">
                            {reduceAddress(account?.address, 6, 6)}
                          </div>
                        </div>
                      }
                      className="pl-6 py-1 rounded-lg bg-gradient-to-r"
                      onClick={() => connectWallet(account)}
                    />
                  );
                }) : null}
            </div>
            <div className="flex flex-row justify-center items-center mt-[5vh]">
              <p className="text-center dark:text-[#5100FE] font-bold">
                <Link href="https://docs.asset-x.io/ " className="text-white dark:text-[#120038] hover:cursor-pointer hover:underline">
                  New here?
                </Link>{" "}
                Get started on AssetX!
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConnectWalletMobileModal;
