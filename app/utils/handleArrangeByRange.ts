import { initialPoolInfoType } from "./type";
import stringToNumber from "./stringToNumber";
const handleArrangeByRange = (
  poolInfo: initialPoolInfoType[],
  sortBy: string,
  sortPeriod: string,
  sortFrom: string,
  sortTo: string
) => {

const from = stringToNumber(sortFrom);
const to = stringToNumber(sortTo);

const filterPool = (value: number) => value >= from && value <= to;

const sortMap: { [key: string]: { [key: string]: keyof initialPoolInfoType } } = {
  volume: { "24H": "volume24h", "7D": "volume7d", "30D": "volume30d" },
  fees: { "24H": "fees24h", "7D": "fees7d", "30D": "fees30d" },
  apr: { "24H": "apr24h", "7D": "apr7d", "30D": "apr30d" },
  liquidity: { "24H": "liquidity", "7D": "liquidity", "30D": "liquidity" },
};

const key = sortMap[sortBy]?.[sortPeriod];

if (key) {
  return poolInfo.filter((pool) => filterPool(pool[key] as number));
}

return poolInfo;
};

export default handleArrangeByRange;
