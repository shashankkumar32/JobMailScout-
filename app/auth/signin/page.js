"use client";

import { BackgroundGradientAnimation } from "@/app/components/background";

import { signIn } from "next-auth/react";

export default function SignIn() {
  return (
    <div>  
       <BackgroundGradientAnimation >
      <div className="absolute z-50 inset-0 flex items-center justify-center text-white font-bold px-4 text-sm text-center md:text-4xl lg:text-2xl shadow-lg">
        <button
           onClick={() => signIn("google")}
           className="flex items-center justify-center space-x-1 p-2 md:p-1 border-4 border-white rounded-full hover:shadow-lg backdrop-blur-sm bg-gradient-to-r from-white/0 to-cyan-500/0 transition duration-200 ease-in-out"

          // className="flex items-center justify-center space-x-1 p-2 md:p-1 border border-white rounded-full hover:shadow-lg backdrop-blur-sm bg-white/10 transition duration-200 ease-in-out"
        >
          <img
            src="/mail.gif" // Replace with the actual path or URL to your GIF
            alt="Loading Animation"
            className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 object-cover rounded-full pr-2"
          />
          {/* <p className="bg-clip-text text-transparent drop-shadow-xl bg-gradient-to-b from-white/100 to-cyan/30 pr-4">
            Login with Google
          </p> */}
          <p className="bg-clip-text text-transparent drop-shadow-md bg-gradient-to-b from-gray-900 to-white-200 pr-4">
  Login with Google
</p>

        </button>
      </div>
      </BackgroundGradientAnimation>
    {/* <BackgroundGradientAnimation>

    </BackgroundGradientAnimation> */}
     
    </div>
  );
}
