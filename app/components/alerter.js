import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react"; // Import Terminal if needed, adjust the path accordingly

// interface AlertProps {
//   headsUp: string;
//   description: string;
// }

const CustomAlert = ({ headsUp, description,variant,children }) => {
  return (
    <Alert variant={variant}>
      <Terminal className="h-4 w-4" />
      <AlertTitle>{headsUp}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
      <div className="flex justify-center my-2">
        {children}
        </div>
    </Alert>
  );
};

export default CustomAlert;
