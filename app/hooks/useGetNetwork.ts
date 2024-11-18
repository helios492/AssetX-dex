import { NETWORKS } from "@/app/config/networkConfig";
import { NetworkKeys } from "@/app/types/enum";

const getNetwork = () => {
  if (typeof window !== 'undefined') {
    const network = window.localStorage.getItem("network") as NetworkKeys;
    if (network && NETWORKS[network]) {
      return NETWORKS[network];
    } else {
      window.localStorage.setItem("network", NetworkKeys.Polkadot);
    }
  }
  return NETWORKS[NetworkKeys.Polkadot];
};

const useGetNetwork = () => {
  return getNetwork();
};

export default useGetNetwork;
