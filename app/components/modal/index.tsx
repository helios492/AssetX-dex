import { FC, useRef } from "react";

interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: FC<ModalProps> = ({ isOpen, title, onClose, children }) => {

  if (!isOpen) return null;
  
  return (
    <div className="fixed top-0 left-0 w-screen h-screen z-[99]">
      <div className="w-screen h-screen fixed top-0 left-0 z-50 bg-black bg-opacity-75" />
      <div
        className="flex justify-center items-center bg-gradient-to-br from-[#5100FE] to-[#5100FE] dark:from-[#cab4fa] dark:to-[#5100FE] p-0.5 absolute rounded-3xl self-center z-50 sm:w-[546px] w-[95%] left-1/2 -translate-x-1/2 top-[10%] sm:top-[15%]"
      >
      <div className="flex flex-col gap-6 w-full px-4 sm:px-9 py-5 sm:py-10 bg-gradient-to-br from-[#2B0281] to-[#220068] dark:from-[#E8E8E8] dark:to-[#E8E8E8] text-[var(--text-maincolor)] dark:text-[#120038] rounded-3xl relative ">
        <div className="absolute top-5 right-5">
          <div
            className="flex justify-center items-center rounded-full w-12 h-12 text-2xl text-[var(--text-maincolor)] dark:text-[#120038] hover:bg-[#81818165] hover:text-white cursor-pointer"
            onClick={onClose}
          >
            X
          </div>
        </div>
        <div className="flex flex-col gap-4 sm:gap-8">
          <div className="flex flex-wrap justify-start items-center whitespace-nowrap text-2xl text-white dark:text-[#120038]">
            <p>{title}</p>
          </div>
          {children}
        </div>
      </div>
      </div>
    </div>
  );
};

export default Modal;