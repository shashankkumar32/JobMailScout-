import React from "react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator"

export function TabsDemo({ firstComponent, secondComponent }) {
  return (
    <Tabs defaultValue="first" className="w-[720px] m-1 mt-3">
      <TabsList className="grid w-full grid-cols-2 bg-gray-800">
  <TabsTrigger
    value="first"
    className="text-white bg-gray-900 hover:bg-gray-700 border border-gray-700"
  >
 Apllied/Status
  </TabsTrigger>
  <TabsTrigger
    value="second"
    className="text-white bg-gray-900 hover:bg-gray-700 border border-gray-700"
  >
 To Apply
  </TabsTrigger>
</TabsList>

      <Separator className="my-3"/>
      <TabsContent value="first">{firstComponent}</TabsContent>
      <TabsContent value="second">{secondComponent}</TabsContent>
    </Tabs>
  );
}

