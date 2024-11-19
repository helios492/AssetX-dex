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
import { checkCreatePoolGasFee, createPool, getAllLiquidityPoolsTokensMetadata } from "@/app/services/poolServices";
import { useAppContext } from "@/app/state/hook";
import { PoolsTokenMetadata, TokenDecimalsErrorProps } from "@/app/types";
import { ActionType, TransactionTypes } from "@/app/types/enum";
import { calculateSlippageReduce, checkIfPoolAlreadyExists, convertToBaseUnit, formatDecimalsFromToken, formatInputTokenValue } from "@/app/utils/helper";
import dotAcpToast from "@/app/utils/toast";
import Decimal from "decimal.js";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FC, useEffect, useMemo, useState } from "react";
import AddPoolLiquidity from "../add-pool-liquidity";
import { ApiPromise, WsProvider } from '@polkadot/api';
import { getAssetTokenFromNativeToken, getNativeTokenFromAssetToken } from "@/app/services/tokenServices";

type AssetTokenProps = {
  tokenSymbol: string;
  assetTokenId: string;
  decimals: string;
  assetTokenBalance: string;
};

type NativeTokenProps = {
  nativeTokenSymbol: any;
  nativeTokenDecimals: any;
  tokenId: string;
  tokenBalance: string;
};

type TokenValueProps = {
  tokenValue: string;
};

type CreatePoolProps = {
  tokenASymbol: string;
  tokenBSymbol: string;
  tokenBSelected?: AssetTokenProps;
};


const CreatePool: FC<CreatePoolProps> = ({ tokenASymbol, tokenBSymbol, tokenBSelected }) => {
  const { state, dispatch } = useAppContext();
  const { assethubSubscanUrl, rpcUrl } = useGetNetwork();

  const router = useRouter();

  const {
    tokenBalances,
    api,
    selectedAccount,
    pools,
    transferGasFeesMessage,
    poolGasFee,
    successModalOpen,
    createPoolLoading,
    addLiquidityLoading,
    assetLoading,
    isTokenCanNotCreateWarningPools,
    poolsTokenMetadata,
  } = state;

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
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
  const [poolExists, setPoolExists] = useState<boolean>(false);
  const [assetTokenMinValueExceeded, setAssetTokenMinValueExceeded] = useState<boolean>(false);
  const [assetTokenMinValue, setAssetTokenMinValue] = useState<string>("");
  const [reviewModalOpen, setReviewModalOpen] = useState<boolean>(false);
  const [nativeTokenValue, setNativeTokenValue] = useState<string>("");
  const [tooManyDecimalsError, setTooManyDecimalsError] = useState<TokenDecimalsErrorProps>({
    tokenSymbol: "",
    isError: false,
    decimalsAllowed: 0,
  });

  const [isTransactionTimeout, setIsTransactionTimeout] = useState<boolean>(false);
  const [waitingForTransaction, setWaitingForTransaction] = useState<NodeJS.Timeout>();
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

  useEffect(() => {
    if (tokenASymbol && tokenBSymbol) {
      const tokenA = poolsTokenMetadata.concat(nativeToken).filter((item: any) => item.assetTokenMetadata.symbol?.toLowerCase() === tokenASymbol?.toLowerCase())
      const tokenB = poolsTokenMetadata.concat(nativeToken).filter((item: any) => item.assetTokenMetadata.symbol?.toLowerCase() === tokenBSymbol?.toLowerCase())
      setSelectedTokenA({
        nativeTokenSymbol: tokenA[0]?.assetTokenMetadata?.symbol || '',
        nativeTokenDecimals: tokenA[0]?.assetTokenMetadata?.decimals || '',
        tokenId: tokenA[0]?.tokenId || '',
        tokenBalance: String(tokenA[0]?.tokenAsset?.balance || '0')
      });
      setSelectedTokenB({
        tokenSymbol: tokenB[0]?.assetTokenMetadata?.symbol || '',
        assetTokenId: tokenB[0]?.tokenId || '',
        decimals: tokenB[0]?.assetTokenMetadata?.decimals || '',
        assetTokenBalance: String(tokenB[0]?.tokenAsset?.balance || '0')
      })
    }
  }, [tokenASymbol, tokenBSymbol, poolsTokenMetadata, nativeToken])

  useEffect(() => {
    if (selectedTokenB.assetTokenId) {
      getPriceOfNativeFromAsset();
    }
  }, [selectedTokenB.assetTokenId]);

  const getPriceOfNativeFromAsset = async () => {
    if (api) {
      const valueWithDecimals = formatInputTokenValue(
        "1",
        selectedTokenB.decimals
      );

      const nativeTokenPrice = await getNativeTokenFromAssetToken(
        api,
        selectedTokenB.assetTokenId,
        valueWithDecimals
      );

      if (nativeTokenPrice) {
        const nativeTokenNoSemicolons = nativeTokenPrice.toString()?.replace(/[, ]/g, "");
        const nativeTokenNoDecimals = formatDecimalsFromToken(
          parseFloat(nativeTokenNoSemicolons),
          nativeToken.assetTokenMetadata.decimals
        );
          setNativeTokenValue(nativeTokenNoDecimals.toString());
      }
    }
  };

  const selectedNativeTokenNumber = new Decimal(selectedTokenNativeValue?.tokenValue || 0);
  const selectedAssetTokenNumber = new Decimal(selectedTokenAssetValue?.tokenValue || 0);

  const navigateToPools = () => {
    router.push("/dashboard/pools");
  };

  const handlePool = async () => {
    if (waitingForTransaction) {
      clearTimeout(waitingForTransaction);
    }
    setIsTransactionTimeout(false);
    if (api && selectedTokenAssetValue && selectedTokenNativeValue) {
      const nativeTokenValue = formatInputTokenValue(selectedNativeTokenNumber, selectedTokenA?.nativeTokenDecimals)
        .toLocaleString()
        ?.replace(/[, ]/g, "");

      const assetTokenValue = formatInputTokenValue(selectedAssetTokenNumber, selectedTokenB.decimals)
        .toLocaleString()
        ?.replace(/[, ]/g, "");

      try {
        await createPool(
          api,
          selectedTokenB.assetTokenId,
          selectedAccount,
          nativeTokenValue,
          assetTokenValue,
          nativeTokenWithSlippage.tokenValue,
          assetTokenWithSlippage.tokenValue,
          selectedTokenA.nativeTokenDecimals,
          selectedTokenB.decimals,
          dispatch
        );
      } catch (error) {
        dotAcpToast.error(`Error: ${error}`);
      }
    }
  };

  const handlePoolGasFee = async () => {
    if (api) await checkCreatePoolGasFee(api, selectedTokenB.assetTokenId, selectedAccount, dispatch);
  };

  const closeSuccessModal = async () => {
    dispatch({ type: ActionType.SET_SUCCESS_MODAL_OPEN, payload: false });
    navigateToPools();
    if (api) {
      const walletAssets: any = await setTokenBalanceUpdate(
        api,
        selectedAccount.address,
        selectedTokenB.assetTokenId,
        tokenBalances
      );
      dispatch({ type: ActionType.SET_TOKEN_BALANCES, payload: walletAssets });
      const poolsTokenMetadata = await getAllLiquidityPoolsTokensMetadata(api);
      dispatch({ type: ActionType.SET_POOLS_TOKEN_METADATA, payload: poolsTokenMetadata });
    }
  };

  const setSelectedTokenAValue = (value: string) => {
    if (value) {
      value = new Decimal(value).toFixed();
      if (slippageValue) {
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
        const tokenWithSlippageFormatted = formatInputTokenValue(nativeTokenSlippageValue, selectedTokenB?.decimals);

        setSelectedTokenNativeValue({ tokenValue: value });
        setNativeTokenWithSlippage({ tokenValue: tokenWithSlippageFormatted });
      }
    } else {
      setSelectedTokenNativeValue({ tokenValue: "" });
    }
  };

  const setSelectedTokenBValue = (value: string) => {
    if (value) {
      value = new Decimal(value).toFixed();
      if (slippageValue) {
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
      }
    } else {
      setSelectedTokenAssetValue({ tokenValue: "" });
    }
  };

  const checkAssetTokenMinAmount = async () => {
    if (selectedTokenAssetValue && api && selectedTokenB.assetTokenId) {
      const assetTokenInfo: any = await api.query.assets.asset(selectedTokenB.assetTokenId);
      const assetTokenMinBalance = assetTokenInfo.toHuman()?.minBalance;
      if (!assetTokenMinBalance) return;
      const formattedMinTokenAmount = assetTokenMinBalance.replace(/[, ]/g, "");
      const assetTokenMinBalanceFormatted = formatDecimalsFromToken(formattedMinTokenAmount, selectedTokenB.decimals);

      if (new Decimal(selectedTokenAssetValue.tokenValue || 0).gte(assetTokenMinBalanceFormatted || 0)) {
        setAssetTokenMinValueExceeded(false);
      } else {
        setAssetTokenMinValue(assetTokenMinBalanceFormatted);
        setAssetTokenMinValueExceeded(true);
      }
    }
  };

  const getButtonProperties = useMemo(() => {
    if (tokenBalances?.assets) {
      if (selectedTokenB.tokenSymbol === "" || selectedTokenB.assetTokenId === "") {
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

      console.log("tokenBalances.balance", tokenBalances.balance, selectedNativeTokenNumber);

      if (selectedNativeTokenNumber.gt(tokenBalances.balance)) {
        return {
          label: `Insufficient ${selectedTokenA.nativeTokenSymbol} amount`,
          disabled: true,
        };
      }

      const fee = convertToBaseUnit(poolGasFee);

      console.log("fee calc:", fee, poolGasFee)

      if (selectedNativeTokenNumber.plus(fee).gt(tokenBalances.balance)) {
        return {
          label: `Insufficient ${selectedTokenA.nativeTokenSymbol} amount`,
          disabled: true,
        };
      }

      if (
        selectedAssetTokenNumber.gt(
          formatDecimalsFromToken(selectedTokenB.assetTokenBalance?.replace(/[, ]/g, ""), selectedTokenB.decimals)
        )
      ) {
        return {
          label: `Insufficient ${selectedTokenB.tokenSymbol} amount`,
          disabled: true,
        };
      }

      if (selectedNativeTokenNumber.gt(0) && selectedAssetTokenNumber.gt(0) && assetTokenMinValueExceeded) {
        return { label: "Minimum asset token amount exceeded", disabled: true };
      }

      if (
        selectedNativeTokenNumber.gt(0) &&
        selectedAssetTokenNumber.gt(0) &&
        !assetTokenMinValueExceeded &&
        !tooManyDecimalsError.isError
      ) {
        return { label: "Deposit", disabled: false };
      }

      if (
        selectedNativeTokenNumber.gt(0) &&
        selectedAssetTokenNumber.gt(0) &&
        !assetTokenMinValueExceeded &&
        tooManyDecimalsError.isError
      ) {
        return { label: "Deposit", disabled: true };
      }
    } else {
      return { label: "Connect Wallet", disabled: true };
    }

    return { label: "Select token", disabled: true };
  }, [
    selectedTokenB.assetTokenId,
    selectedTokenB.tokenSymbol,
    selectedTokenA.nativeTokenDecimals,
    selectedTokenB.decimals,
    selectedTokenB.assetTokenBalance,
    selectedTokenNativeValue?.tokenValue,
    selectedTokenAssetValue?.tokenValue,
    assetTokenMinValueExceeded,
    tooManyDecimalsError.isError,
  ]);

  useEffect(() => {
    if (tokenBalances?.assets) {
      setSelectedTokenA({
        nativeTokenSymbol: tokenBalances?.tokenSymbol,
        nativeTokenDecimals: tokenBalances?.tokenDecimals,
        tokenId: "",
        tokenBalance: tokenBalances.balance.toString(),
      });
    }
  }, [tokenBalances?.assets]);

  useEffect(() => {
    const poolExists = checkIfPoolAlreadyExists(selectedTokenB.assetTokenId, pools);
    setPoolExists(poolExists);
  }, [selectedTokenB.assetTokenId]);

  useEffect(() => {
    if (selectedTokenB.assetTokenId) {
      handlePoolGasFee();
    }
  }, [selectedTokenB.assetTokenId]);

  useEffect(() => {
    dispatch({ type: ActionType.SET_TRANSFER_GAS_FEES_MESSAGE, payload: "" });
  }, []);

  useEffect(() => {
    checkAssetTokenMinAmount();
  }, [selectedTokenAssetValue?.tokenValue]);

  useEffect(() => {
    if (
      selectedTokenNativeValue &&
      selectedTokenAssetValue &&
      selectedAssetTokenNumber.gt(0) &&
      selectedNativeTokenNumber.gt(0)
    ) {
      setSelectedTokenAValue(selectedTokenNativeValue.tokenValue);
      setSelectedTokenBValue(selectedTokenAssetValue.tokenValue);
    }
  }, [slippageValue]);

  useEffect(() => {
    if (tokenBSelected) {
      setSelectedTokenB(tokenBSelected);
    }
  }, [tokenBSelected]);

  useEffect(() => {
    dispatch({ type: ActionType.SET_TOKEN_CAN_NOT_CREATE_WARNING_POOLS, payload: false });
  }, [selectedTokenB.assetTokenId, selectedTokenNativeValue, selectedTokenAssetValue]);

  useEffect(() => {
    if (createPoolLoading) {
      setWaitingForTransaction(
        setTimeout(() => {
          if (createPoolLoading) {
            setIsTransactionTimeout(true);
            dispatch({ type: ActionType.SET_CREATE_POOL_LOADING, payload: false });
          }
        }, 180000)
      ); // 3 minutes 180000
    } else {
      if (waitingForTransaction) {
        clearTimeout(waitingForTransaction);
      }
    }
  }, [createPoolLoading]);

  return poolExists ? (
    <AddPoolLiquidity tokenBId={{ id: selectedTokenB.assetTokenId }} />
  ) : (
    <>
      <div className="sm:w-[540px] w-[95%] rounded-2xl sm:rounded-[50px] sm:box-shadow-out bg-gradient-to-r from-[#5100FE] to-[#B4D2FF] dark:bg-gradient-to-b dark:from-[#5100FE] dark:to-[#5100FE] p-0.5">
        <div className="flex flex-col gap-6 h-full w-full bg-gradient-to-br from-[#2B0281] via-[#1D0058] to-[#220068] dark:bg-gradient-to-t dark:from-[#E8E8E8] dark:to-[#E8E8E8] rounded-2xl sm:rounded-[50px] p-7 sm:p-14">
          <TokenSelectionInput
            tokenText={selectedTokenA?.nativeTokenSymbol}
            labelText={"You pay"}
            tokenBalance={selectedTokenA.tokenBalance}
            tokenId={selectedTokenA.tokenId}
            tokenDecimals={selectedTokenA.nativeTokenDecimals}
            tokenValue={selectedTokenNativeValue?.tokenValue}
            onClick={() => null}
            onSetTokenValue={(value) => setSelectedTokenAValue(value)}
            selectDisabled={true}
            disabled={createPoolLoading || !selectedAccount || !tokenBalances?.assets}
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
            labelText={"You pay"}
            tokenBalance={selectedTokenB.assetTokenBalance}
            tokenId={selectedTokenB.assetTokenId}
            tokenDecimals={selectedTokenB.decimals}
            tokenValue={selectedTokenAssetValue?.tokenValue}
            onClick={() => setIsModalOpen(true)}
            onSetTokenValue={(value) => setSelectedTokenBValue(value)}
            disabled={createPoolLoading || !selectedAccount || !tokenBalances?.assets}
            selectDisabled={createPoolLoading || !selectedAccount}
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
              <p className="dark:text-[#5100FE] text-white">_ _</p>
            </div>
            <div className="flex flex-row justify-between">
              <p>Pool liquidity ({selectedTokenB.tokenSymbol})</p>
              <p className="dark:text-[#5100FE] text-white">_ _</p>
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
                1 {selectedTokenA.nativeTokenSymbol} = {nativeTokenValue} {selectedTokenB.tokenSymbol}
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
              disabled={getButtonProperties.disabled || createPoolLoading || addLiquidityLoading}
              content={createPoolLoading || addLiquidityLoading ? <LottieMedium /> : getButtonProperties.label}
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
        title="Review create pool"
        transactionType={TransactionTypes.createPool}
        inputValueA={selectedTokenNativeValue ? selectedTokenNativeValue.tokenValue : ""}
        tokenValueA={selectedTokenA.nativeTokenSymbol}
        inputValueB={selectedTokenAssetValue ? selectedTokenAssetValue.tokenValue : ""}
        tokenValueB={selectedTokenB.tokenSymbol}
        onClose={() => {
          setReviewModalOpen(false);
        }}
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
          value: selectedTokenNativeValue?.tokenValue,
          symbol: selectedTokenA.nativeTokenSymbol,
        }}
        tokenB={{
          value: selectedTokenAssetValue?.tokenValue,
          symbol: selectedTokenB.tokenSymbol,
        }}
        actionLabel={"added"}
      />
      <WarningMessage
        show={assetTokenMinValueExceeded}
        message={`The minimum required amount for the ${selectedTokenB.tokenSymbol} token is ${assetTokenMinValue}.`}
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

export default CreatePool;