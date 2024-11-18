"use client";
import SideBarLinks from "../sidebar/sidebar-links";
export default function SideBar() {
  return (
    <>
      <div className="flex-col h-[calc(100vh-90px)] pl-[2%] pr-[1.5%] py-10 w-[350px] sm:flex hidden sticky top-[90px] z-30 overflow-auto">
        <SideBarLinks />
      </div>
    </>
  );
}
