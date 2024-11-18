"use client";
import { PoolAction, PoolsState } from "@/app/store/pools/interface";
import { SwapAction, SwapState } from "@/app/store/swap/interface";
import { WalletAction, WalletState } from "@/app/store/wallet/interface";
import { createContext, Dispatch, useContext } from "react";

export interface AppContextType {
  state: WalletState & PoolsState & SwapState;
  dispatch: Dispatch<WalletAction | PoolAction | SwapAction>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
