import Image from "next/image";

interface TokenIconProps {
  src?: string;
  token?: string;
  width: number;
  height: number;
}

const TokenIcon = ({ token, width, height, src }: TokenIconProps) => {
  return (
    <Image
      src={src ? src : `/logos/${token}.png`}
      onError={e => {
        e.currentTarget.src = "/logos/DOT.png"
        e.currentTarget.srcset = "/logos/DOT.png"
      }}
      alt="Token Icon"
      width={width}
      height={height}
      className="rounded-full"
    />
  );
};

export default TokenIcon;
