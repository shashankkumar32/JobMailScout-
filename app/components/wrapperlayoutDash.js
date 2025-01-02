"use client"
import React from "react";

import { useSession } from "next-auth/react";
const TwoColumnLayout = ({ children }) => {
    const { data: session } = useSession();
  return (
    <div className="flex justify-center items-center min-h-screen p-6">
      {/* Column 1 */}
      <div className="flex flex-col items-center w-[300px] h-[600px] bg-white border border-gray-300 rounded-tl-lg rounded-bl-lg shadow-lg p-4">
        {/* Top Component */}
        <div className="p-6 mb-6  rounded-lg  m-1">
          {session ? (
            <div className="flex flex-col items-center">
              {/* Circle with Initial */}
              <div className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center mb-6">
                <span className="text-white font-bold text-2xl">
                  {session.user.name ? session.user.name[0] : "U"}
                </span>
              </div>
              {/* User Name */}
              <p className="text-gray-700 text-xl mb-3">{session.user.name}</p>
              {/* Email Address */}
              <p className="text-gray-500 text-sm">{session.user.email}</p>
            </div>
          ) : (
            <p className="text-gray-700 text-center">Not logged in</p>
          )}
        </div>

        {/* Separator */}
        <div className="w-full h-[1px] bg-gray-300 mb-4 flex justify-center items-center "></div>

        {/* Image Section */}
        <img
          src="/loader.gif" // Replace with your SVG source
          alt="Placeholder"
          className="w-full h-auto object-contain"
        />
      </div>

      {/* Column 2 */}
      <div className="relative w-[600px] h-[600px] border-gray-300 overflow-auto rounded-tr-lg rounded-br-lg shadow-lg  bg-white  items-center">
        {/* Child Component Container */}
        {/* <div className="bg-white  overflow-auto rounded-tr-lg rounded-br-lg shadow-lg w-full h-[40px] mt-[60px] text-black">
          Heading
        </div> */}
       <div className="bg-white p-6 flex justify-center rounded-br-lg w-full h-full text-black  shadow-gray-500/50">
  {children}
</div>

      </div>
    </div>
  );
};

export default TwoColumnLayout;
