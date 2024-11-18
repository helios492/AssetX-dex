import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import MainButton from "../button/main-button";
import { useAtom } from "jotai";
import useClickOutside from "../../hooks/useClickOutside";
import { isConnectWalletAtom, themeDarkAtom } from "../../utils/store";
import Image from "next/image";
import { connectWalletAndFetchBalance, getSupportedWallets } from "@/app/services/polkadotWalletServices";
import { Wallet, WalletAccount } from "@talismn/connect-wallets";
import { ModalStepProps } from "@/app/types";
import { WalletConnectSteps } from "@/app/types/enum";
import { useAppContext } from "@/app/state/hook";
import dotAcpToast from "@/app/utils/toast";

const ConnectWalletModal = () => {
  const ref = useRef<HTMLDivElement>(null);
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

  useClickOutside(ref, () => {
    if (isConnectWallet) setIsConnectWallet(false);
  });


  return (
    <div className="w-screen h-screen fixed top-0 left-0 z-50 bg-black bg-opacity-75">
      <div
        className="flex justify-center items-center bg-gradient-to-br from-[#5100FE] to-[#5100FE] p-0.5 absolute rounded-[50px] self-center z-50 w-[600px] left-1/2 -translate-x-1/2 top-1/4"
        ref={ref}
      >
        <div className="flex flex-col gap-6 px-5 py-10 bg-gradient-to-br from-[#2B0281] to-[#220068] dark:from-white dark:to-white text-[var(--text-maincolor)] dark:text-[#120038] rounded-[50px] relative ">
          <div className="absolute top-5 right-5">
            <div
              className="flex justify-center items-center rounded-full w-12 h-12 text-2xl text-[var(--text-maincolor)] dark:text-[#120038] hover:bg-[#81818165] hover:text-white cursor-pointer"
              onClick={() => setIsConnectWallet(false)}
            >
              X
            </div>
          </div>
          {/* SLIPPAGE TOLERANCE */}
          <div className="flex flex-col gap-4 ">
            <div className="flex flex-wrap justify-start items-center whitespace-nowrap px-3 text-3xl text-white dark:text-[#120038] font-bold">
              <p>Connect your wallet to &nbsp;</p>{" "}
              <Image alt="light" src={`${isThemeDark ? "/logo_dark.png" : "/logo_light.png"}`} width={96} height={46} />
            </div>
            <div className="flex flex-row justify-between items-center bg-[#0F002ED9] rounded-2xl p-4 text-base font-bold text-[#B4D2FFBF]">
              <p>
                By connecting your wallet, you acknowledge that you have read,
                understand and accept the terms in the{" "}
                <Link href="https://asset-x.io/disclaimer/" target="_blank" className="text-[#ffffffba] hover:underline hover:cursor-pointer">
                  Disclaimer
                </Link>
              </p>
            </div>
            <div className="flex flex-wrap justify-between items-center gap-3">
              {modalStep?.step === WalletConnectSteps.stepExtensions
                ? supportedWallets.map((wallet, index) => (
                  <div className="w-[48%]" key={index}>
                    <MainButton
                      imgURL={wallet.logo.src}
                      imgURLDark={wallet.logo.src}
                      content={
                        <div className="flex flex-row justify-between items-center w-full">
                          <div className="text-lg font-bold">
                            {wallet.title}
                          </div>
                          <div className="text-xs font-normal ml-auto text-gray-300">
                            {wallet.installed ? '🔗' : '⬇'}
                          </div>
                        </div>}
                      alt={wallet.title}
                      className="pl-6 py-1 rounded-lg bg-gradient-to-r w-full"
                      onClick={async () => {
                        if (wallet.installed) {
                          await wallet?.enable("DOT-ACP");
                          const accounts: WalletAccount[] = await wallet?.getAccounts();
                          handleContinueClick(accounts);
                        } else {
                          window.open(wallet.installUrl, "_blank");
                        }
                      }}
                    />
                  </div>
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
                            {account?.address}
                          </div>
                        </div>}
                      className="pl-6 py-1 rounded-lg bg-gradient-to-r"
                      onClick={() => connectWallet(account)}
                    />
                  );
                }) : null}
            </div>
            <hr className="flex flex-row justify-center items-center self-center w-[75px]" />
            <div className="flex flex-row justify-center items-center font-bold">
              <p>
                <Link href="https://docs.asset-x.io/ " target="_blank" className="text-white dark:text-[#120038b0] hover:cursor-pointer hover:underline dark:hover:text-[#120038]">
                  New here?
                </Link>{" "}
                Get started on AssetX!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectWalletModal;