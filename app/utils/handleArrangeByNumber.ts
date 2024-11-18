import { initialPoolInfoType } from "./type";

const handleArrangeByNumber = (poolInfo: initialPoolInfoType[], sortBy: string, sortDirection: string) => {
  if (!Array.isArray(poolInfo)) {
    console.error("Invalid argument:", poolInfo);
    return [];
  }

  const sortFields = {
    volume: 'volume24h',
    liquidity: 'liquidity',
    fees: 'fees24h',
    apr: 'apr24h'
  };

  const field = sortFields[sortBy as keyof typeof sortFields];
  if (!field) return poolInfo;

  const sortMultiplier = sortDirection === "up" ? -1 : 1;

  return poolInfo.sort((a, b) => {
    const aValue = Number(a[field as keyof typeof a]);
    const bValue = Number(b[field as keyof typeof b]);
    return sortMultiplier * (aValue - bValue);
  });
};

export default handleArrangeByNumber;
