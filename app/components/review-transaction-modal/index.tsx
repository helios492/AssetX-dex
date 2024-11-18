import { InputEditedType, TransactionTypes } from "@/app/types/enum";
import { FC, useRef } from "react";
import Image from "next/image";
import MainButton from "@/app/components/button/main-button";
interface SwapSelectTokenModalProps {
  open: boolean;
  title: string;
  inputValueA: string;
  inputValueB: string;
  priceImpact?: string;
  tokenValueA?: string;
  tokenValueB?: string;
  tokenValueASecond?: string;
  tokenValueBSecond?: string;
  tokenSymbolA?: string;
  tokenSymbolB?: string;
  inputType?: string;
  showAll?: boolean;
  transactionType: TransactionTypes;
  onClose: () => void;
  onConfirmTransaction: () => void;
}

const ReviewTransactionModal: FC<SwapSelectTokenModalProps> = ({
  open,
  title,
  inputValueA,
  inputValueB,
  priceImpact,
  tokenValueA,
  tokenValueB,
  tokenValueASecond,
  tokenValueBSecond,
  tokenSymbolA,
  tokenSymbolB,
  inputType,
  showAll,
  transactionType,
  onClose,
  onConfirmTransaction,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  if (!open) return null;
  return (
    <>
      <div className="w-screen h-screen fixed top-0 left-0 z-50 bg-black bg-opacity-75" />
      <div
        className="flex justify-center items-center bg-gradient-to-br from-[#5100FE] to-[#5100FE] dark:from-[#cab4fa] dark:to-[#5100FE] p-0.5 absolute rounded-3xl self-center z-50 sm:w-[546px] w-[95%] left-1/2 -translate-x-1/2 top-[10%] sm:top-[15%]"
        ref={ref}>
        <div className="flex flex-col gap-6 w-full px-4 sm:px-9 py-5 sm:py-10 bg-gradient-to-br from-[#2B0281] to-[#220068] dark:from-[#E8E8E8] dark:to-[#E8E8E8] text-[var(--text-maincolor)] dark:text-[#120038] rounded-3xl relative ">
          <div className="absolute top-5 right-5">
            <div
              className="flex justify-center items-center rounded-full w-12 h-12 text-2xl text-[var(--text-maincolor)] dark:text-[#120038] hover:bg-[#81818165] hover:text-white cursor-pointer"
              onClick={onClose}
            >
              X
            </div>
          </div>
          <div className="flex flex-col gap-4 sm:gap-8">
            <div className="flex flex-wrap justify-start items-center whitespace-nowrap text-2xl text-white dark:text-[#120038]">
              <p>{title}</p>
            </div>
            <div className="flex w-full flex-col gap-5">
              <div className="flex flex-col items-start">
                <div className="text-base text-[#b4d2ff7c] dark:text-[#120038] font-bold">
                  {transactionType === TransactionTypes.add && ""}
                  {transactionType === TransactionTypes.swap && "You pay"}
                  {transactionType === TransactionTypes.withdraw && "Withdrawal amount"}
                  {transactionType === TransactionTypes.createPool && "You pay"}
                </div>
                <span className="flex w-full items-center justify-between font-unbounded-variable text-2xl text-white dark:text-[#120038]">
                  <div className="flex overflow-y-auto">{inputValueA}</div>
                  <Image
                    src={tokenSymbolA ? `/logos/${tokenSymbolA}.png` : "/logos/DOT.png"}
                    onError={e => {
                      e.currentTarget.src = "/logos/DOT.png"
                      e.currentTarget.srcset = "/logos/DOT.png"
                    }}
                    alt="token"
                    width={24}
                    height={24}
                  />
                </span>
              </div>
              <div className="flex flex-col items-start">
                <div className="text-base text-[#b4d2ff7c] dark:text-[#120038] font-bold">
                  {transactionType === TransactionTypes.add && ""}
                  {transactionType === TransactionTypes.swap && "You receive"}
                  {transactionType === TransactionTypes.withdraw && "Withdrawal amount"}
                  {transactionType === TransactionTypes.createPool && "You pay"}
                </div>
                <span className="flex w-full items-center justify-between gap-6 font-unbounded-variable text-2xl text-white dark:text-[#120038]">
                  <div className="flex overflow-y-auto">{inputValueB}</div>
                  <Image
                    src={tokenSymbolB ? `/logos/${tokenSymbolB}.png` : "/logos/DOT.png"}
                    onError={e => {
                      e.currentTarget.src = "/logos/DOT.png"
                      e.currentTarget.srcset = "/logos/DOT.png"
                    }}
                    alt="token"
                    width={24}
                    height={24}
                  />
                </span>
              </div>
              {transactionType !== TransactionTypes.createPool && (
                <>
                  <hr className="flex flex-row justify-center items-center self-center w-full border-[#b4d2ff7e] dark:border-[#32009C]" />
                  <div className="flex flex-col">
                    <div className="flex justify-between">
                      <span className="text-base text-[#b4d2ff7c] dark:text-[#120038] font-bold">Price impact</span>
                      <span className="text-base text-[#b4d2ff7c] dark:text-[#120038] font-bold">{priceImpact}%</span>
                    </div>
                    {showAll ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-base text-[#b4d2ff7c] dark:text-[#120038] font-bold">Expected output</span>
                          <span className="text-base text-[#b4d2ff7c] dark:text-[#120038] font-bold">
                            {tokenValueA} {tokenSymbolA}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-base text-[#b4d2ff7c] dark:text-[#120038] font-bold">Minimum output</span>
                          <span className="text-base text-[#b4d2ff7c] dark:text-[#120038] font-bold">
                            {tokenValueB} {tokenSymbolA}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-base text-[#b4d2ff7c] dark:text-[#120038] font-bold">Expected output</span>
                          <span className="text-base text-[#b4d2ff7c] dark:text-[#120038] font-bold">
                            {tokenValueASecond} {tokenSymbolB}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-base text-[#b4d2ff7c] dark:text-[#120038] font-bold">Minimum output</span>
                          <span className="text-base text-[#b4d2ff7c] dark:text-[#120038] font-bold">
                            {tokenValueBSecond} {tokenSymbolB}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <span className="text-base text-[#b4d2ff7c] dark:text-[#120038] font-bold">
                            {inputType == InputEditedType.exactIn ? "Expected output" : "Expected input"}
                          </span>
                          <span className="text-base text-[#b4d2ff7c] dark:text-[#120038] font-bold">
                            {tokenValueA} {tokenSymbolA}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-base text-[#b4d2ff7c] dark:text-[#120038] font-bold">
                            {inputType === InputEditedType.exactIn ? "Minimum output" : "Maximum input"}
                          </span>
                          <span className="text-base text-[#b4d2ff7c] dark:text-[#120038] font-bold">
                            {tokenValueB} {tokenSymbolB}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
              <div className="flex flex-col">
                <MainButton
                  onClick={onConfirmTransaction}
                  className="justify-center text-lg py-1.5 rounded-md sm:rounded-xl bg-gradient-to-r"
                  content={
                    <>
                      Confirm {transactionType === TransactionTypes.add && "Deposit"}
                      {transactionType === TransactionTypes.swap && "Swap"}
                      {transactionType === TransactionTypes.createPool && "Deposit"}
                      {transactionType === TransactionTypes.withdraw && "Withdraw"}
                    </>
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ReviewTransactionModal;