"use client";
import { LottieMedium } from "@/app/components/loader";
import { formatDecimalsFromToken } from "@/app/utils/helper";
import LocalStorage from "@/app/utils/localStorage";
import { themeDarkAtom } from "@/app/utils/store";
import { useAtom } from "jotai";
import Image from "next/image";

type TokenSelectionInputProps = {
  tokenText: string;
  tokenBalance?: string;
  tokenId?: string;
  tokenDecimals?: string | undefined;
  disabled?: boolean;
  className?: string;
  tokenIcon?: React.ReactNode;
  tokenValue?: string;
  labelText?: string;
  selectDisabled?: boolean;
  assetLoading?: boolean;
  withdrawAmountPercentage?: number;
  onClick: () => void;
  onSetTokenValue: (value: string) => void;
  onMaxClick?: () => void;
};

const TokenSelectionInput: React.FC<TokenSelectionInputProps> = ({
  labelText,
  tokenText,
  tokenDecimals,
  tokenId,
  tokenValue,
  disabled,
  selectDisabled,
  assetLoading,
  onSetTokenValue,
  tokenBalance,
  onClick,
  onMaxClick
}) => {
  const [themeDark] = useAtom(themeDarkAtom);
  const walletConnected = LocalStorage.get("wallet-connected");

  return (
    <>
      <div className="flex flex-row justify-between w-full px-4 py-4 sm:py-4 bg-[#0F002ED9] rounded-2xl relative  dark:bg-white dark:text-[#120038]">
        <div className="flex flex-col gap-2 w-2/5 sm:w-1/3 pb-2 pr-2">
          <p className="font-medium text-base">
            {labelText}
          </p>
          <button
            disabled={disabled || selectDisabled}
            className="flex flex-row gap-2 justify-start items-center cursor-pointer pr-2 border-r-2  border-[var(--text-maincolor)] dark:border-black"
            onClick={onClick}
          >
            {(disabled && assetLoading) ? (
              <div className="flex w-full mx-auto place-content-center">
                <LottieMedium />
              </div>
            ) : (
              <>
                <div className="flex flex-row justify-center items-center rounded-full bg-gradient-to-r from-[#5100FE] to-[#32009C] p-1">
                  <Image
                    width={32}
                    height={32}
                    src={`/logos/${tokenText}.png`}
                    onError={e => {
                      e.currentTarget.src = "/logos/DOT.png"
                      e.currentTarget.srcset = "/logos/DOT.png"
                    }}
                    alt="Token Logo"
                    className="w-4 h-4 md:w-6 md:h-6 lg:w-8 lg:h-8"
                  />
                </div>
                <p className="font-bold flex-1 text-sm md:text-base">{tokenText}</p>
                {themeDark ? (
                  <Image
                    width={10}
                    height={10}
                    src="/swap-icons/ArrowDownDark.svg"
                    alt="ArrowDown"
                    className="sm:w-2.5 sm:h-2.5"
                  />
                ) : (
                  <Image
                    width={10}
                    height={10}
                    src="/swap-icons/ArrowDownLight.svg"
                    alt="ArrowDown"
                    className="sm:w-2.5 sm:h-2.5 w-2 h-2"
                  />
                )}
              </>
            )}
          </button>
        </div>
        <div className="flex flex-col gap-2 w-2/3 justify-end items-center pb-2 text-sm sm:text-lg">
          <p className="font-medium text-xs md:text-base">
            Balance: {walletConnected && (
              tokenId && tokenText && Number(tokenBalance) !== 0
                ? formatDecimalsFromToken(Number(tokenBalance?.replace(/[, ]/g, "")), tokenDecimals as string)
                : tokenBalance ?? "0"
            )}
          </p>
          <div className="flex flex-row justify-end items-end gap-2">
            <input
              value={tokenValue}
              onChange={e => onSetTokenValue(e.target.value)}
              disabled={disabled}
              placeholder={"0"}
              type="number"
              step={"any"}
              pattern="^\d+(?:\.\d{1,2})?$" 
              className="w-full h-full bg-transparent outline-none text-right text-[#B4D2FF] dark:text-[#1D0058] text-xl font-bold"
            />
            <div
              onClick={onMaxClick}
              className="px-2.5 py-1 bg-[#1D0058] dark:bg-[#8d80ad] rounded-lg cursor-pointer"
            >
              <p className="text-[#64699c] dark:text-white hover:text-[#B4D2FF] dark:hover:text-[#9bc3fe] font-bold cursor-pointer">Max</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TokenSelectionInput;
