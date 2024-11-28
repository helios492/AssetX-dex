import { FC, useEffect, useState } from "react";
import classNames from "classnames";
import { ActionType } from "@/app/types/enum";
import Modal from "../modal";
import { useAppContext } from "@/app/state/hook";
import { formatDecimalsFromToken } from "@/app/utils/helper";
import Image from "next/image";
import { useAtom } from "jotai";
import { availablePoolTokenBAtom, themeDarkAtom } from "@/app/utils/store";
import { PoolsTokenMetadata } from "@/app/types";
import { ApiPromise, WsProvider } from '@polkadot/api';
import useGetNetwork from "@/app/hooks/useGetNetwork";

type TokenProps = {
  tokenSymbol: string;
  assetTokenId: string;
  decimals: string;
  assetTokenBalance: string;
};

interface PoolSelectTokenModalProps {
  open: boolean;
  title: string;
  selected?: TokenProps;
  onClose: () => void;
  onSelect: (tokenData: TokenProps) => void;
}

const PoolSelectTokenModal: FC<PoolSelectTokenModalProps> = ({ open, title, selected, onClose, onSelect }) => {
  const { state, dispatch } = useAppContext();
  const { tokenBalances, poolsTokenMetadata } = state;
  const [themeDark] = useAtom(themeDarkAtom);
  const [searchQuery, setSearchQuery] = useState("");
  const {rpcUrl} = useGetNetwork();
  const [availablePoolTokenB, setAvailablePoolTokenB] = useAtom(availablePoolTokenBAtom)
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
  }, [tokenBalances]);

  const filteredTokenList = searchQuery.length > 0 ? availablePoolTokenB.filter((token: any) =>
    token.assetTokenMetadata.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.assetTokenMetadata.symbol?.toLowerCase().includes(searchQuery.toLowerCase())
  ) : availablePoolTokenB;

  const handlePoolAssetTokeData = (id: string, assetSymbol: string, decimals: string, assetTokenBalance: string) => {
    const assetTokenData = {
      tokenSymbol: assetSymbol,
      assetTokenId: id,
      decimals: decimals,
      assetTokenBalance: assetTokenBalance,
    };
    dispatch({ type: ActionType.SET_POOL_ASSET_TOKEN_DATA, payload: assetTokenData });
    onSelect(assetTokenData);
    onClose();
  };

  const getLiquidityTokenB = () => {
    const poolLiquidTokens: any = nativeToken.assetTokenMetadata.symbol
    ? [nativeToken, ...poolsTokenMetadata].filter(
      (item: any) => item.tokenId !== nativeToken.tokenId
    )
    : poolsTokenMetadata?.filter(
      (item: any) => item.tokenId !== nativeToken.tokenId
    );
  if (tokenBalances) {
    for (const item of poolLiquidTokens) {
      for (const walletAsset of tokenBalances.assets) {
        if (item.tokenId === walletAsset.tokenId) {
          item.tokenAsset.balance = walletAsset.tokenAsset.balance;
        }
      }
    }
  }
  setAvailablePoolTokenB(poolLiquidTokens)
  };

  useEffect(()=>{
    if(tokenBalances){
      getLiquidityTokenB();
    }
  },[nativeToken, poolsTokenMetadata, tokenBalances])
  console.log("tokenBalances", tokenBalances?.assets)


  return (
    <Modal isOpen={open} onClose={onClose} title={title}>
      <div className="flex flex-col gap-4 sm:gap-8">
        <div className="flex flex-col gap-2 sm:gap-4">
          {/* Search Bar */}
          <div className="flex flex-row justify-between items-center bg-[#0F002ED9] dark:bg-white rounded-lg p-3 text-base text-[#B4D2FFBF] border-1 border-[#b4d2ff7e] dark:border-[#32009C]">
            <input
              className="w-full bg-transparent border-none outline-none placeholder-[#7bb0ff79] dark:placeholder-[#120038] focus:placeholder-[#526481] dark:focus:placeholder-[#5264816f]"
              placeholder="Search by token or paste address"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            ></input>
            <Image
              width={12}
              height={12}
              src="/pools-icon/search.svg"
              alt="Search"
            />
          </div>
          <hr className="flex flex-row justify-center items-center self-center w-full border-[#b4d2ff7e] dark:border-[#32009C]" />
          <div className="flex flex-row justify-between items-center text-base text-[#b4d2ff7c] dark:text-[#120038] font-bold">
            <p>Token</p>
            <p>Balance/Address</p>
          </div>
          <div
            className={`flex flex-col items-center h-[calc(100vh/3)] sm:h-[calc(100vh/4)] overflow-auto ${themeDark
              ? "token-select-scrollbar-desktop-dark"
              : "token-select-scrollbar-desktop"
              }`}
          >
            {tokenBalances?.assets && tokenBalances?.assets.length > 0 ? (
              filteredTokenList?.map((item: any, idx) => (
                <button
                  key={idx}
                  className={classNames(
                    "flex flex-row justify-between items-center w-full hover:bg-[#5000fe4f] dark:hover:bg-[white] p-1 rounded-lg",
                    { "bg-[#5000fe4f] dark:bg-[white]": item.tokenId === selected?.assetTokenId }
                  )}
                  onClick={() =>
                    handlePoolAssetTokeData(
                      item.tokenId,
                      item.assetTokenMetadata.symbol || item.tokenSymbol,
                      item.assetTokenMetadata.decimals || item.decimals,
                      item.tokenAsset.balance || 0
                    )
                  }
                >
                  <div className="flex flex-row justify-center items-center gap-3">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#5100FE] to-[#32009C] p-1">
                      <Image
                        src={`/logos/${item.assetTokenMetadata.symbol}.png`}
                        alt={item.assetTokenMetadata.name}
                        width={36}
                        height={36}

                        onError={e => {
                          e.currentTarget.src = "/logos/DOT.png"
                          e.currentTarget.srcset = "/logos/DOT.png"
                        }}
                      />
                    </div>
                    <div className="flex flex-col text-left text-[#b4d2ffaf] dark:text-[#120038]">
                      <p className="text-lg font-bold">
                        {item.assetTokenMetadata.name}
                      </p>
                      <p className="text-sm">
                        {item.assetTokenMetadata.symbol}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-right text-[#b4d2ffaf] dark:text-[#120038] text-lg font-bold">
                      {item.tokenId
                        ? formatDecimalsFromToken(
                          Number(item.tokenAsset.balance ? item.tokenAsset.balance.replace(/[, ]/g, "") : "0"),
                          item.assetTokenMetadata.decimals
                        )
                        : item.tokenAsset.balance}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <div className="min-w-[498px] pr-6">
                <div className="flex items-center justify-center gap-3 px-4 py-3">No Asset found in wallet</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PoolSelectTokenModal;
