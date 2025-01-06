
"use client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import CustomAlert from "../components/alerter";
import { TabsDemo } from "../components/customTab";
import CustomTable from "../components/customTable";
import ToApplyJobsTable from "../components/customTable2";
import { Skeleton } from "@/components/ui/skeleton";
// import { useTheme } from "next-themes"
import { useTheme } from "next-themes";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
// import MainLayout from "../test/page";
import MainLayout from "../components/wrapper";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
const APIKey = process.env.NEXT_PUBLIC_GENERATIVE_AI_API_KEY;
const Model = "gemini-2.0-flash-exp";

export default function Dashboard() {
  const { theme, setTheme } = useTheme();
  const { data: session, status } = useSession();
  const [emails, setEmails] = useState([]);
  const [formattedEmails, setFormattedEmails] = useState([]);
  const [responseData, setResponseData] = useState({
    summary: '',
    appliedJobs: [],
    toApplyJobs: [],
  });
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState(null);
 
  const [isChatRunning, setIsChatRunning] = useState(false);
  const [currentBatchIndex, setCurrentBatchIndex] = useState(0);
  const [cumulativeData, setCumulativeData] = useState([]);
  const generationConfig = {
    temperature: 2,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
  };

  const runChatRef = useRef(false);

  const processResponseData = (response) => {
    const appliedJobs = Array.isArray(response.Applied) ? response.Applied : [];
    const toApplyJobs = Array.isArray(response.ToApply) ? response.ToApply : [];

    setResponseData(prevState => ({
      summary: response.Summary,
      appliedJobs: [...prevState.appliedJobs, ...appliedJobs],
      toApplyJobs: [...prevState.toApplyJobs, ...toApplyJobs],
    }));
  };

  const runChat = async (emailsBatch) => {
    console.log("emailbatch",emailsBatch)
    if (runChatRef.current) return;
    runChatRef.current = true;
    setLoading(true);
    console.log(loading)

    try {
      const genAI = new GoogleGenerativeAI(APIKey);
      const model = genAI.getGenerativeModel({ model: Model });
      const chatSession = model.startChat({ generationConfig, history: [] });

      const formatForGemini = (formattedEmails) => {
        return formattedEmails
          .map(email => `
              Email ID: ${email.id}
              Subject: ${email.subject}
              From: ${email.from}
              Content: ${email.fullEmail.decodedBody}
            `)
          .join("\n\n--------\n\n");
      };

      const str = formatForGemini(emailsBatch);
      const result = await chatSession.sendMessage(
        `Process the following list of emails: ${str}. give the outpust in this format:
       {
        "id":""
  "from": "",
  "subject": "",
  "summary": "",
  "companyName": "",
  "appliedDate": "",
  "sendTo": "",
  "similarJob": [
    {
      "company": "",
      "jobTitle": "",
      "location": "",
      "applyLink": ""
    }
  ]
      }]
  id: it there with the data send looks like this 
id
: 
"1943ad1ec8b6f522"
  from: This is the sender's email address. If it's from LinkedIn, proceed to check for an appliedDate.

If the email is from LinkedIn: Extract the appliedDate from the email content.
If the email is not from LinkedIn: Write "notRelevant" for the appliedDate.
subject: This is the subject of the email.

summary: This should summarize the content of the email(in less than 34 words).

companyName: Extract the company name mentioned in the email.

appliedDate:

For LinkedIn emails: Extract the date the job was applied for.
For other emails: Write "notRelevant".
sendTo:

If there’s a specific recipient listed: Add the recipient's email or name.
If it’s not relevant: Leave this as an empty string ("").
similarJob: A list of similar job opportunities.

If the email contains similar jobs: Populate the array with details (company, jobTitle, location, applyLink).
If no similar jobs are found: Return an empty array ([]).
`
      );

      const responseText = await result.response.text();
      const jsonOutput = JSON.parse(responseText);
      console.log("batch response",jsonOutput)
      setCumulativeData(prevData => [...prevData, ...jsonOutput]);
      processResponseData(jsonOutput);
      // setLoading(false);
      // console.log(loading)
    } catch (error) {
      console.error("Error processing batch:", error);
    } finally {
      runChatRef.current = false;
    }
  };

  const handleSequentialRunChat = async () => {
    setIsProcessing(false);
    console.log(isProcessing)
    const batchSize = 3;
    const totalBatches = Math.ceil(formattedEmails.length / batchSize);

    for (let i = currentBatchIndex; i < totalBatches; i++) {
      const batch = formattedEmails.slice(i * batchSize, (i + 1) * batchSize);
      await runChat(batch); // Wait for current batch to finish
      setCurrentBatchIndex(i + 1); // Update index for next batch
    }
    setLoading(false)
    console.log("sequential",loading)
  };

  useEffect(() => {
    if (status === "authenticated" && session?.accessToken) {
      const fetchEmails = async () => {
        try {
          const today = new Date();
          const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime() / 1000;
          const endOfDay = startOfDay + 86400;

          const query = `after:${startOfDay} before:${endOfDay}`;
          const response = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${session.accessToken}`,
              },
            }
          );

          if (!response.ok) throw new Error("Failed to fetch emails");

          const data = await response.json();
          if (data.messages) {
            const messageDetails = await Promise.all(
              data.messages.slice(0, 12).map(async (message) => {
                const messageRes = await fetch(
                  `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
                  {
                    method: "GET",
                    headers: {
                      Authorization: `Bearer ${session.accessToken}`,
                    },
                  }
                );

                const messageData = await messageRes.json();
                const bodyData = messageData.payload.parts
                  ? messageData.payload.parts.find(part => part.mimeType === "text/html")?.body.data || ""
                  : messageData.payload.body?.data || "";

                return {
                  ...messageData,
                  decodedBody: decodeBase64(bodyData),
                };
              })
            );

            setEmails(messageDetails);
            const formatted = messageDetails.map(email => ({
              id: email.id,
              subject: email.payload.headers.find(header => header.name === "Subject")?.value || "No Subject",
              from: email.payload.headers.find(header => header.name === "From")?.value || "Unknown Sender",
              fullEmail: email,
            }));
            setFormattedEmails(formatted);
          } else {
            setEmails([]);
          }
        } catch (err) {
          setError(err.message);
        } finally {
          // setLoading(false);
        }
      };

      fetchEmails();
    }
  }, [session, status]);

  const decodeBase64 = (encodedString) => {
    try {
      return decodeURIComponent(
        atob(encodedString.replace(/-/g, "+").replace(/_/g, "/"))
          .split("")
          .map(c => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
          .join("")
      );
    } catch (err) {
      console.error("Error decoding Base64:", err);
      return "Unable to decode email content.";
    }
  };



  if (!session) {
    return <CustomAlert headsUp="Session expired" description="Please sign in to view your Gmail inbox." />;
  }

  if (error) {
    return <CustomAlert variant="destructive" headsUp="Error" description={error} />;
  }
  const CumulativeDataComponent = ({ cumulativeData }) => {
    return (
      <div>
        {cumulativeData?.map((item, index) => (
          <div key={index} className="space-y-4 my-2">
            <div className="space-y-1">
              <h4 className="text-sm text-white font-medium leading-none">
                {item.from || "No sender"}
              </h4>
              <p className="text-sm text-muted-foreground">
                {item.subject || "No subject"}
              </p>
            </div>
            <Separator className="my-4" />
            <div className="flex h-5 items-center space-x-3 text-xs  ">
              <div className="text-muted-foreground ">{item.companyName || "No company name"}</div>
              <Separator orientation="vertical" />
              <div className="text-muted-foreground ">{item.sendTo || "No recipient"}</div>
              <Separator orientation="vertical" />
              <div className="text-muted-foreground ">{item.appliedDate || "No applied date"}</div>
            </div>
            <Separator className="my-6" />
          </div>
        ))}
        {loading && (
  <div  className="space-y-4 my-2">
    <div className="space-y-1">
      <h4 className="w-36 h-5 bg-gray-300 animate-pulse rounded-md"></h4>
      <p className="w-48 h-4 bg-gray-300 animate-pulse rounded-md"></p>
    </div>
    <Separator className="my-4" />
    <div className="flex h-5 items-center space-x-3 text-xs">
      <div className="w-32 h-5 bg-gray-300 animate-pulse rounded-md"></div>
      <Separator orientation="vertical" />
      <div className="w-32 h-5 bg-gray-300 animate-pulse rounded-md"></div>
      <Separator orientation="vertical" />
      {/* <div className="w-32 h-5 bg-gray-300 animate-pulse rounded-md"></div> */}
    </div>
    <Separator className="my-6" />
  </div>
)}

      </div>
    );
  };
const SummaryJobDetails=({ cumulativeData })=> {
    return (
      <div className="space-y-4">
        {cumulativeData.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex h-5 text-sm text-white  items-center space-x-3 text-sm px-1 ">
              <div >{item.from.slice(0,22) || "From not provided"}</div>
             
              <Separator className="w-1 bg-white"orientation="vertical" />
              <div>{item.companyName || "Company name not provided"}</div>
            </div>
            
  
            <div className="flex  items-center space-x-4 text-sm">
             
              <Separator orientation="vertical" />
              <div className="text-sm flex justify-center text-muted-foreground" ><ScrollArea className="h-[150px]  flex justify-center pt-4 " >
                {item.summary || "Summary not provided"}
                </ScrollArea>
                </div>
            </div>
            <Separator/>
            
          </div>
        ))}
   {loading && (
  <div className="space-y-4">
    {[...Array(3)].map((_, index) => (
      <div key={index} className="space-y-1">
        <div className="flex h-5 items-center space-x-3 px-1">
          <div className="w-36 h-5 bg-gray-300 animate-pulse rounded-md"></div>
          <Separator className="w-1 bg-white" orientation="vertical" />
          <div className="w-28 h-5 bg-gray-300 animate-pulse rounded-md"></div>
        </div>
        <div className="flex items-center space-x-4">
          <Separator orientation="vertical" />
          <div className="w-full h-[150px] bg-gray-300 animate-pulse rounded-md"></div>
        </div>
        <Separator />
      </div>
    ))}
  </div>
)}
      </div>
    );
  }
const SimilarJobsComponent = ({ cumulativeData }) => {
  return (
    <div>
      <Command className="rounded-lg border shadow-md md:max-w-[300px]">
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {/* Similar Jobs */}
          <CommandGroup key="similar" heading="Similar Jobs">
            {cumulativeData.flatMap((item) =>
              item.similarJob.map((job, index) => (<div  key={`${item.companyName}-${index}+${item.id}`}>
                
                <CommandItem key={`${item.companyName}-${index}+${item.id}`}>
                  <div className="flex flex-col w-2/3">
                  <p className="text-sm text-muted-foreground ">
      {(job.company || "Unknown Company").slice(0, 15)}
    </p>
    <div className="font-medium text-gray-800">
      {(job.jobTitle || "No job title provided").slice(0, 18)}
    </div>
                  </div>
                  {/* <p>{job.company.slice(0, 12)}</p>
                  <div className="text-muted-foreground text-sm">
                    {job.jobTitle.slice(0, 12) || "No job title provided"}
                  </div> */}
                  <button
                    className="ml-auto px-2 py-1  text-muted-foreground  text-xs font-normal border-4   bg-black-500 rounded hover:bg-black-600"
                    onClick={() => window.open(job.applyLink, "_blank")}
                  >
                    Apply
                  </button>
                </CommandItem>
                  <Separator/>
                    </div>
              ))
            )}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
};

  return (
    <div className={theme === "dark" ? "dark" : "dark"}>
      <MainLayout children1={<SimilarJobsComponent cumulativeData={cumulativeData} />} children2={<div> <SummaryJobDetails cumulativeData={cumulativeData} /> </div>} children3={<CumulativeDataComponent cumulativeData={cumulativeData} />}/>
        <AlertDialog open={isProcessing} onOpenChange={setIsProcessing}>
 
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Instructions</AlertDialogTitle>
          <AlertDialogDescription>
            This action will fetch your emails from Gmail. There is no way this application can store your data or misuse it. There is no backend or database connection, nor any analytical tool that can track your actions.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={handleSequentialRunChat}
            // disabled={isProcessing}
          >
            Proceed
            {/* {isProcessing ? "Processing..." : "Start Sequential Processing"} */}
          </button>
          {/* <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu> */}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

      {/* <TabsDemo
        firstComponent={<CustomTable responseData={responseData} />}
        secondComponent={<ToApplyJobsTable responseData={responseData} />}
      /> */}
      {/* {JSON.stringify(cumulativeData)} */}
    </div>
  );
}
