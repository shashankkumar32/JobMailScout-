"use client"
import { AppSidebar } from "../components/sidebarMaker/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

import { useSession } from "next-auth/react";

export default function MainLayout({children1,children2,children3}) {
   const { data: session } = useSession();
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                  Processing your Mails  
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>processing with Gemini</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex gap-4 p-4 pt-0 bg-transparent">
          <div className="grid auto-rows-min gap-6 md:grid-cols-1">
            <div className="flex flex-col rounded-xl bg-muted/50" ><div className="p-4"></div><div className="p-4"></div></div>
            {/* <div className="aspect-video rounded-xl bg-muted/50" />cvcv
            <div className="aspect-video rounded-xl bg-muted/50" /> */}
          </div>
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" >
          <div className="grid auto-rows-min gap-6 md:grid-cols-3 p-4" >
            <div className=" flex justify-center h-[600px] "><ScrollArea className="h-[600px] w-[350px] rounded-md border p-4">{children3}</ScrollArea></div>
            <div className=" flex justify-center h-[450px] "><ScrollArea className="h-[600px] w-[350px] rounded-md border p-4">{children2}</ScrollArea></div>
            <div className=" flex justify-center h-[600px] "><ScrollArea className="h-[600px] w-[350px] rounded-md border p-4">{children1}</ScrollArea></div>
            {/* <div className="aspect-video rounded-xl bg-muted/50" />cvcv
            <div className="aspect-video rounded-xl bg-muted/50" /> */}
           
         </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
