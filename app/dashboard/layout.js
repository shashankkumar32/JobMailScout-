
import ProtectedPage from "../components/ProtectedPage"

import { useSession } from "next-auth/react";
import TwoColumnLayout from "../components/wrapperlayoutDash";
import { BackgroundGradientAnimation } from "@/app/components/background";
export default async function DashboardLayout({ children }) {



  return (
    <ProtectedPage>
      {/* <BackgroundGradientAnimation > */}
{/* <div className="absolute z-50 inset-0 flex items-center justify-center text-white font-bold px-4 text-sm text-center md:text-4xl lg:text-2xl shadow-lg"> */}
      {/* <h1>Dashboard</h1> */}
      {/* <TwoColumnLayout> */}
{/* ldfkldkf */}
      {children}

      {/* </TwoColumnLayout> */}

      
    {/* </div> */}
      {/* </BackgroundGradientAnimation> */}
        
    </ProtectedPage>
  );
}
