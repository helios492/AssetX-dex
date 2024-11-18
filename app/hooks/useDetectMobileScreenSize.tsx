import { useEffect } from "react";

const useDetectMobileScreenSize = (action: () => void) => {
  useEffect(() => {
    const mediaQueryMobile = window.matchMedia("(max-width: 640px)");

    const handleMediaQueryChange = () => {
      if (mediaQueryMobile.matches) {
        console.log("Screen size is less than 640px");
        action();
      }
    };

    handleMediaQueryChange(); // Initial check

    mediaQueryMobile.addEventListener("change", handleMediaQueryChange);

    return () => {
        mediaQueryMobile.removeEventListener("change", handleMediaQueryChange);
    };
  }, []);
};

export default useDetectMobileScreenSize;
