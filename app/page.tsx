import Image from "next/image";

export default function Page() {
  return (
    <>
      <div className="flex justify-center items-start h-[calc(100vh-90px)] rounded-tl-3xl bg-gradient-to-br from-[#3F055A] via-[#310099] to-[#5F20E5] box-shadow-inner">
        <Image
          width={1200}
          height={600}
          src={"/background.png"}
          alt="Background Logo"
        />
      </div>
    </>
  );
}
