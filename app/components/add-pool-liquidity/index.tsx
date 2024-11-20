/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import MainButton from "@/app/components/button/main-button";
import CircleQuestionIcon from "@/app/components/icons/CircleQuestionIcon";
import { LottieMedium } from "@/app/components/loader";
import PoolSelectTokenModal from "@/app/components/pool-select-token-modal";
import ReviewTransactionModal from "@/app/components/review-transaction-modal";
import TokenSelectionInput from "@/app/components/side-bar/swap/token-selection-input";
import SwapPoolResultModal from "@/app/components/swap-pool-result-modal";
import WarningMessage from "@/app/components/warning-message";
import useGetNetwork from "@/app/hooks/useGetNetwork";
import { setTokenBalanceUpdate } from "@/app/services/polkadotWalletServices";
import { addLiquidity, checkAddPoolLiquidityGasFee, getPoolReserves } from "@/app/services/poolServices";
import { getAssetTokenFromNativeToken, getNativeTokenFromAssetToken } from "@/app/services/tokenServices";
import { useAppContext } from "@/app/state/hook";
import { InputEditedProps, PoolCardProps, PoolsTokenMetadata, TokenDecimalsErrorProps } from "@/app/types";
import { ActionType, InputEditedType, TransactionTypes } from "@/app/types/enum";
import { calculateSlippageReduce, checkIfPoolAlreadyExists, convertToBaseUnit, formatDecimalsFromToken, formatInputTokenValue } from "@/app/utils/helper";
import dotAcpToast from "@/app/utils/toast";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { FC, useEffect, useMemo, useState } from "react";
import CreatePool from "../create-pool";
import Decimal from "decimal.js";
import { ApiPromise, WsProvider } from '@polkadot/api';

type AssetTokenProps = {
  tokenSymbol: string;
  assetTokenId: string;
  decimals: string;
  assetTokenBalance: string;
};
type NativeTokenProps = {
  nativeTokenSymbol: string;
  nativeTokenDecimals: string;
  tokenId: string;
  tokenBalance: string;
};
type TokenValueProps = {
  tokenValue: string;
};

type AddPoolLiquidityProps = {
  tokenBId?: { id: string };
};


const AddPoolLiquidity: FC<AddPoolLiquidityProps> = ({ tokenBId }: AddPoolLiquidityProps) => {
  
  const { state, dispatch } = useAppContext();
  const { assethubSubscanUrl, rpcUrl } = useGetNetwork();
  const [nativeTokenValue, setNativeTokenValue] = useState<string>("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const params = tokenBId ? tokenBId : { id };

  const {
    tokenBalances,
    api,
    selectedAccount,
    pools,
    transferGasFeesMessage,
    poolGasFee,
    successModalOpen,
    addLiquidityLoading,
    exactNativeTokenAddLiquidity,
    exactAssetTokenAddLiquidity,
    assetLoading,
    isTokenCanNotCreateWarningPools,
    poolsCards,
  } = state;

  const [selectedTokenA, setSelectedTokenA] = useState<NativeTokenProps>({
    nativeTokenSymbol: "",
    nativeTokenDecimals: "",
    tokenId: "",
    tokenBalance: "",
  });
  const [selectedTokenB, setSelectedTokenB] = useState<AssetTokenProps>({
    tokenSymbol: "",
    assetTokenId: "",
    decimals: "",
    assetTokenBalance: "",
  });
  const [selectedTokenNativeValue, setSelectedTokenNativeValue] = useState<TokenValueProps>();
  const [selectedTokenAssetValue, setSelectedTokenAssetValue] = useState<TokenValueProps>();
  const [nativeTokenWithSlippage, setNativeTokenWithSlippage] = useState<TokenValueProps>({ tokenValue: "" });
  const [assetTokenWithSlippage, setAssetTokenWithSlippage] = useState<TokenValueProps>({ tokenValue: "" });
  const [slippageAuto, setSlippageAuto] = useState<boolean>(true);
  const [slippageValue, setSlippageValue] = useState<number | undefined>(15);
  const [inputEdited, setInputEdited] = useState<InputEditedProps>({ inputType: InputEditedType.exactIn });
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [poolExists, setPoolExists] = useState<boolean>(false);
  const [reviewModalOpen, setReviewModalOpen] = useState<boolean>(false);
  const [tooManyDecimalsError, setTooManyDecimalsError] = useState<TokenDecimalsErrorProps>({
    tokenSymbol: "",
    isError: false,
    decimalsAllowed: 0,
  });

  const [isTransactionTimeout, setIsTransactionTimeout] = useState<boolean>(false);
  const [waitingForTransaction, setWaitingForTransaction] = useState<NodeJS.Timeout>();
  const [assetBPriceOfOneAssetA, setAssetBPriceOfOneAssetA] = useState<string>("");
  const [priceImpact, setPriceImpact] = useState<string>("");
  const [pool, setPool] = useState<PoolCardProps>();
  const [nativeTokens, setNativeTokens] = useState<string>("");
  const [assetTokens, setAssetTokens] = useState<string>("");
  const [native_Token, setNative_Token] = useState<PoolsTokenMetadata[]>([{
    tokenId: "",
    assetTokenMetadata: {
      symbol: tokenBalances?.tokenSymbol as string,
      name: tokenBalances?.tokenSymbol as string,
      decimals: tokenBalances?.tokenDecimals as string,
    },
    tokenAsset: {
      balance: tokenBalances?.balance,
    },
  }])

  const nativeToken = native_Token[0];

  useEffect(() => {
    if (tokenBalances) {
      setNative_Token([{
        tokenId: "",
        assetTokenMetadata: {
          symbol: tokenBalances?.tokenSymbol as string,
          name: tokenBalances?.tokenSymbol as string,
          decimals: tokenBalances?.tokenDecimals as string,
        },
        tokenAsset: {
          balance: tokenBalances?.balance,
        },
      }]);
    } else {
      const getNativeTokenInfo = async () => {
        // Connect to the blockchain
        const provider = new WsProvider(rpcUrl); // Use the appropriate WebSocket endpoint
        const api = await ApiPromise.create({ provider });

        // Get native token information
        const symbols = api.registry.chainTokens; // Symbol(s) of the native token
        const decimals = api.registry.chainDecimals; // Decimals of the native token

        setNative_Token([{
          tokenId: "",
          assetTokenMetadata: {
            symbol: symbols[0],
            name: symbols[0],
            decimals: decimals[0],
          },
          tokenAsset: {
            balance: 0,
          },
        }]);

        // Example: Get existential deposit (minimum balance)
        const existentialDeposit = api.consts.balances.existentialDeposit.toHuman();
        console.log('Existential Deposit:', existentialDeposit);

        await api.disconnect(); // Disconnect from the chain
      };
      getNativeTokenInfo()
    }
  }, [tokenBalances])

  const selectedNativeTokenNumber = new Decimal(selectedTokenNativeValue?.tokenValue || 0);
  const selectedAssetTokenNumber = new Decimal(selectedTokenAssetValue?.tokenValue || 0);

  const navigateToPools = () => {
    router.push("/dashboard/pools");
  };

  useEffect(()=>{
    console.log("selectedTokens", selectedTokenA, selectedTokenB)
  },[selectedTokenB])

  useEffect(()=>{
    getPool();
    if(pool !== undefined){
      setNativeTokens(pool.totalTokensLocked.nativeToken.formattedValue)
      setAssetTokens(pool.totalTokensLocked.assetToken.formattedValue)
    }
  },[pool, selectedTokenB])

  const getPool = () => {
    const pool = poolsCards.filter((item)=>item.assetTokenId === selectedTokenB.assetTokenId);
    setPool(pool[0]);
  }

  const populateAssetToken = () => {
    pools?.forEach((pool: any) => {
      if (pool?.[0]?.[1]?.interior?.X2) {
        if (pool?.[0]?.[1]?.interior?.X2?.[1]?.GeneralIndex?.replace(/[, ]/g, "").toString() === params?.id) {
          if (params?.id) {
            const tokenAlreadySelected = tokenBalances?.assets?.find((token: any) => {
              if (params?.id) {
                return token.tokenId === params?.id.toString();
              }
            });
            if (tokenAlreadySelected) {
              setSelectedTokenB({
                tokenSymbol: tokenAlreadySelected?.assetTokenMetadata?.symbol,
                assetTokenId: params?.id,
                decimals: tokenAlreadySelected?.assetTokenMetadata?.decimals,
                assetTokenBalance: tokenAlreadySelected?.tokenAsset?.balance,
              });
            }
          }
        }
      }
    });
  };

    useEffect(() => {
    if (selectedTokenB.assetTokenId) {
      getPriceOfAssetFromNative();
    }
  }, [selectedTokenB.assetTokenId]);

  const getPriceOfAssetFromNative = async () => {
    if (api) {
      const valueWithDecimals = formatInputTokenValue(
        "1",
        nativeToken.assetTokenMetadata.decimals
      );

      const assetTokenPrice = await getAssetTokenFromNativeToken(
        api,
        selectedTokenB.assetTokenId,
        valueWithDecimals
      );

      if (assetTokenPrice) {
        // setLowTradingMinimum(assetTokenPrice === "0");
        const assetTokenNoSemicolons = assetTokenPrice.toString()?.replace(/[, ]/g, "");
        const assetTokenNoDecimals = formatDecimalsFromToken(
          parseFloat(assetTokenNoSemicolons),
          selectedTokenB.decimals
        );
        setNativeTokenValue((Number(assetTokenNoDecimals)).toString());
      }
    }
  };

  const handlePool = async () => {
    setReviewModalOpen(false);
    if (waitingForTransaction) {
      clearTimeout(waitingForTransaction);
    }
    setIsTransactionTimeout(false);
    if (api && selectedTokenNativeValue && selectedTokenAssetValue) {
      const nativeTokenValue = formatInputTokenValue(selectedNativeTokenNumber, selectedTokenA?.nativeTokenDecimals)
        .toLocaleString()
        ?.replace(/[, ]/g, "");

      const assetTokenValue = formatInputTokenValue(selectedAssetTokenNumber, selectedTokenB.decimals)
        .toLocaleString()
        ?.replace(/[, ]/g, "");

      try {
        await addLiquidity(
          api,
          selectedTokenB.assetTokenId,
          selectedAccount,
          nativeTokenValue,
          assetTokenValue,
          nativeTokenWithSlippage.tokenValue.toString(),
          assetTokenWithSlippage.tokenValue.toString(),
          selectedTokenA.nativeTokenDecimals,
          selectedTokenB.decimals,
          dispatch
        );
      } catch (error) {
        dotAcpToast.error(`Error: ${error}`);
      }
    }
  };

  const handleAddPoolLiquidityGasFee = async () => {
    if (api && selectedTokenNativeValue && selectedTokenAssetValue) {
      const nativeTokenValue = formatInputTokenValue(selectedNativeTokenNumber, selectedTokenA?.nativeTokenDecimals);

      const assetTokenValue = formatInputTokenValue(selectedAssetTokenNumber, selectedTokenB.decimals);

      await checkAddPoolLiquidityGasFee(
        api,
        selectedTokenB.assetTokenId,
        selectedAccount,
        nativeTokenValue,
        assetTokenValue,
        nativeTokenWithSlippage.tokenValue.toString(),
        assetTokenWithSlippage.tokenValue.toString(),
        dispatch
      );
    }
  };

  const updateTokenBalances = async () => {
    if (api) {
      const walletAssets: any = await setTokenBalanceUpdate(
        api,
        selectedAccount.address,
        selectedTokenB.assetTokenId,
        tokenBalances
      );
      dispatch({ type: ActionType.SET_TOKEN_BALANCES, payload: walletAssets });
    }
  }

  const closeSuccessModal = async () => {
    dispatch({ type: ActionType.SET_SUCCESS_MODAL_OPEN, payload: false });
    navigateToPools();
  };

  const getPriceOfAssetTokenFromNativeToken = async (value: string) => {
    if (api) {
      const valueWithDecimals = formatInputTokenValue(value, selectedTokenA?.nativeTokenDecimals);

      const assetTokenPrice = await getAssetTokenFromNativeToken(api, selectedTokenB?.assetTokenId, valueWithDecimals);

      if (assetTokenPrice && slippageValue) {
        const assetTokenNoSemicolons = assetTokenPrice.toString()?.replace(/[, ]/g, "");

        const assetTokenNoDecimals = formatDecimalsFromToken(assetTokenNoSemicolons, selectedTokenB?.decimals);

        const tokenWithSlippage = calculateSlippageReduce(assetTokenNoDecimals, slippageValue);
        const tokenWithSlippageFormatted = formatInputTokenValue(tokenWithSlippage, selectedTokenB?.decimals);

        setSelectedTokenAssetValue({ tokenValue: assetTokenNoDecimals });
        setAssetTokenWithSlippage({ tokenValue: tokenWithSlippageFormatted });
      }
    }
  };

  const getPriceOfNativeTokenFromAssetToken = async (value: string) => {
    if (api) {
      const valueWithDecimals = formatInputTokenValue(value, selectedTokenB?.decimals);

      const nativeTokenPrice = await getNativeTokenFromAssetToken(api, selectedTokenB?.assetTokenId, valueWithDecimals);

      if (nativeTokenPrice && slippageValue) {
        const nativeTokenNoSemicolons = nativeTokenPrice.toString()?.replace(/[, ]/g, "");

        const nativeTokenNoDecimals = formatDecimalsFromToken(
          nativeTokenNoSemicolons,
          selectedTokenA?.nativeTokenDecimals
        );

        const tokenWithSlippage = calculateSlippageReduce(nativeTokenNoDecimals, slippageValue);
        const tokenWithSlippageFormatted = formatInputTokenValue(
          tokenWithSlippage,
          selectedTokenA?.nativeTokenDecimals
        );

        setSelectedTokenNativeValue({ tokenValue: nativeTokenNoDecimals.toString() });
        setNativeTokenWithSlippage({ tokenValue: tokenWithSlippageFormatted });
      }
    }
  };

  const setSelectedTokenAValue = (value: string) => {
    setInputEdited({ inputType: InputEditedType.exactIn });
    if (slippageValue && value !== "") {
      value = new Decimal(value).toFixed();
      if (value.includes(".")) {
        if (value.split(".")[1].length > parseInt(selectedTokenA.nativeTokenDecimals)) {
          setTooManyDecimalsError({
            tokenSymbol: selectedTokenA.nativeTokenSymbol,
            isError: true,
            decimalsAllowed: parseInt(selectedTokenA.nativeTokenDecimals),
          });
          return;
        }
      }

      setTooManyDecimalsError({
        tokenSymbol: "",
        isError: false,
        decimalsAllowed: 0,
      });

      const nativeTokenSlippageValue = calculateSlippageReduce(value, slippageValue);
      const tokenWithSlippageFormatted = formatInputTokenValue(
        nativeTokenSlippageValue,
        selectedTokenA?.nativeTokenDecimals
      );
      setSelectedTokenNativeValue({ tokenValue: value });
      setNativeTokenWithSlippage({ tokenValue: tokenWithSlippageFormatted });
      getPriceOfAssetTokenFromNativeToken(value);
    } else {
      setSelectedTokenAssetValue({ tokenValue: "" });
    }
  };

  const setSelectedTokenBValue = (value: string) => {
    setInputEdited({ inputType: InputEditedType.exactOut });
    if (slippageValue && value !== "") {
      value = new Decimal(value).toFixed();
      if (value.includes(".")) {
        if (value.split(".")[1].length > parseInt(selectedTokenB.decimals)) {
          setTooManyDecimalsError({
            tokenSymbol: selectedTokenB.tokenSymbol,
            isError: true,
            decimalsAllowed: parseInt(selectedTokenB.decimals),
          });
          return;
        }
      }

      setTooManyDecimalsError({
        tokenSymbol: "",
        isError: false,
        decimalsAllowed: 0,
      });

      const assetTokenSlippageValue = calculateSlippageReduce(value, slippageValue);
      const tokenWithSlippageFormatted = formatInputTokenValue(assetTokenSlippageValue, selectedTokenB?.decimals);
      setSelectedTokenAssetValue({ tokenValue: value });
      setAssetTokenWithSlippage({ tokenValue: tokenWithSlippageFormatted });
      getPriceOfNativeTokenFromAssetToken(value);
    } else {
      setSelectedTokenNativeValue({ tokenValue: "" });
    }
  };

  const getButtonProperties = useMemo(() => {
    if (tokenBalances?.assets) {
      if (selectedTokenA.nativeTokenSymbol === "" || selectedTokenB.assetTokenId === "") {
        return { label: "Select token", disabled: true };
      }

      if (
        selectedNativeTokenNumber.lte(0) ||
        selectedAssetTokenNumber.lte(0) ||
        selectedTokenNativeValue?.tokenValue === "" ||
        selectedTokenAssetValue?.tokenValue === ""
      ) {
        return { label: "Enter amount", disabled: true };
      }

      if (selectedNativeTokenNumber.gt(tokenBalances.balance)) {
        return {
          label: `Insufficient ${selectedTokenA.nativeTokenSymbol} token amount`,
          disabled: true,
        };
      }

      const fee = convertToBaseUnit(poolGasFee);
      console.log("fee", poolGasFee, fee, selectedNativeTokenNumber.plus(fee), tokenBalances.balance, selectedNativeTokenNumber.plus(fee).gt(tokenBalances.balance));
      if (selectedNativeTokenNumber.plus(fee).gt(tokenBalances.balance)) {
        return {
          label: `Insufficient ${selectedTokenA.nativeTokenSymbol} token amount`,
          disabled: true,
        };
      }

      const assetTokenBalance = new Decimal(selectedTokenB.assetTokenBalance?.replace(/[, ]/g, ""));
      const assetTokenBalnceFormatted = formatDecimalsFromToken(assetTokenBalance, selectedTokenB.decimals);
      if (selectedAssetTokenNumber.gt(assetTokenBalnceFormatted)) {
        return {
          label: `Insufficient ${selectedTokenB.tokenSymbol} token amount`,
          disabled: true,
        };
      }

      if (selectedNativeTokenNumber.gt(0) && selectedAssetTokenNumber.gt(0) && !tooManyDecimalsError.isError) {
        return { label: "Deposit", disabled: false };
      }

      if (selectedNativeTokenNumber.gt(0) && selectedAssetTokenNumber.gt(0) && tooManyDecimalsError.isError) {
        return { label: "Deposit", disabled: true };
      }
    } else {
      return { label: "Connect wallet", disabled: true };
    }

    return { label: "Enter amount", disabled: true };
  }, [tokenBalances?.assets, tokenBalances?.balance, selectedTokenA.nativeTokenSymbol, selectedTokenB.assetTokenId, selectedTokenB.assetTokenBalance, selectedTokenB.decimals, selectedTokenB.tokenSymbol, selectedNativeTokenNumber, selectedAssetTokenNumber, selectedTokenNativeValue?.tokenValue, selectedTokenAssetValue?.tokenValue, poolGasFee, tooManyDecimalsError.isError]);

  const calculatePriceImpact = async () => {
    if (api) {
      if (selectedTokenNativeValue?.tokenValue !== "" && selectedTokenAssetValue?.tokenValue !== "") {
        const poolSelected: any = pools?.find(
          (pool: any) =>
            pool?.[0]?.[1]?.interior?.X2?.[1]?.GeneralIndex?.replace(/[, ]/g, "") === selectedTokenB.assetTokenId
        );
        if (poolSelected && selectedTokenNativeValue?.tokenValue && selectedTokenAssetValue?.tokenValue) {
          const poolReserve: any = await getPoolReserves(
            api,
            poolSelected?.[0]?.[1]?.interior?.X2?.[1]?.GeneralIndex?.replace(/[, ]/g, "")
          );

          const assetTokenReserve = formatDecimalsFromToken(
            poolReserve?.[1]?.replace(/[, ]/g, ""),
            selectedTokenB.decimals
          );

          const nativeTokenReserve = formatDecimalsFromToken(
            poolReserve?.[0]?.replace(/[, ]/g, ""),
            selectedTokenA.nativeTokenDecimals
          );

          const priceBeforeSwap = new Decimal(nativeTokenReserve).div(assetTokenReserve);

          const priceOfAssetBForOneAssetA = new Decimal(assetTokenReserve).div(nativeTokenReserve);
          setAssetBPriceOfOneAssetA(priceOfAssetBForOneAssetA.toFixed(5));

          const valueA = new Decimal(selectedTokenNativeValue?.tokenValue).add(nativeTokenReserve);
          const valueB = new Decimal(assetTokenReserve).minus(selectedTokenAssetValue?.tokenValue);

          const priceAfterSwap = valueA.div(valueB);

          const priceImpact = new Decimal(1).minus(priceBeforeSwap.div(priceAfterSwap));

          setPriceImpact(priceImpact.mul(100).toFixed(2));
        }
      }
    }
  };

  useEffect(() => {
    calculatePriceImpact();
  }, [selectedTokenB.tokenSymbol, selectedTokenAssetValue?.tokenValue, selectedTokenNativeValue?.tokenValue]);

  useEffect(() => {
    if (tokenBalances) {
      setSelectedTokenA({
        nativeTokenSymbol: tokenBalances.tokenSymbol,
        nativeTokenDecimals: tokenBalances.tokenDecimals,
        tokenId: "",
        tokenBalance: tokenBalances.balance.toString(),
      });
    }
  }, [tokenBalances]);

  useEffect(() => {
    if (Number(nativeTokenWithSlippage.tokenValue) > 0 && Number(assetTokenWithSlippage.tokenValue) > 0) {
      handleAddPoolLiquidityGasFee();
    }
  }, [nativeTokenWithSlippage.tokenValue, assetTokenWithSlippage.tokenValue]);

  useEffect(() => {
    dispatch({ type: ActionType.SET_TRANSFER_GAS_FEES_MESSAGE, payload: "" });
  }, []);

  useEffect(() => {
    if (params?.id) {
      populateAssetToken();
    }
  }, [params?.id]);

  useEffect(() => {
    if (
      selectedTokenNativeValue &&
      inputEdited.inputType === InputEditedType.exactIn &&
      selectedNativeTokenNumber.gt(0)
    ) {
      setSelectedTokenAValue(selectedTokenNativeValue.tokenValue);
    } else if (
      selectedTokenAssetValue &&
      inputEdited.inputType === InputEditedType.exactOut &&
      selectedAssetTokenNumber.gt(0)
    ) {
      setSelectedTokenBValue(selectedTokenAssetValue.tokenValue);
    }
  }, [slippageValue]);

  useEffect(() => {
    if (tokenBId?.id) {
      const checkPoolExists = checkIfPoolAlreadyExists(tokenBId.id, pools);
      setPoolExists(checkPoolExists);
    }
  }, [tokenBId?.id]);

  useEffect(() => {
    if (tokenBId?.id) {
      const checkPoolExists = checkIfPoolAlreadyExists(selectedTokenB.assetTokenId, pools);
      setPoolExists(checkPoolExists);
    }
  }, [selectedTokenB.assetTokenId]);

  useEffect(() => {
    if (Object.keys(selectedAccount).length === 0) {
      navigateToPools();
    }
  }, [selectedAccount]);

  useEffect(() => {
    dispatch({ type: ActionType.SET_TOKEN_CAN_NOT_CREATE_WARNING_POOLS, payload: false });
  }, [selectedTokenB.assetTokenId, selectedTokenNativeValue, selectedTokenAssetValue]);

  useEffect(() => {
    if (addLiquidityLoading) {
      setWaitingForTransaction(
        setTimeout(() => {
          if (addLiquidityLoading) {
            setIsTransactionTimeout(true);
            dispatch({ type: ActionType.SET_ADD_LIQUIDITY_LOADING, payload: false });
          }
        }, 180000)
      ); // 3 minutes 180000
    } else {
      if (waitingForTransaction) {
        clearTimeout(waitingForTransaction);
      }
      if (!reviewModalOpen) {
        updateTokenBalances();
      }
    }
  }, [addLiquidityLoading]);

  return (
    <>
      <div className="sm:w-[540px] w-[95%] rounded-2xl sm:rounded-[50px] sm:box-shadow-out bg-gradient-to-r from-[#5100FE] to-[#B4D2FF] dark:bg-gradient-to-b dark:from-[#5100FE] dark:to-[#5100FE] p-0.5">
        <div className="flex flex-col gap-6 h-full w-full bg-gradient-to-br from-[#2B0281] via-[#1D0058] to-[#220068] dark:bg-gradient-to-t dark:from-[#E8E8E8] dark:to-[#E8E8E8] rounded-2xl sm:rounded-[50px] p-7 sm:p-14">
          <TokenSelectionInput
            tokenText={selectedTokenA?.nativeTokenSymbol}
            tokenBalance={selectedTokenA.tokenBalance}
            tokenId={selectedTokenA.tokenId}
            tokenDecimals={selectedTokenA.nativeTokenDecimals}
            tokenValue={selectedTokenNativeValue?.tokenValue}
            onClick={() => null}
            onSetTokenValue={(value) => setSelectedTokenAValue(value)}
            selectDisabled={true}
            disabled={addLiquidityLoading}
            assetLoading={assetLoading}
          />
          <div className="flex flex-row justify-center items-center">
            <Image
              width={40}
              height={40}
              src="/swap-icons/plus-icon.png"
              alt="Plus Icon"
              className="w-10 h-10 cursor-pointer hover:scale-105"
            />
          </div>

          <TokenSelectionInput
            tokenText={selectedTokenB?.tokenSymbol}
            tokenBalance={selectedTokenB.assetTokenBalance}
            tokenId={selectedTokenB.assetTokenId}
            tokenDecimals={selectedTokenB.decimals}
            tokenValue={selectedTokenAssetValue?.tokenValue}
            onClick={() => setIsModalOpen(true)}
            onSetTokenValue={(value) => setSelectedTokenBValue(value)}
            selectDisabled={!tokenBId?.id}
            disabled={addLiquidityLoading}
            assetLoading={assetLoading}
          />
          <div className="mt-1 text-small">{transferGasFeesMessage}</div>
          <div className=" border border-[#B4D2FF] dark:border dark:border-none dark:bg-white rounded-2xl py-5 px-6 gap-4 text-sm sm:text-lg font-bold">
            <div className="flex flex-row justify-between">
              <p>Base</p>
              <p className="text-white dark:text-[#5100FE] ">{selectedTokenA.nativeTokenSymbol}</p>
            </div>
            <div className="flex flex-row justify-between">
              <p>Pool liquidity ({selectedTokenA.nativeTokenSymbol})</p>
              <p className="dark:text-[#5100FE] text-white">{parseFloat(nativeTokens).toFixed(3)}</p>
            </div>
            <div className="flex flex-row justify-between">
              <p>Pool liquidity ({selectedTokenB.tokenSymbol})</p>
              <p className="dark:text-[#5100FE] text-white">{parseFloat(assetTokens).toFixed(3)}</p>
            </div>
            <div className="flex flex-row justify-between">
              <p>LP supply</p>
              <p className="dark:text-[#5100FE] text-white">_ _</p>
            </div>
            <div className="flex flex-row justify-between">
              <div className="flex flex-row justify-start items-center gap-1">
                <p>Initial Price </p>
                <CircleQuestionIcon color="#B4D2FF" dark_color="#32009C" />
              </div>
              <p className="dark:text-[#5100FE] text-white">
                0.888 {selectedTokenB.tokenSymbol}/{selectedTokenA.nativeTokenSymbol}
              </p>
            </div>
            <div className="flex flex-row justify-between">
              <p>Current Price </p>
              <p className="dark:text-[#5100FE] text-white">
                1 {selectedTokenA.nativeTokenSymbol} = {parseFloat(nativeTokenValue).toFixed(2)} {selectedTokenB.tokenSymbol}
              </p>
            </div>
            <div className="flex flex-row justify-between">
              <p>Start Time</p>
              <p className="dark:text-[#5100FE] text-white">NOW</p>
            </div>
            <div className="flex flex-row -ml-1">
              <div className="text-[#b4d2ff7e] dark:text-[#32009C] sm:text-base inline">
                <p className="inline">Note: A creation fee of 10 DOT is required for new pools.{" "}</p>
                <CircleQuestionIcon className="inline-block" color="#b4d2ff7e" dark_color="#32009C" />
              </div>
            </div>
          </div>

          {poolExists ? (
            <div className="flex rounded-lg bg-lime-500 px-4 py-2 text-medium font-normal text-cyan-700">
              {"No need to create a new pool. Liquidity can be added to the existing one."}
            </div>
          ) : null}
          {/* {selectedTokenNativeValue?.tokenValue && selectedTokenAssetValue?.tokenValue && (
            <>
              {" "}
              <div className="flex w-full flex-col gap-2 rounded-lg bg-purple-50 px-2 py-4">
                <div className="flex w-full flex-row text-medium font-normal text-gray-200">
                  <span>
                    1 {selectedTokenA.nativeTokenSymbol} = {assetBPriceOfOneAssetA} {selectedTokenB.tokenSymbol}
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
                      ? selectedTokenAssetValue.tokenValue + " " + selectedTokenB.tokenSymbol
                      : selectedTokenNativeValue.tokenValue + " " + selectedTokenA.nativeTokenSymbol}
                  </span>
                </div>
                <div className="flex w-full flex-row justify-between text-medium font-normal text-gray-200">
                  <div className="flex">
                    {inputEdited.inputType === InputEditedType.exactIn ? "Minimum output" : "Maximum input"}
                  </div>
                  <span>
                    {inputEdited.inputType === InputEditedType.exactIn
                      ? formatDecimalsFromToken(assetTokenWithSlippage?.tokenValue, selectedTokenB.decimals) +
                      " " +
                      selectedTokenB.tokenSymbol
                      : formatDecimalsFromToken(
                        nativeTokenWithSlippage?.tokenValue,
                        selectedTokenA.nativeTokenDecimals
                      ) +
                      " " +
                      selectedTokenA.nativeTokenSymbol}
                  </span>
                </div>
              </div>
            </>
          )} */}

          <div>
            <MainButton
              onClick={() => (getButtonProperties.disabled ? null : setReviewModalOpen(true))}
              disabled={getButtonProperties.disabled || addLiquidityLoading}
              content={addLiquidityLoading ? <LottieMedium /> : getButtonProperties.label}
              className="justify-center text-lg py-1.5 rounded-md sm:rounded-xl bg-gradient-to-r"
            />
          </div>
        </div>
      </div>
      <div className="sm:w-[540px] w-[95%] flex flex-col justify-start gap-3 sm:gap-6 ">
        <div className="px-3">
          <p className="font-bold sm:text-3xl text-white dark:text-[#120038]">
            Your Liquidity
          </p>
        </div>
        <div className="bg-gradient-to-r from-[#220068] via-[#1D0058] to-[#2B0281] dark:bg-gradient-to-r dark:from-[#E8E8E8] dark:to-[#E8E8E8] rounded-md sm:rounded-3xl px-3 sm:px-8 py-2.5 sm:py-6">
          <p className="font-bold text-[#B4D2FF80] dark:text-[#120038] text-left text-sm">
            If you staked your LP tokens in a farm, unstake them to see them
            here
          </p>
        </div>
      </div>

      <ReviewTransactionModal
        open={reviewModalOpen}
        title="Review adding liquidity"
        transactionType={TransactionTypes.add}
        priceImpact={priceImpact}
        inputValueA={selectedTokenNativeValue ? selectedTokenNativeValue?.tokenValue : ""}
        inputValueB={selectedTokenAssetValue ? selectedTokenAssetValue?.tokenValue : ""}
        tokenValueA={
          inputEdited.inputType === InputEditedType.exactIn
            ? selectedTokenAssetValue?.tokenValue
            : selectedTokenNativeValue?.tokenValue
        }
        tokenValueB={
          inputEdited.inputType === InputEditedType.exactIn
            ? formatDecimalsFromToken(assetTokenWithSlippage?.tokenValue, selectedTokenB.decimals)
            : formatDecimalsFromToken(nativeTokenWithSlippage?.tokenValue, selectedTokenA.nativeTokenDecimals)
        }
        tokenSymbolA={
          inputEdited.inputType === InputEditedType.exactIn
            ? selectedTokenB.tokenSymbol
            : selectedTokenA.nativeTokenSymbol
        }
        tokenSymbolB={
          inputEdited.inputType === InputEditedType.exactIn
            ? selectedTokenB.tokenSymbol
            : selectedTokenA.nativeTokenSymbol
        }
        onClose={() => {
          setReviewModalOpen(false);
        }}
        inputType={inputEdited.inputType}
        onConfirmTransaction={() => {
          handlePool();
        }}
      />
      <PoolSelectTokenModal
        onSelect={setSelectedTokenB}
        onClose={() => setIsModalOpen(false)}
        open={isModalOpen}
        title={"Select token"}
        selected={selectedTokenB}
      />
      <SwapPoolResultModal
        open={successModalOpen}
        onClose={closeSuccessModal}
        contentTitle={"Pool successfully created"}
        tokenA={{
          value: exactNativeTokenAddLiquidity,
          symbol: selectedTokenA.nativeTokenSymbol,
        }}
        tokenB={{
          value: exactAssetTokenAddLiquidity,
          symbol: selectedTokenB.tokenSymbol,
        }}
        actionLabel={"added"}
      />
      <WarningMessage
        show={tooManyDecimalsError.isError}
        message={`Too many ${tooManyDecimalsError.tokenSymbol} token decimals, please reduce, maximum allowed for this token is ${tooManyDecimalsError.decimalsAllowed} decimals.`}
      />
      <WarningMessage
        show={isTokenCanNotCreateWarningPools}
        message={"Your account has reached the limit of 16 assets and liquidity pools total. Burn or send all of assets of a certain type from your account, or withdraw all assets from a pool to make room for another type. Alternatively connect another wallet and use it for new assets and pools."}
      />
      <WarningMessage
        show={isTransactionTimeout}
        message={`It seems that the transaction is taking longer than usual.\nPlease check the status of the transaction in your wallet by clicking on ${assethubSubscanUrl}/account/${selectedAccount.address}`}
      />
    </>
  );
}

export default AddPoolLiquidity;
