import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { Provider as JotaiProvider } from "jotai";
import { Metadata } from "next";
import "./globals.css";
import { Providers as ThemeProvider } from "./providers";
import AppProvider from "./state";
import NavBar from "./ui/navbar";
import SideBar from "./ui/sidebar";
import { Toaster } from 'react-hot-toast';
config.autoAddCss = false

export const metadata: Metadata = {
  title: "AssetX",
  description: "Creating AssetX Dex on Polkadot chain",
  icons: {
    icon: "/AX-logo.ico",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head />
      <body>
        <ThemeProvider>
          <main>
            <JotaiProvider>
              <AppProvider>
                <div className="flex flex-col">
                  <NavBar />
                  <div className="flex flex-row bg-[#220068] dark:bg-white relative">
                    <SideBar />
                    <div className="flex flex-row justify-center items-center w-full z-50">
                      {children}
                    </div>
                  </div>
                </div>
              </AppProvider>
            </JotaiProvider>
          </main>
        </ThemeProvider>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
