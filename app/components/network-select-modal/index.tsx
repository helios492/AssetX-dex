import { networkModalAtom } from "@/app/utils/store";
import { useAtom } from "jotai";
import Modal from "../modal";
import classNames from "classnames";
import { NetworkKeys } from "@/app/types/enum";
import Image from "next/image";
import { useState, useEffect } from "react";

const networks = [
  { name: NetworkKeys.Rococo },
  { name: NetworkKeys.Westend },
  { name: NetworkKeys.Kusama },
  { name: NetworkKeys.Polkadot },
]

const NetworkSelectModal = () => {
  const [networkModal, setNetworkModal] = useAtom(networkModalAtom);
  const [network, setNetwork] = useState<NetworkKeys>(NetworkKeys.Polkadot);

  useEffect(() => {
    const network = window.localStorage.getItem("network");
    if (network) {
      setNetwork(network as NetworkKeys);
    }
  }, []);

  const switchNetwork = (network: string) => {
    localStorage.network = network;
    setNetworkModal(false);
    window.location.reload();
  };

  return (
    <Modal isOpen={networkModal} onClose={() => setNetworkModal(false)} title="Select Network">
      <div className="grid grid-cols-2 gap-4">
      {networks.map((item, idx) => (
        <button
          key={idx}
          className={classNames(
            "flex flex-row justify-between items-center w-full hover:bg-[#5000fe4f] dark:hover:bg-[white] p-2 rounded-lg",
            { "bg-[#5000fe4f] dark:bg-[white]": item.name === network }
          )}
          onClick={() => switchNetwork(item.name)}
        >
        <div className="flex flex-row justify-center items-center gap-3">
            <div className="h-full rounded-full bg-gradient-to-r from-[#5100FE] to-[#32009C] p-1">
            </div>
            <Image src={`/network-icons/${item.name}.svg`} alt={item.name} width={32} height={32} />
            <div className="flex flex-col text-left text-[#b4d2ffaf] dark:text-[#120038]">
              <p className="text-lg font-bold">
              {item.name}
            </p>
          </div>
          </div>
        </button>
      ))}
      </div>
    </Modal>
  );
};

export default NetworkSelectModal;
