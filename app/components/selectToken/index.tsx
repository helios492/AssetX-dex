/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useRef, FC, useCallback } from "react";
import classNames from "classnames";
import { useAtom } from "jotai";
import useClickOutside from "@/app/hooks/useClickOutside";
import {
  themeDarkAtom,
  showSelectTokenModalAtom,
  tokenFromListAtom,
  tokenToListAtom,
  selectedTokensAtom,
} from "@/app/utils/store";
import Tooltip from "../tooltip";
import { TokenSelection } from "@/app/types/enum";
import { TokenProps } from "@/app/types";
import Image from "next/image";

interface SelectTokenPayload {
  id: string;
  assetSymbol: string;
  decimals: string;
  assetTokenBalance: string;
}

interface SwapSelectTokenModalProps {
  tokensData: TokenProps[];
  selected: TokenProps;
  onClose: () => void;
  onSelect: (tokenData: TokenProps) => void;
}


const SelectTokenModal: FC<SwapSelectTokenModalProps> = ({
  tokensData,
  selected,
  onClose,
  onSelect,
}) => {
  console.log("tokensData", tokensData);
  const [isCopied, setIsCopied] = useState(0);
  const [themeDark] = useAtom(themeDarkAtom);
  const [searchQuery, setSearchQuery] = useState("");
  const copyToClipboard = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    address: string,
    id: number
  ) => {
    event.stopPropagation();
    navigator.clipboard.writeText(address);
    setIsCopied(id);
    setTimeout(() => {
      setIsCopied(0);
    }, 1000);
  };
  const ref = useRef<HTMLDivElement>(null);
  const [isShowSelectTokenModal, setIsShowSelectTokenModal] = useAtom(showSelectTokenModalAtom);

  useClickOutside(ref, () => {
    if (isShowSelectTokenModal) setIsShowSelectTokenModal(TokenSelection.None);
  });

  const handleSelectToken = (payload: SelectTokenPayload) => {
    const assetTokenData: TokenProps = {
      tokenSymbol: payload.assetSymbol,
      tokenId: payload.id,
      decimals: payload.decimals,
      tokenBalance: payload.assetTokenBalance,
    };
    onSelect(assetTokenData);
    onClose();
  };
  const popular_token_list = [
    { id: 1, name: "USDC" },
    { id: 2, name: "DOT" },
    { id: 3, name: "ASX" },
    { id: 4, name: "USDT" },
  ];
  const filteredTokenList = searchQuery.length > 0 ? tokensData.filter((token: any) =>
    token.assetTokenMetadata.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.assetTokenMetadata.symbol?.toLowerCase().includes(searchQuery.toLowerCase())
  ) : tokensData;

  const onSelectFavouriteToken = useCallback((tokenSymbol: string) => {
    const token: any = tokensData.find((item: any) => item.assetTokenMetadata.symbol?.toLowerCase() === tokenSymbol.toLowerCase())
    if(!token) return;
    handleSelectToken({
      id: token.tokenId,
      assetSymbol: token.assetTokenMetadata.symbol,
      decimals: token.assetTokenMetadata.decimals,
      assetTokenBalance: token.tokenAsset.balance,
    })
  }, [tokensData])

  return (
    <>
      <div className="w-screen h-screen fixed top-0 left-0 z-50 bg-black bg-opacity-75" />
      <div
        className="flex justify-center items-center bg-gradient-to-br from-[#5100FE] to-[#5100FE] dark:from-[#cab4fa] dark:to-[#5100FE] p-0.5 absolute rounded-3xl self-center z-50 sm:w-[546px] w-[95%] left-1/2 -translate-x-1/2 top-[10%] sm:top-[15%]"
        ref={ref}>
        <div className="flex flex-col gap-6 w-full px-4 sm:px-9 py-5 sm:py-10 bg-gradient-to-br from-[#2B0281] to-[#220068] dark:from-[#E8E8E8] dark:to-[#E8E8E8] text-[var(--text-maincolor)] dark:text-[#120038] rounded-3xl relative ">
          <div className="absolute top-5 right-5">
            <div
              className="flex justify-center items-center rounded-full w-12 h-12 text-2xl text-[var(--text-maincolor)] dark:text-[#120038] hover:bg-[#81818165] hover:text-white cursor-pointer"
              onClick={() => setIsShowSelectTokenModal(TokenSelection.None)}
            >
              X
            </div>
          </div>
          <div className="flex flex-col gap-4 sm:gap-8">
            <div className="flex flex-wrap justify-start items-center whitespace-nowrap text-2xl text-white dark:text-[#120038]">
              <p>Select a token</p>
            </div>
            <div className="flex flex-col gap-2 sm:gap-4">
              {/* Search Bar */}
              <div className="flex flex-row justify-between items-center bg-[#0F002ED9] dark:bg-white rounded-lg p-3 text-base text-[#B4D2FFBF] border-1 border-[#b4d2ff7e] dark:border-[#32009C]">
                <input
                  className="w-full bg-transparent border-none outline-none placeholder-[#7bb0ff79] dark:placeholder-[#120038] focus:placeholder-[#526481] dark:focus:placeholder-[#5264816f]"
                  placeholder="Search by token or paste address"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Image
                  width={12}
                  height={12}
                  src="/pools-icon/search.svg"
                  alt="Search"
                />
              </div>
              {/* Popular Tokens List */}
              <div className="text-base text-[#b4d2ff7c] dark:text-[#120038] font-bold">
                Popular Tokens
              </div>
              <div className="flex flex-wrap sm:flex-row justify-between items-center w-full">
                {popular_token_list.map((token) => (
                  <div
                    key={token.id}
                    className="w-[48%] sm:w-[23%] flex flex-row justify-start gap-2 sm:justify-between items-center px-3 py-1 mb-1 bg-[#0F002ED9] dark:bg-white rounded-lg border border-[#b4d2ff7e] dark:border-[#32009C] cursor-pointer"
                    onClick={() => {
                      onSelectFavouriteToken(token.name)
                    }}
                  >
                    <div className="rounded-full bg-gradient-to-r from-[#5100FE] to-[#32009C] p-0.5">
                      <img
                        src={`/logos/${token.name}.png`}
                        alt={`${token.name} Icon`}
                        className="w-6 h-6"
                      />
                    </div>
                    <p className="text-[#b4d2ff] dark:text-[#120038] font-bold">{token.name}</p>
                  </div>
                ))}
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
                {filteredTokenList?.map((token: any, idx) => (
                  <div
                    key={idx}
                    className={classNames(
                      "flex flex-row justify-between items-center w-full hover:bg-[#5000fe4f] dark:hover:bg-[white] p-1 rounded-lg",
                      { "bg-[#5000fe4f] dark:bg-[white]": token.tokenId === selected.tokenId }
                    )}
                    onClick={() => {
                      handleSelectToken({
                        id: token.tokenId,
                        assetSymbol: token.assetTokenMetadata.symbol,
                        decimals: token.assetTokenMetadata.decimals,
                        assetTokenBalance: token.tokenAsset.balance,
                      })
                    }}
                  >
                    <div className="flex flex-row justify-center items-center gap-3">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#5100FE] to-[#32009C] p-1">
                        <Image
                          src={`/logos/${token.assetTokenMetadata.symbol}.png`}
                          alt={`${token.assetTokenMetadata.name} Icon`}
                          width={20}
                          height={20}
                          onError={e => {
                            e.currentTarget.src = "/logos/DOT.png"
                            e.currentTarget.srcset = "/logos/DOT.png"
                          }}
                          className="w-5 h-5 sm:w-8 sm:h-8"
                        />
                      </div>
                      <div className="flex flex-col text-[#b4d2ffaf] dark:text-[#120038]">
                        <p className="text-lg font-bold">
                          {token.assetTokenMetadata.name}
                        </p>
                        <p className="text-sm">
                          {token.assetTokenMetadata.symbol}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <p className="text-right text-[#b4d2ffaf] dark:text-[#120038] text-lg font-bold">
                        {token.tokenAsset.balance}
                      </p>
                      <div className="flex flex-row justify-center items-center gap-2">
                        <p className=" text-[#b4d2ffaf] dark:text-[#120038] text-sm">
                          {/* {`${token.address?.slice(0, 6)}...${token.address?.slice(-6)}`} */}
                        </p>
                        {/* <div className="flex flex-row justify-center items-center gap-0.5">
                            {isCopied == token.id ? (
                              <Tooltip content="Copied" direction="left">
                                <Image
                                  width={12}
                                  height={12}
                                  key={token.id}
                                  src="/icons/copy.svg"
                                  alt="Copy"
                                  className="cursor-pointer"
                                />
                              </Tooltip>
                            ) : (
                              <Image
                                width={12}
                                height={12}
                                src="/icons/copy.png"
                                alt="Copy"
                                className="cursor-pointer"
                                onClick={(event) =>
                                  copyToClipboard(
                                    event,
                                    token.address,
                                    token.id
                                  )
                                }
                              />
                            )}
                            <Image
                              width={12}
                              height={12}
                              src="/icons/externalLink.png"
                              alt="External Link"
                              className="cursor-pointer"
                            />
                          </div> */}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SelectTokenModal;
