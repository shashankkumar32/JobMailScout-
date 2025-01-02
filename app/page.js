"use client"
import Image from "next/image";
import { BackgroundGradientAnimation } from "@/app/components/background";

export default function Home() {
  return (
    <BackgroundGradientAnimation >
<div className="absolute z-50 inset-0 flex items-center justify-center text-white font-bold px-4 text-sm text-center md:text-4xl lg:text-2xl shadow-lg">
  <button
    onClick={() => console.log('clicked')}
    className="flex items-center justify-center space-x-1 p-2 md:p-1 border border-white rounded-full hover:shadow-lg backdrop-blur-sm bg-white/10 transition duration-200 ease-in-out"
  >
    <img
      src="/mail.gif" 
      alt="Loading Animation"
      className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 object-cover rounded-full pr-2"
    />
    <p className="bg-clip-text text-transparent drop-shadow-xl bg-gradient-to-b from-white/100 to-white/30 pr-4">
      Login with Google
    </p>
  </button>
</div>
</BackgroundGradientAnimation>
  )
}
