/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import ShowChartModal from "@/app/components/side-bar/swap/show-chart-modal/showChartModal";
import {
  availablePoolTokenAAtom,
  availablePoolTokenBAtom,
  isShowChartModalAtom,
  selectedTokensAtom,
  showSelectTokenModalAtom,
  tokenSwapOrderAtom,
} from "@/app/utils/store";
import TokenSelectionInput from "@/app/components/side-bar/swap/token-selection-input";
import Image from "next/image";
import { useAtom } from "jotai";
import Link from "next/link";
import MainButton from "@/app/components/button/main-button";
import TokenPriceGraph from "@/app/components/side-bar/swap/token-price-graph";
import TokenPriceGraphMobile from "@/app/components/side-bar/swap/token-price-graph-mobile";
import { useEffect, useMemo, useState } from "react";
import { InputEditedProps, PoolCardProps, TokenDecimalsErrorProps, TokenProps } from "@/app/types";
import { ActionType, InputEditedType, TokenPosition, TokenSelection, TransactionTypes } from "@/app/types/enum";
import { useAppContext } from "@/app/state/hook";
import useGetNetwork from "@/app/hooks/useGetNetwork";
import Decimal from "decimal.js";
import { calculateSlippageAdd, calculateSlippageReduce, convertToBaseUnit, formatDecimalsFromToken, formatInputTokenValue } from "@/app/utils/helper";
import { checkSwapAssetForAssetExactInGasFee, checkSwapAssetForAssetExactOutGasFee, checkSwapNativeForAssetExactInGasFee, checkSwapNativeForAssetExactOutGasFee, swapAssetForAssetExactIn, swapAssetForAssetExactOut, swapNativeForAssetExactIn, swapNativeForAssetExactOut } from "@/app/services/swapServices";
import { getAssetTokenAFromAssetTokenB, getAssetTokenBFromAssetTokenA, getAssetTokenFromNativeToken, getNativeTokenFromAssetToken, PriceCalcType, sellMax, SellMaxToken } from "@/app/services/tokenServices";
import { createPoolCardsArray, getPoolReserves } from "@/app/services/poolServices";
import { setTokenBalanceAfterAssetsSwapUpdate, setTokenBalanceUpdate } from "@/app/services/polkadotWalletServices";
import SelectTokenModal from "@/app/components/selectToken";
import { LottieMedium } from "@/app/components/loader";
import ReviewTransactionModal from "@/app/components/review-transaction-modal";
import WarningMessage from "@/app/components/warning-message";
import SwapPoolResultModal from "@/app/components/swap-pool-result-modal";

type TokenValueProps = {
  tokenValue: string;
};

type TokenValueSlippageProps = {
  tokenValue: string;
};

type TokenSelectedProps = {
  tokenSelected: TokenPosition;
};

export default function Swap() {
  const [switchTokensEnabled, setSwitchTokensEnabled] = useAtom(tokenSwapOrderAtom);
  const [showChartModal] = useAtom(isShowChartModalAtom);
  const [showSelectTokenModal, setShowSelectTokenModal] = useAtom(showSelectTokenModalAtom);
  const { state, dispatch } = useAppContext();
  const { nativeTokenSymbol } = useGetNetwork();

  const {
    tokenBalances,
    poolsTokenMetadata,
    pools,
    api,
    selectedAccount,
    swapFinalized,
    swapGasFeesMessage,
    swapGasFee,
    swapLoading,
    poolsCards,
    swapExactInTokenAmount,
    swapExactOutTokenAmount,
    assetLoading,
    isTokenCanNotCreateWarningSwap,
  } = state;

  const [selectedTokens, setSelectedTokens] = useAtom(selectedTokensAtom);

  const [inputEdited, setInputEdited] = useState<InputEditedProps>({ inputType: InputEditedType.exactIn });
  const [selectedTokenAValue, setSelectedTokenAValue] = useState<TokenValueProps>({ tokenValue: "" });
  const [selectedTokenBValue, setSelectedTokenBValue] = useState<TokenValueProps>({ tokenValue: "" });
  const [tokenAValueForSwap, setTokenAValueForSwap] = useState<TokenValueSlippageProps>({
    tokenValue: "0",
  });
  const [tokenBValueForSwap, setTokenBValueForSwap] = useState<TokenValueSlippageProps>({
    tokenValue: "0",
  });
  const [slippageValue, setSlippageValue] = useState<number>(15);
  const [walletHasEnoughNativeToken, setWalletHasEnoughNativeToken] = useState<boolean>(false);
  const [availablePoolTokenA, setAvailablePoolTokenA] = useAtom(availablePoolTokenAAtom);
  const [availablePoolTokenB, setAvailablePoolTokenB] = useAtom(availablePoolTokenBAtom);
  const [tokenSelected, setTokenSelected] = useState<TokenSelectedProps>({ tokenSelected: TokenPosition.tokenA });
  const [assetTokensInPool, setAssetTokensInPool] = useState<string>("");
  const [nativeTokensInPool, setNativeTokensInPool] = useState<string>("");
  const [liquidityLow, setLiquidityLow] = useState<boolean>(false);
  const [lowTradingMinimum, setLowTradingMinimum] = useState<boolean>(false);
  const [lowMinimalAmountAssetToken, setLowMinimalAmountAssetToken] = useState<boolean>(false);
  const [minimumBalanceAssetToken, setMinimumBalanceAssetToken] = useState<string>("0");
  const [swapSuccessfulReset, setSwapSuccessfulReset] = useState<boolean>(false);
  const [tooManyDecimalsError, setTooManyDecimalsError] = useState<TokenDecimalsErrorProps>({
    tokenSymbol: "",
    isError: false,
    decimalsAllowed: 0,
  });

  const [isTransactionTimeout, setIsTransactionTimeout] = useState<boolean>(false);
  const [reviewModalOpen, setReviewModalOpen] = useState<boolean>(false);
  const [waitingForTransaction, setWaitingForTransaction] = useState<NodeJS.Timeout>();
  const [priceImpact, setPriceImpact] = useState<string>("");
  const [assetBPriceOfOneAssetA, setAssetBPriceOfOneAssetA] = useState<string>("");

  const [isMaxValueLessThenMinAmount, setIsMaxValueLessThenMinAmount] = useState<boolean>(false);

  const nativeToken = {
    tokenId: "",
    assetTokenMetadata: {
      symbol: tokenBalances?.tokenSymbol as string,
      name: tokenBalances?.tokenSymbol as string,
      decimals: tokenBalances?.tokenDecimals as string,
    },
    tokenAsset: {
      balance: tokenBalances?.balance,
    },
  };

  const tokenADecimal = new Decimal(selectedTokenAValue.tokenValue || 0);
  const tokenBDecimal = new Decimal(selectedTokenBValue.tokenValue || 0);

  const handleSwapNativeForAssetGasFee = async () => {
    const tokenA = formatInputTokenValue(tokenAValueForSwap.tokenValue, selectedTokens.tokenA.decimals);
    const tokenB = formatInputTokenValue(tokenBValueForSwap.tokenValue, selectedTokens.tokenB.decimals);
    if (api) {
      if (inputEdited.inputType === InputEditedType.exactIn) {
        await checkSwapNativeForAssetExactInGasFee(
          api,
          selectedTokens.tokenA.tokenSymbol === nativeTokenSymbol
            ? selectedTokens.tokenB.tokenId
            : selectedTokens.tokenA.tokenId,
          selectedAccount,
          tokenA,
          tokenB,
          false,
          dispatch
        );
      }
      if (inputEdited.inputType === InputEditedType.exactOut) {
        await checkSwapNativeForAssetExactOutGasFee(
          api,
          selectedTokens.tokenA.tokenSymbol === nativeTokenSymbol
            ? selectedTokens.tokenB.tokenId
            : selectedTokens.tokenA.tokenId,
          selectedAccount,
          tokenA,
          tokenB,
          false,
          dispatch
        );
      }
    }
  };

  const handleSwapAssetForAssetGasFee = async () => {
    const tokenA = formatInputTokenValue(tokenAValueForSwap.tokenValue, selectedTokens.tokenA.decimals);
    const tokenB = formatInputTokenValue(tokenBValueForSwap.tokenValue, selectedTokens.tokenB.decimals);
    if (api) {
      if (inputEdited.inputType === InputEditedType.exactIn) {
        await checkSwapAssetForAssetExactInGasFee(
          api,
          selectedTokens.tokenA.tokenId,
          selectedTokens.tokenB.tokenId,
          selectedAccount,
          tokenA,
          tokenB,
          dispatch
        );
      }
      if (inputEdited.inputType === InputEditedType.exactOut) {
        await checkSwapAssetForAssetExactOutGasFee(
          api,
          selectedTokens.tokenA.tokenId,
          selectedTokens.tokenB.tokenId,
          selectedAccount,
          tokenA,
          tokenB,
          dispatch
        );
      }
    }
  };

  const getPriceOfAssetTokenFromNativeToken = async (value: string, inputType: string) => {
    if (api) {
      const valueWithDecimals = formatInputTokenValue(
        value,
        selectedTokens?.tokenA?.tokenSymbol === nativeTokenSymbol
          ? selectedTokens.tokenA.decimals
          : selectedTokens.tokenB.decimals
      );

      const assetTokenPrice = await getAssetTokenFromNativeToken(
        api,
        selectedTokens?.tokenA?.tokenSymbol === nativeTokenSymbol
          ? selectedTokens?.tokenB?.tokenId
          : selectedTokens?.tokenA?.tokenId,
        valueWithDecimals
      );

      if (assetTokenPrice) {
        setLowTradingMinimum(assetTokenPrice === "0");
        const assetTokenNoSemicolons = assetTokenPrice.toString()?.replace(/[, ]/g, "");
        const assetTokenNoDecimals = formatDecimalsFromToken(
          parseFloat(assetTokenNoSemicolons),
          selectedTokens?.tokenA?.tokenSymbol === nativeTokenSymbol
            ? selectedTokens.tokenB.decimals
            : selectedTokens.tokenA.decimals
        );

        const assetTokenWithSlippage =
          inputType === InputEditedType.exactIn
            ? calculateSlippageReduce(assetTokenNoDecimals, slippageValue)
            : calculateSlippageAdd(assetTokenNoDecimals, slippageValue);

        if (inputType === InputEditedType.exactIn) {
          setTokenAValueForSwap({ tokenValue: value });
          setTokenBValueForSwap({ tokenValue: assetTokenWithSlippage });
          setSelectedTokenBValue({ tokenValue: assetTokenNoDecimals.toString() });
        } else if (inputType === InputEditedType.exactOut) {
          setTokenAValueForSwap({ tokenValue: assetTokenWithSlippage });
          setTokenBValueForSwap({ tokenValue: value });
          setSelectedTokenAValue({ tokenValue: assetTokenNoDecimals.toString() });
        }
      }
    }
  };

  const getPriceOfNativeTokenFromAssetToken = async (value: string, inputType: string) => {
    if (api) {
      const valueWithDecimals = formatInputTokenValue(
        value,
        selectedTokens?.tokenA?.tokenSymbol === nativeTokenSymbol
          ? selectedTokens.tokenB.decimals
          : selectedTokens.tokenA.decimals
      );

      const nativeTokenPrice = await getNativeTokenFromAssetToken(
        api,
        selectedTokens?.tokenA?.tokenSymbol === nativeTokenSymbol
          ? selectedTokens?.tokenB?.tokenId
          : selectedTokens?.tokenA.tokenId,
        valueWithDecimals
      );

      if (nativeTokenPrice) {
        setLowTradingMinimum(nativeTokenPrice === "0");
        const nativeTokenNoSemicolons = nativeTokenPrice.toString()?.replace(/[, ]/g, "");
        const nativeTokenNoDecimals = formatDecimalsFromToken(
          parseFloat(nativeTokenNoSemicolons),
          selectedTokens?.tokenA?.tokenSymbol === nativeTokenSymbol
            ? selectedTokens.tokenA.decimals
            : selectedTokens.tokenB.decimals
        );

        const nativeTokenWithSlippage =
          inputType === InputEditedType.exactIn
            ? calculateSlippageReduce(nativeTokenNoDecimals, slippageValue)
            : calculateSlippageAdd(nativeTokenNoDecimals, slippageValue);

        if (tokenBalances?.balance) {
          if (inputType === InputEditedType.exactIn) {
            setTokenAValueForSwap({ tokenValue: value });
            setTokenBValueForSwap({ tokenValue: nativeTokenWithSlippage });
            setSelectedTokenBValue({ tokenValue: nativeTokenNoDecimals.toString() });
          } else if (inputType === InputEditedType.exactOut) {
            setTokenAValueForSwap({ tokenValue: nativeTokenWithSlippage });
            setTokenBValueForSwap({ tokenValue: value });
            setSelectedTokenAValue({ tokenValue: nativeTokenNoDecimals.toString() });
          }
        }
      }
    }
  };

  const getPriceOfAssetTokenAFromAssetTokenB = async (value: string) => {
    if (api) {
      const valueWithDecimals = formatInputTokenValue(value, selectedTokens.tokenB.decimals);
      if (selectedTokens.tokenA.tokenId && selectedTokens.tokenB.tokenId) {
        const assetTokenPrice = await getAssetTokenAFromAssetTokenB(
          api,
          valueWithDecimals,
          selectedTokens.tokenA.tokenId,
          selectedTokens.tokenB.tokenId
        );
        if (assetTokenPrice) {
          setLowTradingMinimum(assetTokenPrice === "0");
          const assetTokenNoSemicolons = assetTokenPrice.toString()?.replace(/[, ]/g, "");
          const assetTokenNoDecimals = formatDecimalsFromToken(assetTokenNoSemicolons, selectedTokens.tokenA.decimals);
          const assetTokenWithSlippage = calculateSlippageAdd(assetTokenNoDecimals, slippageValue);

          setTokenAValueForSwap({ tokenValue: assetTokenWithSlippage });
          setTokenBValueForSwap({ tokenValue: value });
          setSelectedTokenAValue({ tokenValue: assetTokenNoDecimals });
        }
      }
    }
  };

  const getPriceOfAssetTokenBFromAssetTokenA = async (value: string) => {
    if (api) {
      const valueWithDecimals = formatInputTokenValue(value, selectedTokens.tokenA.decimals);
      if (selectedTokens.tokenA.tokenId && selectedTokens.tokenB.tokenId) {
        const assetTokenPrice = await getAssetTokenBFromAssetTokenA(
          api,
          valueWithDecimals,
          selectedTokens.tokenA.tokenId,
          selectedTokens.tokenB.tokenId
        );

        if (assetTokenPrice) {
          setLowTradingMinimum(assetTokenPrice === "0");
          const assetTokenNoSemicolons = assetTokenPrice.toString()?.replace(/[, ]/g, "");
          const assetTokenNoDecimals = formatDecimalsFromToken(
            parseFloat(assetTokenNoSemicolons),
            selectedTokens.tokenB.decimals
          );

          const assetTokenWithSlippage = calculateSlippageReduce(assetTokenNoDecimals, slippageValue);

          setTokenAValueForSwap({ tokenValue: value });
          setTokenBValueForSwap({ tokenValue: assetTokenWithSlippage });
          setSelectedTokenBValue({ tokenValue: assetTokenNoDecimals.toString() });
        }
      }
    }
  };

  const tokenAValue = async (value?: string) => {
    if (value) {
      value = new Decimal(value).toFixed();

      if (value.includes(".")) {
        if (value.split(".")[1].length > parseInt(selectedTokens.tokenA.decimals)) {
          setTooManyDecimalsError({
            tokenSymbol: selectedTokens.tokenA.tokenSymbol,
            isError: true,
            decimalsAllowed: parseInt(selectedTokens.tokenA.decimals),
          });
          return;
        }
      }

      setTooManyDecimalsError({
        tokenSymbol: "",
        isError: false,
        decimalsAllowed: 0,
      });

      setSelectedTokenAValue({ tokenValue: value });
      setInputEdited({ inputType: InputEditedType.exactIn });

      if (selectedTokens.tokenA.tokenSymbol === nativeTokenSymbol) {
        getPriceOfAssetTokenFromNativeToken(value, InputEditedType.exactIn);
      } else if (selectedTokens.tokenB.tokenSymbol === nativeTokenSymbol) {
        getPriceOfNativeTokenFromAssetToken(value, InputEditedType.exactIn);
      } else {
        getPriceOfAssetTokenBFromAssetTokenA(value);
      }
    } else {
      setSelectedTokenAValue({ tokenValue: "" });
      setSelectedTokenBValue({ tokenValue: "" });
    }
  };

  const tokenBValue = async (value?: string) => {
    if (value) {
      value = new Decimal(value).toFixed();

      if (value.includes(".")) {
        if (value.split(".")[1].length > parseInt(selectedTokens.tokenB.decimals)) {
          setTooManyDecimalsError({
            tokenSymbol: selectedTokens.tokenB.tokenSymbol,
            isError: true,
            decimalsAllowed: parseInt(selectedTokens.tokenB.decimals),
          });
          return;
        }
      }

      setTooManyDecimalsError({
        tokenSymbol: "",
        isError: false,
        decimalsAllowed: 0,
      });

      setSelectedTokenBValue({ tokenValue: value });
      setInputEdited({ inputType: InputEditedType.exactOut });

      if (selectedTokens.tokenA.tokenSymbol === nativeTokenSymbol) {
        getPriceOfNativeTokenFromAssetToken(value, InputEditedType.exactOut);
      } else if (selectedTokens.tokenB.tokenSymbol === nativeTokenSymbol) {
        getPriceOfAssetTokenFromNativeToken(value, InputEditedType.exactOut);
        if (tokenBalances?.balance) {
          const fee = convertToBaseUnit(swapGasFee);
          const balanceMinusFee = new Decimal(tokenBalances.balance).minus(fee);
          setWalletHasEnoughNativeToken(new Decimal(value).lte(balanceMinusFee));
        }
      } else {
        getPriceOfAssetTokenAFromAssetTokenB(value);
      }
    } else {
      setSelectedTokenAValue({ tokenValue: "" });
      setSelectedTokenBValue({ tokenValue: "" });
    }
  };

  const getSwapButtonProperties = useMemo(() => {
    const tokenBalanceDecimal = new Decimal(tokenBalances?.balance || 0);
    if (tokenBalances?.assets) {
      if (selectedTokens.tokenA.tokenSymbol === "" || selectedTokens.tokenB.tokenSymbol === "") {
        return { label: "Select token", disabled: true };
      }
      if (
        tokenADecimal.lte(0) ||
        tokenBDecimal.lte(0) ||
        selectedTokenAValue?.tokenValue === "" ||
        selectedTokenBValue?.tokenValue === ""
      ) {
        return { label: "Enter amount", disabled: true };
      }
      if (selectedTokens.tokenA.tokenSymbol === nativeTokenSymbol && tokenADecimal.gt(tokenBalanceDecimal)) {
        return {
          label: `Insufficient ${nativeTokenSymbol}`,
          disabled: true,
        };
      }
      if (Number(tokenBValueForSwap.tokenValue) < 1 && selectedTokens.tokenB.decimals === "0") {
        return {
          label: `${selectedTokens.tokenB.tokenSymbol} amount too low - slippage impact`,
          disabled: true,
        };
      }
      if (
        selectedTokens.tokenA.tokenSymbol !== nativeTokenSymbol &&
        tokenADecimal.gt(
          formatDecimalsFromToken(
            selectedTokens.tokenA.tokenBalance.replace(/[, ]/g, ""),
            selectedTokens.tokenA.decimals
          )
        )
      ) {
        return {
          label: `Insufficient ${selectedTokens.tokenA.tokenSymbol} amount`,
          disabled: true,
        };
      }
      if (
        selectedTokens.tokenB.tokenSymbol === nativeTokenSymbol &&
        nativeTokensInPool &&
        tokenBDecimal.gt(nativeTokensInPool)
      ) {
        return {
          label: `Insufficient ${selectedTokens.tokenB.tokenSymbol} liquidity in pool`,
          disabled: true,
        };
      }
      if (
        selectedTokens.tokenB.tokenSymbol !== nativeTokenSymbol &&
        assetTokensInPool &&
        tokenBDecimal.gt(assetTokensInPool)
      ) {
        return {
          label: `Insufficient ${selectedTokens.tokenB.tokenSymbol} liquidity in pool`,
          disabled: true,
        };
      }
      if (
        selectedTokens.tokenA.tokenSymbol === nativeTokenSymbol &&
        tokenADecimal.lt(tokenBalanceDecimal) &&
        !tooManyDecimalsError.isError
      ) {
        return { label: "Swap", disabled: false };
      }
      if (
        selectedTokens.tokenA.tokenSymbol !== nativeTokenSymbol &&
        selectedTokens.tokenB.tokenSymbol !== nativeTokenSymbol &&
        tokenADecimal.gt(0) &&
        tokenBDecimal.gt(0) &&
        !tooManyDecimalsError.isError
      ) {
        return { label: "Swap", disabled: false };
      }
      if (tokenADecimal.gt(0) && tokenBDecimal.gt(0) && !tooManyDecimalsError.isError) {
        return { label: "Swap", disabled: false };
      }
      if (tokenADecimal.gt(0) && tokenBDecimal.gt(0) && tooManyDecimalsError.isError) {
        return { label: "Swap", disabled: true };
      }
    } else {
      return { label: "Connect Wallet", disabled: true };
    }

    return { label: "Select token", disabled: true };
  }, [
    selectedAccount?.address,
    tooManyDecimalsError.isError,
    tokenBalances?.balance,
    selectedTokens.tokenA.decimals,
    selectedTokens.tokenB.decimals,
    selectedTokenAValue?.tokenValue,
    selectedTokenBValue?.tokenValue,
    walletHasEnoughNativeToken,
  ]);

  const getSwapTokenA = async () => {
    if (api) {
      const poolsAssetTokenIds = pools?.map((pool: any) => {
        if (pool?.[0]?.[1].interior?.X2) {
          const assetTokenIds = pool?.[0]?.[1]?.interior?.X2?.[1]?.GeneralIndex?.replace(/[, ]/g, "").toString();
          return assetTokenIds;
        }
      });

      const tokens = tokenBalances?.assets?.filter((item: any) => poolsAssetTokenIds.includes(item.tokenId)) || [];

      const assetTokens = [nativeToken]
        .concat(tokens)
        ?.filter((item: any) => item.tokenId !== selectedTokens.tokenB?.tokenId);

      const poolTokenPairsArray: any[] = [];

      await Promise.all(
        pools.map(async (pool: any) => {
          if (pool?.[0]?.[1]?.interior?.X2) {
            const poolReserve: any = await getPoolReserves(
              api,
              pool?.[0]?.[1]?.interior?.X2?.[1]?.GeneralIndex?.replace(/[, ]/g, "")
            );

            if (poolReserve?.length > 0) {
              const assetTokenMetadata: any = await api.query.assets.metadata(
                pool?.[0]?.[1]?.interior?.X2?.[1]?.GeneralIndex?.replace(/[, ]/g, "")
              );

              poolTokenPairsArray.push({
                name: `${nativeTokenSymbol}–${assetTokenMetadata.toHuman().symbol}`,
              });
            }
          }
        })
      );

      const assetTokensInPoolTokenPairsArray = poolTokenPairsArray.map((item: any) => item.name.split("–")[1]);

      assetTokensInPoolTokenPairsArray.push(nativeTokenSymbol);

      // todo: refactor to be sure what data we are passing - remove any
      const assetTokensNotInPoolTokenPairsArray: any = assetTokens.filter((item: any) =>
        assetTokensInPoolTokenPairsArray.includes(item.assetTokenMetadata.symbol)
      );

      setAvailablePoolTokenA(assetTokensNotInPoolTokenPairsArray);
      if (selectedTokens.tokenA.tokenId.length || selectedTokens.tokenA.tokenSymbol.length) {
        const tokenA = assetTokensNotInPoolTokenPairsArray.find(item => item.tokenId === selectedTokens.tokenA.tokenId && item.assetTokenMetadata.symbol === selectedTokens.tokenA.tokenSymbol)
        if (tokenA) {
          const assetTokenData: TokenProps = {
            tokenSymbol: tokenA.assetTokenMetadata.symbol,
            tokenId: tokenA.tokenId,
            decimals: tokenA.assetTokenMetadata.decimals,
            tokenBalance: tokenA.tokenAsset.balance,
          };
          setSelectedTokens((prev) => {
            return {
              ...prev,
              tokenA: assetTokenData
            }
          })
        }
      }
    }
  };

  const getSwapTokenB = () => {
    const poolLiquidTokens: any = [nativeToken]
      .concat(poolsTokenMetadata)
      ?.filter((item: any) => item.tokenId !== selectedTokens.tokenA?.tokenId);
    if (tokenBalances !== null) {
      for (const item of poolLiquidTokens) {
        for (const walletAsset of tokenBalances.assets) {
          if (item.tokenId === walletAsset.tokenId) {
            item.tokenAsset.balance = walletAsset.tokenAsset.balance;
          }
        }
      }
      setAvailablePoolTokenB(poolLiquidTokens);
      if (selectedTokens.tokenB.tokenId.length || selectedTokens.tokenB.tokenSymbol.length) {
        const tokenB = poolLiquidTokens.find(item => item.tokenId === selectedTokens.tokenB.tokenId && item.assetTokenMetadata.symbol === selectedTokens.tokenB.tokenSymbol)
        if (tokenB) {
          const assetTokenData: TokenProps = {
            tokenSymbol: tokenB.assetTokenMetadata.symbol,
            tokenId: tokenB.tokenId,
            decimals: tokenB.assetTokenMetadata.decimals,
            tokenBalance: tokenB.tokenAsset.balance,
          };
          setSelectedTokens((prev) => {
            return {
              ...prev,
              tokenB: assetTokenData
            }
          })
        }
      }
    }
    return poolLiquidTokens;
  };

  const handleSwap = async () => {
    setReviewModalOpen(false);
    if (waitingForTransaction) {
      clearTimeout(waitingForTransaction);
    }
    setSwapSuccessfulReset(false);
    setIsTransactionTimeout(false);
    setIsMaxValueLessThenMinAmount(false);
    if (api) {
      const tokenA = formatInputTokenValue(tokenAValueForSwap.tokenValue, selectedTokens.tokenA.decimals);
      const tokenB = formatInputTokenValue(tokenBValueForSwap.tokenValue, selectedTokens.tokenB.decimals);
      if (selectedTokens.tokenA.tokenSymbol === nativeTokenSymbol) {
        if (selectedTokens.tokenB.tokenId) {
          if (inputEdited.inputType === InputEditedType.exactIn) {
            await swapNativeForAssetExactIn(
              api,
              selectedTokens.tokenB.tokenId,
              selectedAccount,
              tokenA,
              tokenB,
              selectedTokens.tokenA.decimals,
              selectedTokens.tokenB.decimals,
              false,
              dispatch
            );
          } else if (inputEdited.inputType === InputEditedType.exactOut) {
            if (selectedTokens.tokenB.tokenId) {
              await swapNativeForAssetExactOut(
                api,
                selectedTokens.tokenB.tokenId,
                selectedAccount,
                tokenA,
                tokenB,
                selectedTokens.tokenA.decimals,
                selectedTokens.tokenB.decimals,
                false,
                dispatch
              );
            }
          }
        }
      } else if (selectedTokens.tokenB.tokenSymbol === nativeTokenSymbol) {
        if (selectedTokens.tokenA.tokenId) {
          if (inputEdited.inputType === InputEditedType.exactIn) {
            await swapNativeForAssetExactIn(
              api,
              selectedTokens.tokenA.tokenId,
              selectedAccount,
              tokenB,
              tokenA,
              selectedTokens.tokenA.decimals,
              selectedTokens.tokenB.decimals,
              true,
              dispatch
            );
          } else if (inputEdited.inputType === InputEditedType.exactOut) {
            await swapNativeForAssetExactOut(
              api,
              selectedTokens.tokenA.tokenId,
              selectedAccount,
              tokenB,
              tokenA,
              selectedTokens.tokenA.decimals,
              selectedTokens.tokenB.decimals,
              true,
              dispatch
            );
          }
        }
      } else if (
        selectedTokens.tokenA.tokenSymbol !== nativeTokenSymbol &&
        selectedTokens.tokenB.tokenSymbol !== nativeTokenSymbol
      ) {
        if (selectedTokens.tokenA.tokenId && selectedTokens.tokenB.tokenId) {
          if (inputEdited.inputType === InputEditedType.exactIn) {
            await swapAssetForAssetExactIn(
              api,
              selectedTokens.tokenA.tokenId,
              selectedTokens.tokenB.tokenId,
              selectedAccount,
              tokenA,
              tokenB,
              selectedTokens.tokenA.decimals,
              selectedTokens.tokenB.decimals,
              dispatch
            );
          } else if (inputEdited.inputType === InputEditedType.exactOut) {
            await swapAssetForAssetExactOut(
              api,
              selectedTokens.tokenA.tokenId,
              selectedTokens.tokenB.tokenId,
              selectedAccount,
              tokenA,
              tokenB,
              selectedTokens.tokenA.decimals,
              selectedTokens.tokenB.decimals,
              dispatch
            );
          }
        }
      }
    }
  };

  const fillTokenPairsAndOpenModal = (tokenInputSelected: TokenSelection) => {
    if (tokenInputSelected === TokenSelection.TokenA) getSwapTokenA();
    if (tokenInputSelected === TokenSelection.TokenB) getSwapTokenB();

    setShowSelectTokenModal(tokenInputSelected)
  };

  const updateTokenBalances = async () => {
    if (api) {
      await createPoolCardsArray(api, dispatch, pools, selectedAccount);

      if (selectedTokens.tokenA.tokenSymbol === nativeTokenSymbol) {
        const assets: any = await setTokenBalanceUpdate(
          api,
          selectedAccount.address,
          selectedTokens.tokenB.tokenId,
          tokenBalances
        );
        dispatch({ type: ActionType.SET_TOKEN_BALANCES, payload: assets });
      }
      if (selectedTokens.tokenB.tokenSymbol === nativeTokenSymbol) {
        const assets: any = await setTokenBalanceUpdate(
          api,
          selectedAccount.address,
          selectedTokens.tokenA.tokenId,
          tokenBalances
        );
        dispatch({ type: ActionType.SET_TOKEN_BALANCES, payload: assets });
      }
      if (
        selectedTokens.tokenB.tokenSymbol !== nativeTokenSymbol &&
        selectedTokens.tokenA.tokenSymbol !== nativeTokenSymbol
      ) {
        const assets: any = await setTokenBalanceAfterAssetsSwapUpdate(
          api,
          selectedAccount.address,
          selectedTokens.tokenA.tokenId,
          selectedTokens.tokenB.tokenId,
          tokenBalances
        );
        dispatch({ type: ActionType.SET_TOKEN_BALANCES, payload: assets });
      }
    }
  }

  // const closeSuccessModal = async () => {
  //   dispatch({ type: ActionType.SET_SWAP_FINALIZED, payload: false });
  //   setSwapSuccessfulReset(true);
  // };

  const onSwapSelectModal = (tokenData: any) => {
    setSelectedTokens((prev) => {
      return {
        ...prev,
        [showSelectTokenModal]: tokenData,
      };
    });
  };

  const checkIfEnoughTokensInPool = () => {
    if (selectedTokens && poolsCards) {
      if (selectedTokens.tokenB.tokenSymbol === nativeTokenSymbol) {
        if (poolsCards) {
          const poolNative = poolsCards.find((pool) => pool.assetTokenId === selectedTokens.tokenA.tokenId);
          if (poolNative)
            setNativeTokensInPool(
              formatDecimalsFromToken(
                poolNative.totalTokensLocked.nativeToken.value,
                poolNative.totalTokensLocked.nativeToken.decimals
              )
            );
        }
      }
      if (selectedTokens.tokenB.tokenSymbol !== nativeTokenSymbol) {
        if (poolsCards) {
          const poolAsset = poolsCards.find((pool) => pool.assetTokenId === selectedTokens.tokenB.tokenId);
          if (poolAsset)
            setAssetTokensInPool(
              formatDecimalsFromToken(
                poolAsset.totalTokensLocked.assetToken.value,
                poolAsset.totalTokensLocked.assetToken.decimals
              )
            );
        }
      }
    }
  };

  const checkIsEnoughNativeTokenInPool = () => {
    if (selectedTokens && poolsCards) {
      if (
        selectedTokens.tokenB.tokenSymbol !== nativeTokenSymbol &&
        selectedTokens.tokenA.tokenSymbol !== nativeTokenSymbol
      ) {
        if (poolsCards) {
          const poolAssetTokenB = poolsCards.find((pool) => pool.assetTokenId === selectedTokens.tokenB.tokenId);
          const poolAssetTokenA = poolsCards.find((pool) => pool.assetTokenId === selectedTokens.tokenA.tokenId);

          if (poolAssetTokenB && poolAssetTokenA) {
            if (
              parseFloat(poolAssetTokenB?.totalTokensLocked.nativeToken.formattedValue) < 1 ||
              parseFloat(poolAssetTokenA?.totalTokensLocked.nativeToken.formattedValue) < 1
            ) {
              setLiquidityLow(true);
            } else {
              setLiquidityLow(false);
            }
          }
        }
      } else {
        setLiquidityLow(false);
      }
    }
  };

  const checkAssetTokenMinAmountToSwap = async () => {
    const token = tokenBalances?.assets?.filter((item: any) => selectedTokens.tokenB.tokenId === item.tokenId);
    if (token?.length === 0) {
      if (selectedTokenBValue.tokenValue && api) {
        const assetTokenInfo: any = await api.query.assets.asset(selectedTokens.tokenB.tokenId);
        const assetTokenMinBalance = assetTokenInfo.toHuman()?.minBalance;
        if (
          parseInt(formatInputTokenValue(tokenBValueForSwap.tokenValue, selectedTokens.tokenB.decimals)) <
          parseInt(assetTokenMinBalance?.replace(/[, ]/g, ""))
        ) {
          setMinimumBalanceAssetToken(
            formatDecimalsFromToken(assetTokenMinBalance?.replace(/[, ]/g, ""), selectedTokens.tokenB.decimals)
          );
          setLowMinimalAmountAssetToken(true);
        } else {
          setLowMinimalAmountAssetToken(false);
        }
      }
    }
  };

  type TransactionValues = {
    formattedValueA: string;
    formattedValueB: string;
    priceCalcType: PriceCalcType;
    valueA: string;
    valueB: string;
    minAmountA: string;
    minAmountB: string;
  };
  /**
   * Token A is asset token
   * Token B is native token
   * @param param0
   */
  const getMaxClickNativeFromAssetValues = ({
    assetTokenMinBalance,
    nativeTokenExistentialDeposit,
    poolAsset,
  }: {
    assetTokenMinBalance: string;
    nativeTokenExistentialDeposit: string;
    poolAsset: PoolCardProps;
  }): TransactionValues => {
    const priceCalcType = PriceCalcType.NativeFromAsset;

    const valueA = new Decimal(selectedTokens.tokenA.tokenBalance.replace(/[, ]/g, ""))
      .minus(assetTokenMinBalance) // TODO: substract this later if it is required, eg after calculation
      .toFixed();
    const formattedValueA = formatDecimalsFromToken(valueA, selectedTokens.tokenA.decimals);

    const valueB = new Decimal(poolAsset.totalTokensLocked.nativeToken.value)
      .minus(nativeTokenExistentialDeposit) // TODO: substract this later if it is required, eg after calculation
      .toFixed();

    const formattedValueB = formatDecimalsFromToken(valueB, poolAsset.totalTokensLocked.nativeToken.decimals);
    return {
      formattedValueA,
      formattedValueB,
      valueA,
      valueB,
      priceCalcType,
      minAmountA: assetTokenMinBalance,
      minAmountB: nativeTokenExistentialDeposit,
    };
  };

  /**
   * Token A is native token
   * Token B is asset token
   * @param param0
   */
  const getMaxClickAssetFromNativeValues = ({
    assetTokenMinBalance,
    nativeTokenExistentialDeposit,
    poolAsset,
  }: {
    assetTokenMinBalance: string;
    nativeTokenExistentialDeposit: string;
    poolAsset: PoolCardProps;
  }): TransactionValues => {
    const priceCalcType = PriceCalcType.AssetFromNative;

    const valueA = new Decimal(
      formatInputTokenValue(selectedTokens.tokenA.tokenBalance.replace(/[, ]/g, ""), selectedTokens.tokenA.decimals)
    )
      .minus(nativeTokenExistentialDeposit) // TODO: substract this later if it is required, eg after calculation
      .toFixed();
    const formattedValueA = formatDecimalsFromToken(valueA, selectedTokens.tokenA.decimals);

    const valueB = new Decimal(poolAsset.totalTokensLocked.assetToken.value)
      .minus(assetTokenMinBalance) // TODO: substract this later if it is required, eg after calculation
      .toFixed();

    const formattedValueB = formatDecimalsFromToken(valueB, selectedTokens.tokenB.decimals);

    return {
      formattedValueA,
      formattedValueB,
      valueA,
      valueB,
      priceCalcType,
      minAmountA: nativeTokenExistentialDeposit,
      minAmountB: assetTokenMinBalance,
    };
  };

  const getMaxAssetFromAssetValues = ({
    assetTokenMinAmountA,
    assetTokenMinAmountB,
    poolAsset,
  }: {
    assetTokenMinAmountA: string;
    assetTokenMinAmountB: string;
    poolAsset: PoolCardProps;
  }): TransactionValues => {
    const priceCalcType = PriceCalcType.AssetFromAsset;
    const valueA = new Decimal(selectedTokens.tokenA.tokenBalance.replace(/[, ]/g, ""))
      .minus(assetTokenMinAmountA) // TODO: substract this later if it is required, eg after calculation
      .toFixed();
    const formattedValueA = formatDecimalsFromToken(valueA, selectedTokens.tokenA.decimals);

    const valueB = new Decimal(poolAsset.totalTokensLocked.assetToken.value)
      .minus(assetTokenMinAmountB) // TODO: substract this later if it is required, eg after calculation
      .toFixed();
    const formattedValueB = poolAsset.totalTokensLocked.assetToken.formattedValue;

    return {
      formattedValueA,
      formattedValueB,
      valueA,
      valueB,
      priceCalcType,
      minAmountA: assetTokenMinAmountA,
      minAmountB: assetTokenMinAmountB,
    };
  };

  // some of tokens can be full drain for either from pool or from user balance
  // if it is native token selling and it is drain we need to substrate fee and existential deposit
  // if it is asset token selling and it is drain (from user wallet or pool) we need to substrate min balance
  // if it is native token drain from the pool we need to substrate existential deposit
  const onMaxClick = async () => {
    setIsMaxValueLessThenMinAmount(false);
    const nativeTokenExistentialDeposit = tokenBalances!.existentialDeposit.replace(/[, ]/g, "");
    // tokenb moze biti native token i onda ga nece naci u poolu, u tom slucaju treba naci pool za tokenA
    let poolAsset = poolsCards.find((pool) => pool.assetTokenId === selectedTokens.tokenB.tokenId);

    let formattedValueA: string,
      formattedValueB: string,
      priceCalcType: PriceCalcType,
      valueA: string,
      valueB: string,
      minAmountA: string,
      minAmountB: string;
    if (selectedTokens.tokenA.tokenSymbol === nativeTokenSymbol) {
      if (!poolAsset) {
        throw new Error("Pool asset not found");
      }
      const assetTokenInfoB: any = await api!.query.assets.asset(selectedTokens.tokenB.tokenId);
      const assetTokenMinBalanceB = assetTokenInfoB.toHuman()?.minBalance.replace(/[, ]/g, "");
      ({ formattedValueA, formattedValueB, priceCalcType, valueA, valueB, minAmountA, minAmountB } =
        getMaxClickAssetFromNativeValues({
          assetTokenMinBalance: assetTokenMinBalanceB,
          nativeTokenExistentialDeposit,
          poolAsset,
        }));
    } else if (selectedTokens.tokenB.tokenSymbol === nativeTokenSymbol) {
      poolAsset = poolsCards.find((pool) => pool.assetTokenId === selectedTokens.tokenA.tokenId);
      if (!poolAsset) {
        throw new Error("Pool asset not found");
      }
      const assetTokenInfoA: any = await api!.query.assets.asset(selectedTokens.tokenA.tokenId);
      const assetTokenMinBalanceA = assetTokenInfoA.toHuman()?.minBalance.replace(/[, ]/g, "");
      ({ formattedValueA, formattedValueB, priceCalcType, valueA, valueB, minAmountA, minAmountB } =
        getMaxClickNativeFromAssetValues({
          assetTokenMinBalance: assetTokenMinBalanceA,
          nativeTokenExistentialDeposit,
          poolAsset,
        }));
    } else {
      if (!poolAsset) {
        throw new Error("Pool asset not found");
      }
      const assetTokenInfoA: any = await api!.query.assets.asset(selectedTokens.tokenA.tokenId);
      const assetTokenMinAmountA = assetTokenInfoA.toHuman()?.minBalance.replace(/[, ]/g, "");
      const assetTokenInfoB: any = await api!.query.assets.asset(selectedTokens.tokenB.tokenId);
      const assetTokenMinAmountB = assetTokenInfoB.toHuman()?.minBalance.replace(/[, ]/g, "");
      ({ formattedValueA, formattedValueB, priceCalcType, valueA, valueB, minAmountA, minAmountB } =
        getMaxAssetFromAssetValues({ assetTokenMinAmountA, assetTokenMinAmountB, poolAsset }));
    }

    const tokenA: SellMaxToken = {
      id: selectedTokens.tokenA.tokenId,
      decimals: selectedTokens.tokenA.decimals,
      value: valueA,
      formattedValue: formattedValueA,
      minAmount: minAmountA,
    };

    const tokenBinPool: SellMaxToken = {
      id: selectedTokens.tokenB.tokenId,
      decimals: selectedTokens.tokenB.decimals,
      value: valueB,
      formattedValue: formattedValueB,
      minAmount: minAmountB,
    };

    dispatch({ type: ActionType.SET_SWAP_LOADING, payload: true });
    const maxValueA = await sellMax({
      api: api!,
      tokenA,
      tokenBinPool,
      priceCalcType,
    });
    dispatch({ type: ActionType.SET_SWAP_LOADING, payload: false });
    const minAmountFormattedA = formatDecimalsFromToken(minAmountA, selectedTokens.tokenA.decimals);

    if (new Decimal(maxValueA).lt(minAmountFormattedA)) {
      setIsMaxValueLessThenMinAmount(true);
      return;
    }
    tokenAValue(maxValueA);
    if (selectedTokens.tokenA.tokenSymbol === nativeTokenSymbol && tokenBalances) {
      // reduce gas fee if amount is lower then balance in wallet
      const fee = convertToBaseUnit(swapGasFee);
      const maxValueWithFee = new Decimal(maxValueA).plus(fee);
      const nativeTokenBalance = new Decimal(tokenBalances.balance);
      if (nativeTokenBalance.lt(maxValueWithFee)) {
        tokenAValue(nativeTokenBalance.minus(fee).toFixed());
      }
    }
  };

  const handleSwitchTokens = () => {
    const selectedTokenA: TokenProps = selectedTokens.tokenA;
    const selectedTokenB: TokenProps = selectedTokens.tokenB;

    setSwitchTokensEnabled(true);

    setSelectedTokens({
      tokenA: {
        tokenSymbol: selectedTokenB.tokenSymbol,
        tokenBalance: selectedTokenB.tokenBalance.toString(),
        tokenId: selectedTokenB.tokenId,
        decimals: selectedTokenB.decimals,
      },
      tokenB: {
        tokenSymbol: selectedTokenA.tokenSymbol,
        tokenBalance: selectedTokenA.tokenBalance.toString(),
        tokenId: selectedTokenA.tokenId,
        decimals: selectedTokenA.decimals,
      },
    });
  };

  useEffect(() => {
    if (switchTokensEnabled) {
      if (inputEdited.inputType === InputEditedType.exactIn) {
        tokenBValue(selectedTokenAValue.tokenValue);
      } else if (inputEdited.inputType === InputEditedType.exactOut) {
        tokenAValue(selectedTokenBValue.tokenValue);
      }
    } else {
      if (
        selectedTokenBValue?.tokenValue &&
        tokenSelected.tokenSelected === TokenPosition.tokenA &&
        parseFloat(selectedTokenBValue?.tokenValue) > 0
      ) {
        tokenBValue(selectedTokenBValue.tokenValue);
      }

      if (
        selectedTokenAValue?.tokenValue &&
        tokenSelected.tokenSelected === TokenPosition.tokenB &&
        tokenADecimal.gt(0)
      ) {
        tokenAValue(selectedTokenAValue.tokenValue);
      }
    }

    if (
      selectedTokenAValue?.tokenValue &&
      tokenSelected.tokenSelected === TokenPosition.tokenB &&
      tokenADecimal.gt(0)
    ) {
      tokenAValue(selectedTokenAValue.tokenValue);
    }
    return () => {
      setSwitchTokensEnabled(false);
    };
  }, [selectedTokens]);

  useEffect(() => {
    if (
      selectedTokenAValue?.tokenValue &&
      selectedTokenBValue?.tokenValue &&
      inputEdited.inputType === InputEditedType.exactIn &&
      parseFloat(selectedTokenBValue.tokenValue) > 0
    ) {
      tokenAValue(selectedTokenAValue?.tokenValue);
    } else if (
      selectedTokenAValue?.tokenValue &&
      selectedTokenBValue?.tokenValue &&
      inputEdited.inputType === InputEditedType.exactOut &&
      parseFloat(selectedTokenAValue.tokenValue) > 0
    ) {
      tokenBValue(selectedTokenBValue?.tokenValue);
    }
  }, [slippageValue]);

  useEffect(() => {
    if (
      (selectedTokens.tokenA.tokenSymbol === nativeTokenSymbol ||
        selectedTokens.tokenB.tokenSymbol === nativeTokenSymbol) &&
      selectedTokenAValue.tokenValue !== "" &&
      selectedTokenBValue.tokenValue !== ""
    ) {
      handleSwapNativeForAssetGasFee();
    }
    if (
      selectedTokens.tokenA.tokenSymbol !== nativeTokenSymbol &&
      selectedTokens.tokenB.tokenSymbol !== nativeTokenSymbol &&
      selectedTokens.tokenA.tokenSymbol !== "" &&
      selectedTokens.tokenB.tokenSymbol !== "" &&
      selectedTokenAValue.tokenValue !== "" &&
      selectedTokenBValue.tokenValue !== ""
    ) {
      handleSwapAssetForAssetGasFee();
    }
    checkAssetTokenMinAmountToSwap();
    dispatch({ type: ActionType.SET_TOKEN_CAN_NOT_CREATE_WARNING_SWAP, payload: false });
  }, [
    selectedTokens.tokenA.tokenSymbol && selectedTokens.tokenB.tokenSymbol,
    tokenAValueForSwap.tokenValue && tokenBValueForSwap.tokenValue,
  ]);
  useEffect(() => {
    setIsMaxValueLessThenMinAmount(false);
    setIsTransactionTimeout(false);
    if (selectedTokenBValue.tokenValue === "") {
      setTokenAValueForSwap({ tokenValue: "0" });
      setTokenBValueForSwap({ tokenValue: "0" });
      setLowMinimalAmountAssetToken(false);
      dispatch({
        type: ActionType.SET_SWAP_GAS_FEES_MESSAGE,
        payload: "",
      });
      dispatch({
        type: ActionType.SET_SWAP_GAS_FEE,
        payload: "",
      });
    }
  }, [
    selectedTokenAValue.tokenValue,
    selectedTokenBValue.tokenValue,
    selectedTokens.tokenA.tokenSymbol,
    selectedTokens.tokenB.tokenSymbol,
  ]);

  useEffect(() => {
    checkIfEnoughTokensInPool();
    checkIsEnoughNativeTokenInPool();
  }, [selectedTokens.tokenA.tokenSymbol, selectedTokens.tokenB.tokenSymbol]);

  // useEffect(() => {
  //   if (swapSuccessfulReset) {
  //     setSelectedTokenAValue({ tokenValue: "" });
  //     setSelectedTokenBValue({ tokenValue: "" });
  //   }
  // }, [swapSuccessfulReset]);

  useEffect(() => {
    if (Object.keys(selectedAccount).length === 0) {
      setSelectedTokenAValue({ tokenValue: "" });
      setSelectedTokenBValue({ tokenValue: "" });
      setSelectedTokens({
        tokenA: {
          tokenSymbol: "",
          tokenId: "0",
          decimals: "",
          tokenBalance: "",
        },
        tokenB: {
          tokenSymbol: "",
          tokenId: "0",
          decimals: "",
          tokenBalance: "",
        },
      });
    }
  }, [selectedAccount]);

  useEffect(() => {
    dispatch({
      type: ActionType.SET_SWAP_GAS_FEES_MESSAGE,
      payload: "",
    });
    dispatch({
      type: ActionType.SET_SWAP_GAS_FEE,
      payload: "",
    });
  }, []);

  useEffect(() => {
    if (swapLoading) {
      setWaitingForTransaction(
        setTimeout(() => {
          if (swapLoading) {
            setIsTransactionTimeout(true);
            dispatch({ type: ActionType.SET_SWAP_LOADING, payload: false });
          }
        }, 180000)
      ); // 3 minutes 180000
    } else {
      if (waitingForTransaction) {
        clearTimeout(waitingForTransaction);
      }

      if (swapFinalized) {
        updateTokenBalances()
      }
    }
  }, [swapLoading]);

  useEffect(() => {
    if (tokenBalances) {
      getSwapTokenA()
      getSwapTokenB()
      setSelectedTokenAValue({ tokenValue: "" });
      setSelectedTokenBValue({ tokenValue: "" });
    }
  }, [tokenBalances])

  const calculatePriceImpact = async () => {
    if (api) {
      if (selectedTokens.tokenA.tokenSymbol === nativeTokenSymbol && selectedTokenBValue.tokenValue !== "") {
        const poolSelected: any = pools?.find(
          (pool: any) =>
            pool?.[0]?.[1]?.interior?.X2?.[1]?.GeneralIndex?.replace(/[, ]/g, "") === selectedTokens.tokenB.tokenId
        );
        if (poolSelected) {
          const poolReserve: any = await getPoolReserves(
            api,
            poolSelected?.[0]?.[1]?.interior?.X2?.[1]?.GeneralIndex?.replace(/[, ]/g, "")
          );

          const assetTokenReserve = formatDecimalsFromToken(
            poolReserve?.[1]?.replace(/[, ]/g, ""),
            selectedTokens.tokenB.decimals
          );

          const nativeTokenReserve = formatDecimalsFromToken(
            poolReserve?.[0]?.replace(/[, ]/g, ""),
            selectedTokens.tokenA.decimals
          );

          const priceBeforeSwap = new Decimal(nativeTokenReserve).div(assetTokenReserve);

          const priceOfAssetBForOneAssetA = new Decimal(assetTokenReserve).div(nativeTokenReserve);
          setAssetBPriceOfOneAssetA(priceOfAssetBForOneAssetA.toFixed(5));

          const valueA = new Decimal(selectedTokenAValue.tokenValue).add(nativeTokenReserve);
          const valueB = new Decimal(assetTokenReserve).minus(selectedTokenBValue.tokenValue);

          const priceAfterSwap = valueA.div(valueB);

          const priceImpact = new Decimal(1).minus(priceBeforeSwap.div(priceAfterSwap));

          setPriceImpact(priceImpact.mul(100).toFixed(2));
        }
      } else if (
        selectedTokens.tokenB.tokenSymbol === nativeTokenSymbol &&
        selectedTokenBValue.tokenValue !== "" &&
        selectedTokenAValue.tokenValue !== ""
      ) {
        const poolSelected: any = pools?.find(
          (pool: any) =>
            pool?.[0]?.[1]?.interior?.X2?.[1]?.GeneralIndex?.replace(/[, ]/g, "") === selectedTokens.tokenA.tokenId
        );

        if (poolSelected) {
          const poolReserve: any = await getPoolReserves(
            api,
            poolSelected?.[0]?.[1]?.interior?.X2?.[1]?.GeneralIndex?.replace(/[, ]/g, "")
          );
          const assetTokenReserve = formatDecimalsFromToken(
            poolReserve?.[1]?.replace(/[, ]/g, ""),
            selectedTokens.tokenA.decimals
          );

          const nativeTokenReserve = formatDecimalsFromToken(
            poolReserve?.[0]?.replace(/[, ]/g, ""),
            selectedTokens.tokenB.decimals
          );

          const priceBeforeSwap = new Decimal(nativeTokenReserve).div(assetTokenReserve);

          const priceOfAssetBForOneAssetA = new Decimal(nativeTokenReserve).div(assetTokenReserve);

          setAssetBPriceOfOneAssetA(priceOfAssetBForOneAssetA.toFixed(5));

          const valueA = new Decimal(assetTokenReserve).minus(selectedTokenAValue.tokenValue);
          const valueB = new Decimal(nativeTokenReserve).add(selectedTokenBValue.tokenValue);

          const priceAfterSwap = valueB.div(valueA);

          const priceImpact = new Decimal(1).minus(priceBeforeSwap.div(priceAfterSwap));

          setPriceImpact(priceImpact.mul(100).toFixed(2));
        }
      }
      if (
        selectedTokens.tokenB.tokenSymbol !== nativeTokenSymbol &&
        selectedTokens.tokenA.tokenSymbol !== nativeTokenSymbol &&
        selectedTokenBValue.tokenValue !== "" &&
        selectedTokenAValue.tokenValue !== ""
      ) {
        const poolSelectedA: any = pools?.find(
          (pool: any) =>
            pool?.[0]?.[1]?.interior?.X2?.[1]?.GeneralIndex?.replace(/[, ]/g, "") === selectedTokens.tokenA.tokenId
        );

        const poolSelectedB: any = pools?.find(
          (pool: any) =>
            pool?.[0]?.[1]?.interior?.X2?.[1]?.GeneralIndex?.replace(/[, ]/g, "") === selectedTokens.tokenB.tokenId
        );

        if (poolSelectedA && poolSelectedB) {
          const poolReserveA: any = await getPoolReserves(
            api,
            poolSelectedA?.[0]?.[1]?.interior?.X2?.[1]?.GeneralIndex?.replace(/[, ]/g, "")
          );

          const assetTokenReserveA = formatDecimalsFromToken(
            poolReserveA?.[1]?.replace(/[, ]/g, ""),
            selectedTokens.tokenA.decimals
          );

          const nativeTokenDecimals =
            selectedTokens.tokenA.tokenSymbol === nativeTokenSymbol
              ? selectedTokens.tokenA.decimals
              : selectedTokens.tokenB.decimals;

          const nativeTokenReserveA = formatDecimalsFromToken(
            poolReserveA?.[0]?.replace(/[, ]/g, ""),
            nativeTokenDecimals
          );

          const priceBeforeSwapA = new Decimal(assetTokenReserveA).div(nativeTokenReserveA);

          const valueAWithDecimals = formatInputTokenValue(
            new Decimal(selectedTokenAValue.tokenValue).toNumber(),
            selectedTokens.tokenA.decimals
          );

          const nativeTokenAmount = await getNativeTokenFromAssetToken(
            api,
            selectedTokens?.tokenA?.tokenId,
            valueAWithDecimals
          );

          if (nativeTokenAmount) {
            const nativeTokenAmountFormatted = formatDecimalsFromToken(
              new Decimal(nativeTokenAmount?.toString().replace(/[, ]/g, "")).toNumber(),
              nativeTokenDecimals
            );
            const valueA = new Decimal(assetTokenReserveA).add(selectedTokenAValue.tokenValue);
            const valueB = new Decimal(nativeTokenReserveA).minus(nativeTokenAmountFormatted);

            const priceAfterSwapA = valueA.div(valueB);

            const priceImpactTokenA = new Decimal(1).minus(priceBeforeSwapA.div(priceAfterSwapA));

            const poolReserveB: any = await getPoolReserves(
              api,
              poolSelectedB?.[0]?.[1]?.interior?.X2?.[1]?.GeneralIndex?.replace(/[, ]/g, "")
            );

            const assetTokenReserveB = formatDecimalsFromToken(
              poolReserveA?.[1]?.replace(/[, ]/g, ""),
              selectedTokens.tokenB.decimals
            );

            const oneAssetTokenBAmount = await getAssetTokenBFromAssetTokenA(
              api,
              formatInputTokenValue(1, selectedTokens.tokenA.decimals),
              selectedTokens?.tokenA?.tokenId,
              selectedTokens?.tokenB?.tokenId
            );
            if (oneAssetTokenBAmount) {
              const oneAssetTokenBFormatted = formatDecimalsFromToken(
                new Decimal(oneAssetTokenBAmount?.toString().replace(/[, ]/g, "")).toNumber(),
                selectedTokens.tokenB.decimals
              );

              setAssetBPriceOfOneAssetA(oneAssetTokenBFormatted.toString());
            }

            const nativeTokenReserveB = formatDecimalsFromToken(
              poolReserveB?.[0]?.replace(/[, ]/g, ""),
              nativeTokenDecimals
            );

            const priceBeforeSwapB = new Decimal(nativeTokenReserveB).div(assetTokenReserveB);

            const tokenBValue = new Decimal(assetTokenReserveB).minus(selectedTokenBValue.tokenValue);
            const nativeTokenBValue = new Decimal(nativeTokenReserveB).add(nativeTokenAmountFormatted);

            const priceAfterSwapB = nativeTokenBValue.div(tokenBValue);

            const priceImpactTokenB = new Decimal(1).minus(priceBeforeSwapB.div(priceAfterSwapB));

            let totalPriceImpact: Decimal;

            if (new Decimal(priceImpactTokenA).lessThan(priceImpactTokenB)) {
              totalPriceImpact = new Decimal(priceImpactTokenB).times(priceImpactTokenA.add(1));
            } else {
              totalPriceImpact = new Decimal(priceImpactTokenA).times(priceImpactTokenB.add(1));
            }

            setPriceImpact(totalPriceImpact.mul(100).toFixed(2));
          }
        }
      }
    }
  };

  useEffect(() => {
    calculatePriceImpact();
  }, [
    selectedTokens.tokenA.tokenSymbol,
    selectedTokens.tokenB.tokenSymbol,
    selectedTokenBValue.tokenValue,
    selectedTokenAValue.tokenValue,
  ]);

  return (
    <div className="flex flex-col justify-start min-w-[360px] h-screen sm:h-[calc(100vh-90px)] items-center mt-0 pt-[20%] pb-[20%] sm:pb-[5%] sm:pt-16 gap-4 sm:gap-10 text-[var(--text-maincolor)] dark:text-[#120038] overflow-auto">
      <div className="flex-row p-1 w-[280px] bg-[#220068] dark:bg-[#E9E9E9] rounded-full sm:flex hidden">
        <Link href="/dashboard/swap" className="w-1/2">
          <div className="w-full py-2.5 px-6 text-white text-center text-2xl font-bold bg-gradient-to-b from-[#5100FE] to-[#32009C] rounded-full shadow-down-black">
            Swap
          </div>
        </Link>
        <Link href="/dashboard/liquidity" className="w-1/2">
          <button className="w-full py-2.5 px-6 rounded-full text-2xl font-bold">
            Liquidity
          </button>
        </Link>
      </div>
      <div className="sm:w-[540px] w-[95%] rounded-2xl sm:rounded-[50px] sm:box-shadow-out dark:bg-gradient-to-b dark:from-[#5100FE] dark:to-[#5100FE] bg-gradient-to-r from-[#5100FE] to-[#B4D2FF] p-0.5">
        <div className="flex flex-col gap-3 sm:gap-6 h-full w-full bg-gradient-to-br from-[#2B0281] via-[#1D0058] to-[#220068] dark:bg-gradient-to-t dark:from-[#E8E8E8] dark:to-[#E8E8E8] rounded-2xl sm:rounded-[50px] p-7 sm:p-14">
          <TokenSelectionInput
            labelText={"From"}
            tokenText={selectedTokens.tokenA?.tokenSymbol}
            tokenBalance={selectedTokens.tokenA?.tokenBalance}
            tokenId={selectedTokens.tokenA?.tokenId}
            tokenDecimals={selectedTokens.tokenA?.decimals}
            tokenValue={selectedTokenAValue?.tokenValue}
            onClick={() => fillTokenPairsAndOpenModal(TokenSelection.TokenA)}
            onSetTokenValue={tokenAValue}
            disabled={!selectedAccount || swapLoading || !tokenBalances?.assets || poolsTokenMetadata.length === 0}
            assetLoading={assetLoading}
            onMaxClick={onMaxClick}
          />
          <div className="flex flex-row justify-center items-center  hover:scale-105">
            <Image
              width={40}
              height={40}
              src="/swap-icons/swap-icon.png"
              alt="Swap Icon"
              className="w-10 h-10 cursor-pointer"
              onClick={handleSwitchTokens}
            />
          </div>
          <TokenSelectionInput
            tokenText={selectedTokens.tokenB?.tokenSymbol}
            tokenBalance={selectedTokens.tokenB?.tokenBalance}
            tokenId={selectedTokens.tokenB?.tokenId}
            tokenDecimals={selectedTokens.tokenB?.decimals}
            labelText={"To"}
            tokenValue={selectedTokenBValue?.tokenValue}
            onClick={() => fillTokenPairsAndOpenModal(TokenSelection.TokenB)}
            onSetTokenValue={tokenBValue}
            disabled={!selectedAccount || swapLoading || !tokenBalances?.assets || poolsTokenMetadata.length === 0}
            assetLoading={assetLoading}
          />
          <div className="mt-1 text-small">{swapGasFeesMessage}</div>
          <MainButton
            onClick={() => (getSwapButtonProperties.disabled ? null : setReviewModalOpen(true))}
            content={swapLoading ? <LottieMedium /> : getSwapButtonProperties.label}
            disabled={getSwapButtonProperties.disabled || swapLoading}
            className="justify-center text-lg py-1.5 rounded-md sm:rounded-xl bg-gradient-to-r"
          />
        </div>
      </div>
      {/* {selectedTokenAValue.tokenValue !== "" && selectedTokenBValue.tokenValue !== "" && (
        <>
          {" "}
          <div className="flex w-full flex-col gap-2 rounded-lg bg-purple-50 px-2 py-4">
            <div className="flex w-full flex-row text-medium font-normal text-gray-200">
              <span>
                1 {selectedTokens.tokenA.tokenSymbol} = {assetBPriceOfOneAssetA} {selectedTokens.tokenB.tokenSymbol}
              </span>
            </div>
          </div>
          <div className="flex w-full flex-col gap-2 rounded-lg bg-purple-50 px-4 py-6">
            <div className="flex w-full flex-row justify-between text-medium font-normal text-gray-200">
              <div className="flex">Price impact</div>
              <span>~ {priceImpact}%</span>
            </div>
            <div className="flex w-full flex-row justify-between text-medium font-normal text-gray-200">
              <div className="flex">
                {inputEdited.inputType === InputEditedType.exactIn ? "Expected output" : "Expected input"}
              </div>
              <span>
                {inputEdited.inputType === InputEditedType.exactIn
                  ? selectedTokenBValue.tokenValue + " " + selectedTokens.tokenB.tokenSymbol
                  : selectedTokenAValue.tokenValue + " " + selectedTokens.tokenA.tokenSymbol}
              </span>
            </div>
            <div className="flex w-full flex-row justify-between text-medium font-normal text-gray-200">
              <div className="flex">
                {inputEdited.inputType === InputEditedType.exactIn ? "Minimum output" : "Maximum input"}
              </div>
              <span>
                {inputEdited.inputType === InputEditedType.exactIn
                  ? formatDecimalsFromToken(
                    formatInputTokenValue(tokenBValueForSwap.tokenValue, selectedTokens.tokenB.decimals),
                    selectedTokens.tokenB.decimals
                  ) +
                  " " +
                  selectedTokens.tokenB.tokenSymbol
                  : formatDecimalsFromToken(
                    formatInputTokenValue(tokenAValueForSwap.tokenValue, selectedTokens.tokenA.decimals),
                    selectedTokens.tokenA.decimals
                  ) +
                  " " +
                  selectedTokens.tokenA.tokenSymbol}
              </span>
            </div>
          </div>
        </>
      )} */}
      {/* For Desktop */}
      <div className="hidden sm:flex flex-col  px-9 py-6 gap-5  w-[540px] rounded-2xl bg-gradient-to-r from-[#2B0281] via-[#1D0058] to-[#220068] dark:bg-gradient-to-r dark:from-[#E8E8E8] dark:to-[#E8E8E8] p-0.5">
        <TokenPriceGraph name={selectedTokens.tokenA.tokenSymbol} price={888.88} changeRate={"8.88"} />
        <TokenPriceGraph name={selectedTokens.tokenB.tokenSymbol} price={888.88} changeRate={"8.88"} />
      </div>
      {/* For Mobile */}
      <div className="block sm:hidden w-[95%] rounded-2xl bg-gradient-to-r from-[#5100FE] to-[#B4D2FF] dark:bg-gradient-to-r dark:from-[#5100FE] dark:to-[#5100FE] p-0.5">
        <div className="w-full rounded-2xl bg-gradient-to-r from-[#2B0281] via-[#1D0058] to-[#220068] dark:bg-gradient-to-r dark:from-[#E8E8E8] dark:to-[#E8E8E8] ">
          {switchTokensEnabled ? (
            <TokenPriceGraphMobile
              tokenA={selectedTokens.tokenA.tokenSymbol}
              tokenB={selectedTokens.tokenB.tokenSymbol}
              price={0.08888}
              changeRate={"+8.88%"}
            />
          ) : (
            <TokenPriceGraphMobile
              tokenA={selectedTokens.tokenA.tokenSymbol}
              tokenB={selectedTokens.tokenB.tokenSymbol}
              price={0.08888}
              changeRate={"+8.88%"}
            />
          )}
        </div>
      </div>
      {showChartModal ? <ShowChartModal /> : null}
      {showSelectTokenModal === TokenSelection.TokenA && (
        <SelectTokenModal
          tokensData={availablePoolTokenA}
          onClose={() => setShowSelectTokenModal(TokenSelection.None)}
          onSelect={(tokenData) => {
            setTokenSelected({ tokenSelected: TokenPosition.tokenA });
            onSwapSelectModal(tokenData);
          }}
          selected={selectedTokens.tokenA}
        />
      )}
      {showSelectTokenModal === TokenSelection.TokenB && (
        <SelectTokenModal
          tokensData={availablePoolTokenB}
          onClose={() => setShowSelectTokenModal(TokenSelection.None)}
          onSelect={(tokenData) => {
            setTokenSelected({ tokenSelected: TokenPosition.tokenB });
            onSwapSelectModal(tokenData);
          }}
          selected={selectedTokens.tokenB}
        />
      )}
      <ReviewTransactionModal
        open={reviewModalOpen}
        title="Review Swap"
        priceImpact={priceImpact}
        transactionType={TransactionTypes.swap}
        inputValueA={selectedTokenAValue.tokenValue}
        inputValueB={selectedTokenBValue.tokenValue}
        tokenValueA={
          inputEdited.inputType === InputEditedType.exactIn
            ? selectedTokenBValue.tokenValue
            : selectedTokenAValue.tokenValue
        }
        tokenValueB={
          inputEdited.inputType === InputEditedType.exactIn
            ? formatDecimalsFromToken(
              formatInputTokenValue(tokenBValueForSwap.tokenValue, selectedTokens.tokenB.decimals),
              selectedTokens.tokenB.decimals
            )
            : formatDecimalsFromToken(
              formatInputTokenValue(tokenAValueForSwap.tokenValue, selectedTokens.tokenA.decimals),
              selectedTokens.tokenA.decimals
            )
        }
        tokenSymbolA={
          inputEdited.inputType === InputEditedType.exactIn
            ? selectedTokens.tokenA.tokenSymbol
            : selectedTokens.tokenB.tokenSymbol
        }
        tokenSymbolB={
          inputEdited.inputType === InputEditedType.exactIn
            ? selectedTokens.tokenB.tokenSymbol
            : selectedTokens.tokenA.tokenSymbol
        }
        onClose={() => {
          setReviewModalOpen(false);
        }}
        inputType={inputEdited.inputType}
        onConfirmTransaction={() => {
          handleSwap();
        }}
      />
      {/* <SwapPoolResultModal
        open={swapFinalized}
        onClose={closeSuccessModal}
        contentTitle={"Successfully swapped"}
        tokenA={{
          symbol: selectedTokens.tokenA.tokenSymbol,
          value: swapExactInTokenAmount.toString(),
        }}
        tokenB={{
          symbol: selectedTokens.tokenB.tokenSymbol,
          value: swapExactOutTokenAmount.toString(),
        }}
        actionLabel="Swapped"
      /> */}
      <WarningMessage show={lowTradingMinimum} message={"Your order trade is lower than the trading minimum."} />
      <WarningMessage
        show={lowMinimalAmountAssetToken}
        message={`The selected ${selectedTokens.tokenB.tokenSymbol} token you want to receive is below the minimal amount ${minimumBalanceAssetToken}.`}
      />
      <WarningMessage
        show={tooManyDecimalsError.isError}
        message={`Too many ${tooManyDecimalsError.tokenSymbol} token decimals, please reduce, maximum allowed for this token is ${tooManyDecimalsError.decimalsAllowed} decimals.`}
      />
      <WarningMessage show={liquidityLow} message={"Warning: This pool has low liquidity, there is a risk that transaction won't be completed."} />
      <WarningMessage show={isTokenCanNotCreateWarningSwap} message={"Your account has reached the limit of 16 assets and liquidity pools total. Burn or send all of assets of a certain type from your account, or withdraw all assets from a pool to make room for another type. Alternatively connect another wallet and use it for new assets and pools."} />
      <WarningMessage
        show={isTransactionTimeout}
        message={"It seems that the transaction is taking longer than usual.\nPlease check the status of the transaction in your wallet by clicking on the link below."}
      />
      <WarningMessage show={isMaxValueLessThenMinAmount} message={"The maximum value is less than the minimum amount."} />
    </div>
  );
}
