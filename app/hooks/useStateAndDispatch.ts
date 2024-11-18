import { WalletAction } from "@/app/store/wallet/interface";
import { PoolAction } from "@/app/store/pools/interface";
import { useEffect, useReducer } from "react";
import {
  initialPoolsState,
  initialSwapState,
  initialWalletState,
  poolsReducer,
  swapReducer,
  walletReducer,
} from "@/app/store";
import { setupPolkadotApi } from "@/app/services/polkadotWalletServices";
import { ActionType } from "@/app/types/enum";
import { getAllPools, getAllLiquidityPoolsTokensMetadata } from "@/app/services/poolServices";
import dotAcpToast from "@/app/utils/toast";
import { SwapAction } from "@/app/store/swap/interface";

const useStateAndDispatch = () => {
  const [walletState, dispatchWallet] = useReducer(walletReducer, initialWalletState);
  const [poolsState, dispatchPools] = useReducer(poolsReducer, initialPoolsState);
  const [swapState, dispatchSwap] = useReducer(swapReducer, initialSwapState);

  const state = { ...walletState, ...poolsState, ...swapState };

  const dispatch = (action: WalletAction | PoolAction | SwapAction) => {
    dispatchWallet(action as WalletAction);
    dispatchPools(action as PoolAction);
    dispatchSwap(action as SwapAction);
  };

  useEffect(() => {
    const callApiSetup = async () => {
      try {
        const polkaApi = await setupPolkadotApi();
        dispatch({ type: ActionType.SET_API, payload: polkaApi });
        const pools = await getAllPools(polkaApi);
        const poolsTokenMetadata = await getAllLiquidityPoolsTokensMetadata(polkaApi);

        if (pools) {
          dispatch({ type: ActionType.SET_POOLS, payload: pools });
          dispatch({ type: ActionType.SET_POOLS_TOKEN_METADATA, payload: poolsTokenMetadata });
        }
      } catch (error) {
        dotAcpToast.error(`Error setting up Polkadot API: ${error}`);
      }
    };

    callApiSetup().then();
  }, []);

  return { state, dispatch };
};

export default useStateAndDispatch;
