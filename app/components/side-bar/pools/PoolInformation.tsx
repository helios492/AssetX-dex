import { useEffect, useState } from "react";
import Tooltip from "@/app/components/tooltip";
import Link from "next/link";
import Image from "next/image";
import { LpTokenAsset, Token } from "@/app/types";
import { useRouter, useSearchParams } from "next/navigation";
import { getAssetTokenFromNativeToken, getNativeTokenFromAssetToken} from "@/app/services/tokenServices";
import axios from "axios";
import { useAppContext } from "@/app/state/hook";
import { calculateSlippageReduce, formatDecimalsFromToken, formatInputTokenValue } from "@/app/utils/helper";
import { getPoolReserves } from "@/app/services/poolServices";
import { useAtom } from "jotai";
import { slippageValueAtom } from "@/app/utils/store";
import Decimal from "decimal.js";

interface PoolSelectionProps {
  tokenPair: string;
  nativeToken: Token;
  assetToken: Token;
  lpTokenAsset: LpTokenAsset | null;
  assetTokenId: string;
  lpTokenId: string | null;
  nativeTokens: string;
  assetTokens: string;
  nativeTokenPrice: string;
  assetTokenPrice: string;
  usdcPrice: string;
}

type TokenValueProps = {
  tokenValue: string;
};

const PoolInformation: React.FC<PoolSelectionProps> = ({
  tokenPair,
  nativeToken,
  assetToken,
  lpTokenAsset,
  assetTokenId,
  lpTokenId,
  nativeTokens,
  assetTokens,
  nativeTokenPrice,
  assetTokenPrice,
  usdcPrice
}) => {
  const router = useRouter();
  const [liquidity, setLiquidity] = useState<string>("0");
  const [isClickedAddliquidityButton, SetIsClickedAddliquidityButton] =
    useState(false);
  const [isClickedRemoveLiquidityButton, SetIsClickedRemoveLiquidityButton] =
    useState(false);
  const [isClickedSwapButton, SetIsClickedSwapButton] = useState(false);
  const [slippageValue, setSlippageValue] = useAtom(slippageValueAtom);
  const { state, dispatch } = useAppContext();
  const { api, selectedAccount} = state;
  const [selectedTokenNativeValue, setSelectedTokenNativeValue] = useState<TokenValueProps>();
  const [selectedTokenAssetValue, setSelectedTokenAssetValue] = useState<TokenValueProps>();


const getLiquidity = async () => {
  console.log("usdcPrice", nativeTokenPrice, assetTokenPrice, selectedTokenNativeValue?.tokenValue, selectedTokenAssetValue?.tokenValue);  
    const liquidity = ((Number(nativeTokenPrice || 0) * Number(selectedTokenNativeValue?.tokenValue)) + (Number(assetTokenPrice || 0) * Number(selectedTokenAssetValue?.tokenValue))).toString();
    setLiquidity(parseFloat(liquidity).toFixed(2));
  }

  const getNativeAndAssetTokensFromPool = async () => {
    if (api) {
      const res: any = await getPoolReserves(api, assetTokenId);
      const lpTokenTotalAsset: any = await api.query.poolAssets.asset(lpTokenId);

      const lpTotalAssetSupply = lpTokenTotalAsset.toHuman()?.supply?.replace(/[, ]/g, "");

      const lpTokenUserAccount = await api.query.poolAssets.account(
        lpTokenId,
        selectedAccount?.address
      );

      const lpTokenUserAsset = lpTokenUserAccount.toHuman() as LpTokenAsset;
      const lpTokenUserAssetBalance = parseInt(lpTokenUserAsset?.balance?.replace(/[, ]/g, ""));

      
      if (res && slippageValue) {
        const nativeTokenInPool = new Decimal(res[0]?.replace(/[, ]/g, ""));
        const nativeTokenOut = nativeTokenInPool
        .mul(new Decimal(lpTokenUserAssetBalance).toNumber())
        .dividedBy(new Decimal(lpTotalAssetSupply).toNumber())
        .floor();
        
        const assetInPool = new Decimal(res[1]?.replace(/[, ]/g, ""));
        const assetOut = assetInPool
        .mul(new Decimal(lpTokenUserAssetBalance).toNumber())
        .dividedBy(new Decimal(lpTotalAssetSupply).toNumber())
        .floor();
        
        console.log("nativeToken?.decimals", nativeToken?.decimals)
        setSelectedTokenNativeValue({
          tokenValue: formatDecimalsFromToken(nativeTokenOut, nativeToken?.decimals),
        });

        setSelectedTokenAssetValue({
          tokenValue: formatDecimalsFromToken(assetOut, assetToken?.decimals),
        });
      }
    }
  };

  useEffect(()=>{
    if(lpTokenId !== null){
      getNativeAndAssetTokensFromPool();
    }
  },[lpTokenId]);

  const share = parseFloat((Number(selectedTokenNativeValue?.tokenValue)/Number(nativeTokens) * 100).toString()).toFixed(5)
  
  useEffect(() => {
    if(selectedTokenAssetValue && selectedTokenNativeValue && usdcPrice){
      getLiquidity();
    }

  }, [selectedTokenAssetValue, selectedTokenNativeValue, usdcPrice]);

const handleSwap = ({nativeToken, assetToken}:{nativeToken:Token, assetToken:Token}) => {
  router.push(`/dashboard/swap/?tokenA=${nativeToken.symbol}&tokenB=${assetToken.symbol}`)
}

const onWithdrawClick = () => {
  router.push(`/dashboard/liquidity?id=${assetTokenId}&lp=${lpTokenId}`)
}

  return (
    <div className="flex flex-row justify-between items-center w-full bg-[#18004A] dark:bg-[#E9E9E9] dark:border dark:border-white rounded-b-xl px-9 py-4">
      {/* Your Liquidity Amount */}
      <div className="w-1/7 py-4">
        <p>Your Liquidiy</p>
        <p className="text-white dark:text-[#5100FE] font-bold">{liquidity === "NaN" ? "- -" : "$" + liquidity}</p>
        <p>{lpTokenAsset?.balance ? lpTokenAsset.balance?.replace(/[, ]/g, "") : 0} LP</p>
      </div>

      <div className="w-1/7" />
      <div className="w-1/7 py-4">
        <p>Assets Pooled</p>
        <p className="font-bold text-white dark:text-[#5100FE]">{parseFloat(nativeTokens).toFixed(3)} {nativeToken.symbol}</p>
        <p className="font-bold text-white dark:text-[#5100FE]">{parseFloat(assetTokens).toFixed(3)} {assetToken.symbol}</p>
      </div>
      <div className="w-1/7" />
      <div className="w-1/7 py-4 ">
        <p>Your share</p>
        <p className="text-white dark:text-[#5100FE] font-bold">{isNaN(Number(share)) ? 0 : share}%</p>
        <p className="text-transparent">Amount </p>
      </div>
      <div className="w-1/7 flex flex-row justify-end items-center self-center">
        <div className="px-2">
          <Link href={`/dashboard/liquidity/?id=${assetTokenId}`}>
            <div
              className={`rounded-md border border-[#B4D2FF] px-7 py-2 whitespace-nowrap font-bold cursor-pointer dark:text-white ${
                isClickedAddliquidityButton
                  ? "text-white bg-gradient-to-r from-[#E6007A] to-[#9746FF]"
                  : "bg-gradient-to-b from-[#5100FE] to-[#32009C]  hover:from-[#1C0057] hover:to-[#1A0050] "
              }`}
              onMouseDown={() => SetIsClickedAddliquidityButton(true)}
              onMouseUp={() => SetIsClickedAddliquidityButton(false)}
            >
              Add Liquidity
            </div>
          </Link>
        </div>
        <Tooltip content="Farm" direction="top">
          <Image
            src="/sidebar-icons/Farming.png"
            width={40}
            height={40}
            className="w-10 h-10 cursor-pointer"
            alt="farming"
          />
        </Tooltip>
        <Tooltip content="Remove Liquidity" direction="top">
          <Image
            src={`${
              isClickedRemoveLiquidityButton
                ? "/sidebar-icons/SubtractLight.png"
                : "/sidebar-icons/SubtractDark.png"
            }`}
            width={40}
            height={40}
            className="w-10 h-10 cursor-pointer"
            alt="subtract"
            onMouseEnter={() => SetIsClickedRemoveLiquidityButton(true)}
            onMouseLeave={() => SetIsClickedRemoveLiquidityButton(false)}
            onClick={() => onWithdrawClick()}
          />
        </Tooltip>
        <Tooltip content="Swap" direction="top">
          <Image
            src={`${
              isClickedSwapButton
                ? "/sidebar-icons/SwapLight.png"
                : "/sidebar-icons/SwapDark.png"
            }`}
            width={40}
            height={40}
            className="w-10 h-10 cursor-pointer"
            alt="swapdark"
            onMouseEnter={() => SetIsClickedSwapButton(true)}
            onMouseLeave={() => SetIsClickedSwapButton(false)}
            onClick={()=>handleSwap({nativeToken, assetToken})}
          />
        </Tooltip>
      </div>
    </div>
  );
};

export default PoolInformation;
