"use client"
import useStateAndDispatch from "@/app/hooks/useStateAndDispatch";
import { connectWalletAndFetchBalance } from "@/app/services/polkadotWalletServices";
import { createPoolCardsArray } from "@/app/services/poolServices";
import LocalStorage from "@/app/utils/localStorage";
import type { WalletAccount } from "@talismn/connect-wallets";
import { FC, ReactNode, useEffect } from "react";
import { AppContext, AppContextType } from "./hook";

interface AppStateProviderProps {
  children: ReactNode;
}

const AppStateProvider: FC<AppStateProviderProps & AppContextType> = (props) => {
  const { children, state, dispatch } = props;

  if (!children) {
    throw new Error("AppStateProvider must have children");
  }

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
};

const AppProvider: FC<AppStateProviderProps> = (props) => {
  const { children } = props;
  const { dispatch, state } = useStateAndDispatch();
  const { api, pools, selectedAccount } = state;

  const walletConnected: WalletAccount = LocalStorage.get("wallet-connected");

  useEffect(() => {
    if (walletConnected && api) {
      connectWalletAndFetchBalance(dispatch, api, walletConnected).then();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api]);

  useEffect(() => {
    const updatePoolsCards = async () => {
      if (api && pools.length) await createPoolCardsArray(api, dispatch, pools, selectedAccount);
    };

    updatePoolsCards().then();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pools, selectedAccount]);


  return <AppStateProvider state={state} dispatch={dispatch}>{children}</AppStateProvider>;
};

export default AppProvider;

