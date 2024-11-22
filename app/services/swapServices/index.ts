import { ApiPromise } from "@polkadot/api";
import { getWalletBySource, type WalletAccount } from "@talismn/connect-wallets";
// import { t } from "i18next";
import { Dispatch } from "react";
import useGetNetwork from "@/app/hooks/useGetNetwork";
import { ActionType, ServiceResponseStatus } from "@/app/types/enum";
import { formatDecimalsFromToken } from "@/app/utils/helper";
import dotAcpToast from "@/app/utils/toast";
import { SwapAction } from "@/app/store/swap/interface";
import { WalletAction } from "@/app/store/wallet/interface";
import axios from "axios";
import { ISubmittableResult } from "@polkadot/types/types";

// eslint-disable-next-line react-hooks/rules-of-hooks
type sendInfoProps = {
  tokenAValue: string
  tokenBValue: string
  tokenADecimals: string
  tokenBDecimals: string
  account: WalletAccount
  response: ISubmittableResult
  tokenAId?: string
  tokenBId?: string
  tokenAPrice: string
  tokenBPrice: string
  swapFee: string
};
const { parents, rpcUrl } = useGetNetwork();

const checkIfExactError = (errorValue: string) => {
  return errorValue === "Calculated amount out is less than provided minimum amount.";
};

const exactSwapAmounts = (
  itemEvents: any,
  tokenADecimals: string,
  tokenBDecimals: string,
  dispatch: Dispatch<SwapAction>
) => {
  const swapExecutedEvent = itemEvents.events.filter((item: any) => item.event.method === "SwapExecuted");

  const amountIn = formatDecimalsFromToken(
    parseFloat(swapExecutedEvent[0]?.event.data.amountIn.replace(/[, ]/g, "")),
    tokenADecimals
  );
  const amountOut = formatDecimalsFromToken(
    parseFloat(swapExecutedEvent[0]?.event.data.amountOut.replace(/[, ]/g, "")),
    tokenBDecimals
  );

  dispatch({ type: ActionType.SET_SWAP_EXACT_IN_TOKEN_AMOUNT, payload: amountIn });
  dispatch({ type: ActionType.SET_SWAP_EXACT_OUT_TOKEN_AMOUNT, payload: amountOut });

  return swapExecutedEvent;
};

const sendInfoToDataBase = async ({ tokenAValue, tokenBValue, tokenADecimals, tokenBDecimals, account, response, tokenAId, tokenBId, tokenAPrice, tokenBPrice, swapFee }: sendInfoProps) => {
  const amountIn = formatDecimalsFromToken(
    parseFloat(tokenAValue.replace(/[, ]/g, "")),
    tokenADecimals
  );
  const amountOut = formatDecimalsFromToken(
    parseFloat(tokenBValue.replace(/[, ]/g, "")),
    tokenBDecimals
  );

  console.log("tokenPrice", tokenAPrice, tokenBPrice)

  const res = await axios.post("/api/tx", {
    walletAddress: account.address,
    tx: response.status.asInBlock.toString(),
    type: "swap",
    tokenAAmount: amountIn,
    tokenAId: tokenAId || "0",
    tokenBAmount: amountOut,
    tokenBId: tokenBId || "0",
    tokenAPrice,
    tokenBPrice,
    rpcUrl: rpcUrl,
    swapFee
  });

  console.log("res", res);
}

export const swapNativeForAssetExactIn = async (
  api: ApiPromise,
  assetTokenId: string,
  account: WalletAccount,
  nativeTokenValue: string,
  assetTokenValue: string,
  tokenADecimals: string,
  tokenBDecimals: string,
  tokenAPrice: string,
  tokenBPrice: string,
  swapFee: string,
  reverse: boolean,
  dispatch: Dispatch<SwapAction | WalletAction>
) => {
  const firstArg = api
    .createType("MultiLocation", {
      parents: parents,
      interior: {
        here: null,
      },
    })
    .toU8a();

  const secondArg = api
    .createType("MultiLocation", {
      parents: 0,
      interior: {
        x2: [{ palletInstance: 50 }, { generalIndex: assetTokenId }],
      },
    })
    .toU8a();

  dispatch({ type: ActionType.SET_SWAP_LOADING, payload: true });

  const result = api.tx.assetConversion.swapExactTokensForTokens(
    reverse ? [secondArg, firstArg] : [firstArg, secondArg],
    reverse ? assetTokenValue : nativeTokenValue,
    reverse ? nativeTokenValue : assetTokenValue,
    account.address,
    false
  );

  const wallet = getWalletBySource(account.wallet?.extensionName);

  result
    .signAndSend(account.address, { signer: wallet?.signer }, async (response) => {
      if (response.status.isInBlock) {
        dotAcpToast.success(`Completed at block hash #${response.status.asInBlock.toString()}`, {
          style: {
            maxWidth: "750px",
          },
        });

        sendInfoToDataBase({ 
          tokenAValue: nativeTokenValue, 
          tokenBValue: assetTokenValue, 
          tokenADecimals, tokenBDecimals, 
          account, 
          response, 
          tokenBId: assetTokenId,
          tokenAPrice,
          tokenBPrice,
          swapFee, });
          
      } else {
        if (response.status.type === ServiceResponseStatus.Finalized && response.dispatchError) {
          if (response.dispatchError.isModule) {
            const decoded = api.registry.findMetaError(response.dispatchError.asModule);
            const { docs } = decoded;
            dotAcpToast.error(checkIfExactError(docs.join(" ")) ? "The transaction could not be completed due to the set slippage." : `${docs.join(" ")}`);
            dispatch({ type: ActionType.SET_SWAP_LOADING, payload: false });
          } else {
            if (response.dispatchError.toString() === "{\"token\":\"CannotCreate\"}") {
              dispatch({ type: ActionType.SET_TOKEN_CAN_NOT_CREATE_WARNING_SWAP, payload: true });
            }
            dotAcpToast.error(response.dispatchError.toString());
            dispatch({ type: ActionType.SET_SWAP_LOADING, payload: false });
          }
        } else {
          dotAcpToast.success(`Current status: ${response.status.type}`);
        }
        if (response.status.type === ServiceResponseStatus.Finalized && !response.dispatchError) {
          exactSwapAmounts(response.toHuman(), tokenADecimals, tokenBDecimals, dispatch);

          dispatch({ type: ActionType.SET_BLOCK_HASH_FINALIZED, payload: response.status.asFinalized.toString() });

          dispatch({ type: ActionType.SET_SWAP_FINALIZED, payload: true });
          dispatch({
            type: ActionType.SET_SWAP_GAS_FEES_MESSAGE,
            payload: "",
          });
          dispatch({
            type: ActionType.SET_SWAP_GAS_FEE,
            payload: "",
          });
          dispatch({ type: ActionType.SET_SWAP_LOADING, payload: false });
        }
      }
    })
    .catch((error: any) => {
      dotAcpToast.error(`Transaction failed: ${error}`);
      dispatch({
        type: ActionType.SET_SWAP_GAS_FEES_MESSAGE,
        payload: "",
      });
      dispatch({
        type: ActionType.SET_SWAP_GAS_FEE,
        payload: "",
      });
      dispatch({ type: ActionType.SET_SWAP_LOADING, payload: false });
    });

  return result;
};

export const swapNativeForAssetExactOut = async (
  api: ApiPromise,
  assetTokenId: string,
  account: WalletAccount,
  nativeTokenValue: string,
  assetTokenValue: string,
  tokenADecimals: string,
  tokenBDecimals: string,
  tokenAPrice: string,
  tokenBPrice: string,
  swapFee: string,
  reverse: boolean,
  dispatch: Dispatch<SwapAction | WalletAction>
) => {
  const firstArg = api
    .createType("MultiLocation", {
      parents: parents,
      interior: {
        here: null,
      },
    })
    .toU8a();

  const secondArg = api
    .createType("MultiLocation", {
      parents: 0,
      interior: {
        x2: [{ palletInstance: 50 }, { generalIndex: assetTokenId }],
      },
    })
    .toU8a();

  dispatch({ type: ActionType.SET_SWAP_LOADING, payload: true });

  const result = api.tx.assetConversion.swapTokensForExactTokens(
    reverse ? [secondArg, firstArg] : [firstArg, secondArg],
    reverse ? nativeTokenValue : assetTokenValue,
    reverse ? assetTokenValue : nativeTokenValue,
    account.address,
    false
  );

  const wallet = getWalletBySource(account.wallet?.extensionName);

  result
    .signAndSend(account.address, { signer: wallet?.signer }, (response) => {
      if (response.status.isInBlock) {
        dotAcpToast.success(`Completed at block hash #${response.status.asInBlock.toString()}`, {
          style: {
            maxWidth: "750px",
          },
        });

        sendInfoToDataBase({ 
          tokenAValue: nativeTokenValue, 
          tokenBValue: assetTokenValue, 
          tokenADecimals, tokenBDecimals, 
          account, 
          response, 
          tokenAId: assetTokenId,
          tokenAPrice,
          tokenBPrice,
          swapFee});
      } else {
        if (response.status.type === ServiceResponseStatus.Finalized && response.dispatchError) {
          if (response.dispatchError.isModule) {
            const decoded = api.registry.findMetaError(response.dispatchError.asModule);
            const { docs } = decoded;
            dotAcpToast.error(checkIfExactError(docs.join(" ")) ? "The transaction could not be completed due to the set slippage." : `${docs.join(" ")}`);
            dispatch({ type: ActionType.SET_SWAP_LOADING, payload: false });
          } else {
            if (response.dispatchError.toString() === "{\"token\":\"CannotCreate\"}") {
              dispatch({ type: ActionType.SET_TOKEN_CAN_NOT_CREATE_WARNING_SWAP, payload: true });
            }
            dotAcpToast.error(response.dispatchError.toString());
            dispatch({ type: ActionType.SET_SWAP_LOADING, payload: false });
          }
        } else {
          dotAcpToast.success(`Current status: ${response.status.type}`);
        }
        if (response.status.type === ServiceResponseStatus.Finalized && !response.dispatchError) {
          exactSwapAmounts(response.toHuman(), tokenADecimals, tokenBDecimals, dispatch);

          dispatch({ type: ActionType.SET_BLOCK_HASH_FINALIZED, payload: response.status.asFinalized.toString() });
          dispatch({ type: ActionType.SET_SWAP_FINALIZED, payload: true });
          dispatch({
            type: ActionType.SET_SWAP_GAS_FEES_MESSAGE,
            payload: "",
          });
          dispatch({
            type: ActionType.SET_SWAP_GAS_FEE,
            payload: "",
          });
          dispatch({ type: ActionType.SET_SWAP_LOADING, payload: false });
        }
      }
    })
    .catch((error: any) => {
      dotAcpToast.error(`Transaction failed: ${error}`);
      dispatch({
        type: ActionType.SET_SWAP_GAS_FEES_MESSAGE,
        payload: "",
      });
      dispatch({
        type: ActionType.SET_SWAP_GAS_FEE,
        payload: "",
      });
      dispatch({ type: ActionType.SET_SWAP_LOADING, payload: false });
    });

  return result;
};

export const swapAssetForAssetExactIn = async (
  api: ApiPromise,
  assetTokenAId: string,
  assetTokenBId: string,
  account: WalletAccount,
  assetTokenAValue: string,
  assetTokenBValue: string,
  tokenADecimals: string,
  tokenBDecimals: string,
  tokenAPrice: string,
  tokenBPrice: string,
  swapFee: string,
  dispatch: Dispatch<SwapAction | WalletAction>
) => {
  const firstArg = api
    .createType("MultiLocation", {
      parents: 0,
      interior: {
        x2: [{ palletInstance: 50 }, { generalIndex: assetTokenAId }],
      },
    })
    .toU8a();

  const secondArg = api
    .createType("MultiLocation", {
      parents: parents,
      interior: {
        here: null,
      },
    })
    .toU8a();

  const thirdArg = api
    .createType("MultiLocation", {
      parents: 0,
      interior: {
        x2: [{ palletInstance: 50 }, { generalIndex: assetTokenBId }],
      },
    })
    .toU8a();

  dispatch({ type: ActionType.SET_SWAP_LOADING, payload: true });

  const result = api.tx.assetConversion.swapExactTokensForTokens(
    [firstArg, secondArg, thirdArg],
    assetTokenAValue,
    assetTokenBValue,
    account.address,
    false
  );

  const wallet = getWalletBySource(account.wallet?.extensionName);

  result
    .signAndSend(account.address, { signer: wallet?.signer }, (response) => {
      if (response.status.isInBlock) {
        dotAcpToast.success(`Completed at block hash #${response.status.asInBlock.toString()}`, {
          style: {
            maxWidth: "750px",
          },
        });

        sendInfoToDataBase({
          tokenAValue: assetTokenAValue, 
          tokenBValue: assetTokenBValue, 
          tokenADecimals, tokenBDecimals, account, 
          response, 
          tokenAId: assetTokenAId, 
          tokenBId: assetTokenBId, 
          tokenAPrice,
          tokenBPrice,
          swapFee});

      } else {
        if (response.status.type === ServiceResponseStatus.Finalized && response.dispatchError) {
          if (response.dispatchError.isModule) {
            const decoded = api.registry.findMetaError(response.dispatchError.asModule);
            const { docs } = decoded;
            dotAcpToast.error(checkIfExactError(docs.join(" ")) ? "The transaction could not be completed due to the set slippage." : `${docs.join(" ")}`);
            dispatch({ type: ActionType.SET_SWAP_LOADING, payload: false });
          } else {
            if (response.dispatchError.toString() === "{\"token\":\"CannotCreate\"}") {
              dispatch({ type: ActionType.SET_TOKEN_CAN_NOT_CREATE_WARNING_SWAP, payload: true });
            }
            dotAcpToast.error(response.dispatchError.toString());
            dispatch({ type: ActionType.SET_SWAP_LOADING, payload: false });
          }
        } else {
          dotAcpToast.success(`Current status: ${response.status.type}`);
        }
        if (response.status.type === ServiceResponseStatus.Finalized && !response.dispatchError) {
          exactSwapAmounts(response.toHuman(), tokenADecimals, tokenBDecimals, dispatch);

          dispatch({ type: ActionType.SET_BLOCK_HASH_FINALIZED, payload: response.status.asFinalized.toString() });
          dispatch({ type: ActionType.SET_SWAP_FINALIZED, payload: true });
          dispatch({
            type: ActionType.SET_SWAP_GAS_FEES_MESSAGE,
            payload: "",
          });
          dispatch({
            type: ActionType.SET_SWAP_GAS_FEE,
            payload: "",
          });
          dispatch({ type: ActionType.SET_SWAP_LOADING, payload: false });
        }
      }
    })
    .catch((error: any) => {
      dotAcpToast.error(`Transaction failed: ${error}`);
      dispatch({
        type: ActionType.SET_SWAP_GAS_FEES_MESSAGE,
        payload: "",
      });
      dispatch({
        type: ActionType.SET_SWAP_GAS_FEE,
        payload: "",
      });
      dispatch({ type: ActionType.SET_SWAP_LOADING, payload: false });
    });

  return result;
};

export const swapAssetForAssetExactOut = async (
  api: ApiPromise,
  assetTokenAId: string,
  assetTokenBId: string,
  account: WalletAccount,
  assetTokenAValue: string,
  assetTokenBValue: string,
  tokenADecimals: string,
  tokenBDecimals: string,
  tokenAPrice: string,
  tokenBPrice: string,
  swapFee: string,
  dispatch: Dispatch<SwapAction | WalletAction>
) => {
  const firstArg = api
    .createType("MultiLocation", {
      parents: 0,
      interior: {
        x2: [{ palletInstance: 50 }, { generalIndex: assetTokenAId }],
      },
    })
    .toU8a();

  const secondArg = api
    .createType("MultiLocation", {
      parents: parents,
      interior: {
        here: null,
      },
    })
    .toU8a();

  const thirdArg = api
    .createType("MultiLocation", {
      parents: 0,
      interior: {
        x2: [{ palletInstance: 50 }, { generalIndex: assetTokenBId }],
      },
    })
    .toU8a();

  dispatch({ type: ActionType.SET_SWAP_LOADING, payload: true });

  const result = api.tx.assetConversion.swapTokensForExactTokens(
    [firstArg, secondArg, thirdArg],
    assetTokenBValue,
    assetTokenAValue,
    account.address,
    false
  );

  const wallet = getWalletBySource(account.wallet?.extensionName);

  result
    .signAndSend(account.address, { signer: wallet?.signer }, (response) => {
      if (response.status.isInBlock) {
        dotAcpToast.success(`Completed at block hash #${response.status.asInBlock.toString()}`, {
          style: {
            maxWidth: "750px",
          },
        });
        sendInfoToDataBase({
          tokenAValue: assetTokenAValue, 
          tokenBValue: assetTokenBValue, 
          tokenADecimals, tokenBDecimals, account, 
          response, 
          tokenAId: assetTokenAId, 
          tokenBId: assetTokenBId, 
          tokenAPrice,
          tokenBPrice,
          swapFee});
      } else {
        if (response.status.type === ServiceResponseStatus.Finalized && response.dispatchError) {
          if (response.dispatchError.isModule) {
            const decoded = api.registry.findMetaError(response.dispatchError.asModule);
            const { docs } = decoded;
            dotAcpToast.error(checkIfExactError(docs.join(" ")) ? "The transaction could not be completed due to the set slippage." : `${docs.join(" ")}`);
            dispatch({ type: ActionType.SET_SWAP_LOADING, payload: false });
          } else {
            if (response.dispatchError.toString() === "{\"token\":\"CannotCreate\"}") {
              dispatch({ type: ActionType.SET_TOKEN_CAN_NOT_CREATE_WARNING_SWAP, payload: true });
            }
            dotAcpToast.error(response.dispatchError.toString());
            dispatch({ type: ActionType.SET_SWAP_LOADING, payload: false });
          }
        } else {
          dotAcpToast.success(`Current status: ${response.status.type}`);
        }
        if (response.status.type === ServiceResponseStatus.Finalized && !response.dispatchError) {
          exactSwapAmounts(response.toHuman(), tokenADecimals, tokenBDecimals, dispatch);

          dispatch({ type: ActionType.SET_BLOCK_HASH_FINALIZED, payload: response.status.asFinalized.toString() });
          dispatch({ type: ActionType.SET_SWAP_FINALIZED, payload: true });
          dispatch({
            type: ActionType.SET_SWAP_GAS_FEES_MESSAGE,
            payload: "",
          });
          dispatch({
            type: ActionType.SET_SWAP_GAS_FEE,
            payload: "",
          });
          dispatch({ type: ActionType.SET_SWAP_LOADING, payload: false });
        }
      }
    })
    .catch((error: any) => {
      dotAcpToast.error(`Transaction failed: ${error}`);
      dispatch({
        type: ActionType.SET_SWAP_GAS_FEES_MESSAGE,
        payload: "",
      });
      dispatch({
        type: ActionType.SET_SWAP_GAS_FEE,
        payload: "",
      });
      dispatch({ type: ActionType.SET_SWAP_LOADING, payload: false });
    });

  return result;
};

export const checkSwapNativeForAssetExactInGasFee = async (
  api: ApiPromise,
  assetTokenId: string | null,
  account: WalletAccount,
  nativeTokenValue: string,
  assetTokenValue: string,
  reverse: boolean,
  dispatch: Dispatch<SwapAction>
) => {
  const firstArg = api
    .createType("MultiLocation", {
      parents: parents,
      interior: {
        here: null,
      },
    })
    .toU8a();

  const secondArg = api
    .createType("MultiLocation", {
      parents: 0,
      interior: {
        x2: [{ palletInstance: 50 }, { generalIndex: assetTokenId }],
      },
    })
    .toU8a();

  const result = api.tx.assetConversion.swapExactTokensForTokens(
    reverse ? [secondArg, firstArg] : [firstArg, secondArg],
    reverse ? assetTokenValue : nativeTokenValue,
    reverse ? nativeTokenValue : assetTokenValue,
    account.address,
    false
  );
  const { partialFee } = await result.paymentInfo(account.address);

  dispatch({
    type: ActionType.SET_SWAP_GAS_FEES_MESSAGE,
    payload: `transaction will have a weight of ${partialFee.toHuman()} fees`,
  });
  dispatch({
    type: ActionType.SET_SWAP_GAS_FEE,
    payload: partialFee.toHuman(),
  });
};

export const checkSwapNativeForAssetExactOutGasFee = async (
  api: ApiPromise,
  assetTokenId: string | null,
  account: WalletAccount,
  nativeTokenValue: string,
  assetTokenValue: string,
  reverse: boolean,
  dispatch: Dispatch<SwapAction>
) => {
  const firstArg = api
    .createType("MultiLocation", {
      parents: parents,
      interior: {
        here: null,
      },
    })
    .toU8a();

  const secondArg = api
    .createType("MultiLocation", {
      parents: 0,
      interior: {
        x2: [{ palletInstance: 50 }, { generalIndex: assetTokenId }],
      },
    })
    .toU8a();

  const result = api.tx.assetConversion.swapTokensForExactTokens(
    reverse ? [firstArg, secondArg] : [secondArg, firstArg],
    reverse ? nativeTokenValue : assetTokenValue,
    reverse ? assetTokenValue : nativeTokenValue,
    account.address,
    false
  );
  const { partialFee } = await result.paymentInfo(account.address);

  dispatch({
    type: ActionType.SET_SWAP_GAS_FEES_MESSAGE,
    payload: `transaction will have a weight of ${partialFee.toHuman()} fees`,
  });
  dispatch({
    type: ActionType.SET_SWAP_GAS_FEE,
    payload: partialFee.toHuman(),
  });
};

export const checkSwapAssetForAssetExactInGasFee = async (
  api: ApiPromise,
  assetTokenAId: string | null,
  assetTokenBId: string | null,
  account: WalletAccount,
  assetTokenAValue: string,
  assetTokenBValue: string,
  dispatch: Dispatch<SwapAction>
) => {
  const firstArg = api
    .createType("MultiLocation", {
      parents: 0,
      interior: {
        x2: [{ palletInstance: 50 }, { generalIndex: assetTokenAId }],
      },
    })
    .toU8a();

  const secondArg = api
    .createType("MultiLocation", {
      parents: parents,
      interior: {
        here: null,
      },
    })
    .toU8a();

  const thirdArg = api
    .createType("MultiLocation", {
      parents: 0,
      interior: {
        x2: [{ palletInstance: 50 }, { generalIndex: assetTokenBId }],
      },
    })
    .toU8a();

  const result = api.tx.assetConversion.swapExactTokensForTokens(
    [firstArg, secondArg, thirdArg],
    assetTokenAValue,
    assetTokenBValue,
    account.address,
    false
  );
  const { partialFee } = await result.paymentInfo(account.address);

  dispatch({
    type: ActionType.SET_SWAP_GAS_FEES_MESSAGE,
    payload: `transaction will have a weight of ${partialFee.toHuman()} fees`,
  });
  dispatch({
    type: ActionType.SET_SWAP_GAS_FEE,
    payload: partialFee.toHuman(),
  });
};

export const checkSwapAssetForAssetExactOutGasFee = async (
  api: ApiPromise,
  assetTokenAId: string | null,
  assetTokenBId: string | null,
  account: WalletAccount,
  assetTokenAValue: string,
  assetTokenBValue: string,
  dispatch: Dispatch<SwapAction>
) => {
  const firstArg = api
    .createType("MultiLocation", {
      parents: 0,
      interior: {
        x2: [{ palletInstance: 50 }, { generalIndex: assetTokenAId }],
      },
    })
    .toU8a();

  const secondArg = api
    .createType("MultiLocation", {
      parents: parents,
      interior: {
        here: null,
      },
    })
    .toU8a();

  const thirdArg = api
    .createType("MultiLocation", {
      parents: 0,
      interior: {
        x2: [{ palletInstance: 50 }, { generalIndex: assetTokenBId }],
      },
    })
    .toU8a();

  const result = api.tx.assetConversion.swapTokensForExactTokens(
    [firstArg, secondArg, thirdArg],
    assetTokenAValue,
    assetTokenBValue,
    account.address,
    false
  );
  const { partialFee } = await result.paymentInfo(account.address);

  dispatch({
    type: ActionType.SET_SWAP_GAS_FEES_MESSAGE,
    payload: `transaction will have a weight of ${partialFee.toHuman()} fees`,
  });
  dispatch({
    type: ActionType.SET_SWAP_GAS_FEE,
    payload: partialFee.toHuman(),
  });
};
