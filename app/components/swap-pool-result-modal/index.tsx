import useGetNetwork from "@/app/hooks/useGetNetwork";
import { useAppContext } from "@/app/state/hook";
import Modal from "@/app/components/modal";
import { FC } from "react";
import TokenIcon from "../token-icon";

interface SwapPoolResultModalProps {
  open: boolean;
  contentTitle: string;
  tokenA: {
    value?: string | null;
    symbol: string;
  };
  tokenB: {
    value?: string | null;
    symbol: string;
  };
  actionLabel: string;
  onClose: () => void;
}

const SwapPoolResultModal: FC<SwapPoolResultModalProps> = ({
  open,
  contentTitle,
  tokenA,
  tokenB,
  actionLabel,
  onClose,
}) => {
  const { assethubSubscanUrl, nativeTokenSymbol } = useGetNetwork();
  const { state } = useAppContext();
  const { blockHashFinalized } = state;

  if (!open) return null;

  return (
    <Modal isOpen={open} title={contentTitle} onClose={onClose}>
      <div className="flex min-w-[427px] flex-col">
          <div className="font-unbounded-variable text-heading-6">{contentTitle}</div>
          <div className="my-8 flex flex-col items-center justify-center gap-3">
            <div className="flex items-center justify-center gap-2 font-unbounded-variable">
              <TokenIcon token={tokenA.symbol} width={24} height={24} /> {tokenA.symbol}
              <TokenIcon token={tokenB.symbol} width={24} height={24} /> {tokenB.symbol}
            </div>
            <div className="flex w-full justify-center text-gray-200">
              <div>{actionLabel}</div>
            </div>
            <div className="flex items-center justify-center gap-2 font-unbounded-variable text-medium">
              <TokenIcon token={tokenA.symbol} width={24} height={24} /> {tokenA.value} {tokenA.symbol}  <TokenIcon token={tokenB.symbol} width={24} height={24} /> {tokenB.value} {tokenB.symbol}
            </div>
          </div>
          <div className="flex flex-row items-center justify-center gap-1 font-unbounded-variable text-medium underline">
            <a
              href={`${assethubSubscanUrl}/block${nativeTokenSymbol == "WND" ? "s" : ""}/${blockHashFinalized}`}
              target="_blank"
              rel="noreferrer"
            >
              View in block explorer
            </a>
          </div>
        </div>
    </Modal>
  )
}

export default SwapPoolResultModal;