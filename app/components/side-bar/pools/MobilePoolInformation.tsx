import Image from "next/image";
import numberToString from "../../../utils/numberToString";

interface MobilePoolInformationProps {
  id: number;
  tokenA: string;
  tokenB: string;
  favourite: boolean;
  volume24h: number;
  volume7d: number;
  volume30d: number;
  apr24h: number;
  apr7d: number;
  apr30d: number;
  sortPeriod?: string;
}

const MobilePoolInformation: React.FC<MobilePoolInformationProps> = ({
  id,
  tokenA,
  tokenB,
  favourite,
  volume24h,
  volume7d,
  volume30d,
  apr24h,
  apr7d,
  apr30d,
  sortPeriod,
}) => {
  let volume: string,
    apr: string = "";

  if (sortPeriod == "24H") {
    volume = (volume24h / 1000000).toFixed(2);
    apr = numberToString(apr24h);
  } else if (sortPeriod == "7D") {
    volume = (volume7d / 1000000).toFixed(2);
    apr = numberToString(apr7d);
  } else {
    volume = (volume30d / 1000000).toFixed(2);
    apr = numberToString(apr30d);
  }
  return (
    <>
      <tr key={id} className="flex flex-row justify-between items-center h-16">
        <td className="flex flex-col justify-start items-start w-[40%] px-6 py-2 gap-1">
          {/* Token pair images */}
          <div className="flex items-center gap-4">
            <div className="flex justify-start items-center w-4 h-4 rounded-full bg-gradient-to-r from-[#5100FE] to-[#32009C] p-0.5 relative">
              <Image
                width={16}
                height={16}
                src={`/logos/${tokenA}.png`}
                alt="Token Icon"
              />
              <div className="flex justify-center items-center w-4 h-4 rounded-full bg-gradient-to-r from-[#5100FE] to-[#32009C] p-0.5 absolute left-[75%]">
                <Image
                  width={16}
                  height={16}
                  src={`/logos/${tokenB}.png`}
                  alt="Token Icon"
                />
              </div>
            </div>
            {favourite && (
              <Image
                width={20}
                height={20}
                src="/pools-icon/star-fill.svg"
                alt="Star Icon"
                className="flex w-5 h-5 cursor-pointer"
              />
            )}
          </div>
          <div className="flex justify-center items-center gap-1">
            <p>
              {tokenA}-{tokenB}
            </p>
          </div>
        </td>
        <td className="text-right font-medium">${volume}M</td>
        <td className="flex flex-col justify-start items-center w-[25%] pr-6 gap-1">
          <div className="text-left w-full">{apr}%</div>
          <div className="flex flex-row w-full">
            <div className="w-[90%] h-2 bg-[#E6007A] rounded-full" />
            <div className="w-[10%] h-2 bg-[#9747FF] rounded-full" />
          </div>
        </td>
      </tr>
    </>
  );
};

export default MobilePoolInformation;
