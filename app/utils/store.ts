import { atom } from "jotai";
import { TokenSelection } from "@/app/types/enum";
import { SwapTokenProps, TokenProps } from "@/app/types";

export const themeDarkAtom = atom<boolean>(false);

export const isConnectWalletAtom = atom<boolean>(false);

export const viewFilterAtom = atom<boolean>(false);

export const viewModalAtom = atom<string>("");

export const tokenSwapOrderAtom = atom<boolean>(true);

export const isShowChartModalAtom = atom<boolean>(false)

export const showSelectTokenModalAtom = atom<TokenSelection>(TokenSelection.None)

export const oneTimeSeriesSelectedAtom = atom<string>("15m")

export const isMobileAtom = atom<boolean>(false)

export const isSettingClickedAtom = atom<boolean>(false)

export const tokenFromListAtom = atom<string>("ASX")

export const tokenToListAtom = atom<string>("DOT")

export const selectedTokensAtom = atom<SwapTokenProps>({
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
})

export const initialPoolInfoAtom = atom<any>([
    {
        id: 1,
        tokenA: "DOT",
        tokenB: "ASX",
        favourite: false,
        arranged: false,
        liquidity: 8888888881.88,
        volume24h: 888888888881,
        volume7d: 78888888881.88,
        volume30d: 308888888881.88,
        fees24h: 2488881,
        fees7d: 7888881,
        fees30d: 30888881,
        apr24h: 24888881,
        apr7d: 7888881,
        apr30d: 30888881,
      },
      {
        id: 2,
        tokenA: "ASX",
        tokenB: "USDT",
        favourite: false,
        arranged: false,
        liquidity: 7888888882.88,
        volume24h: 888888888882,
        volume7d: 78888888882.88,
        volume30d: 308888888882.88,
        fees24h: 2488882,
        fees7d: 7888882,
        fees30d: 30888882,
        apr24h: 24888882,
        apr7d: 7888882,
        apr30d: 30888882,
      },
      {
        id: 3,
        tokenA: "DOT",
        tokenB: "USDC",
        favourite: false,
        arranged: false,
        liquidity: 6888888883.88,
        volume24h: 888888888883,
        volume7d: 78888888883.88,
        volume30d: 308888888883.88,
        fees24h: 2488883,
        fees7d: 7888883,
        fees30d: 30888883,
        apr24h: 24888883,
        apr7d: 7888883,
        apr30d: 30888883,
      },
      {
        id: 4,
        tokenA: "ASX",
        tokenB: "USDC",
        favourite: false,
        arranged: false,
        liquidity: 5888888884.88,
        volume24h: 888888888884,
        volume7d: 78888888884.88,
        volume30d: 308888888884.88,
        fees24h: 2488884,
        fees7d: 7888884,
        fees30d: 30888884,
        apr24h: 24888884,
        apr7d: 7888884,
        apr30d: 30888884,
      },
      {
        id: 5,
        tokenA: "DOT",
        tokenB: "USDT",
        favourite: false,
        arranged: false,
        liquidity: 3888888885.88,
        volume24h: 888888888885,
        volume7d: 78888888885.88,
        volume30d: 308888888885.88,
        fees24h: 2488885,
        fees7d: 7888885,
        fees30d: 30888885,
        apr24h: 24888885,
        apr7d: 7888885,
        apr30d: 30888885,
      },
])

export const rangePoolInfoAtom = atom<any>([])

export const availablePoolTokenAAtom = atom<TokenProps[]>([])

export const availablePoolTokenBAtom = atom<TokenProps[]>([])

export const networkModalAtom = atom<boolean>(false)