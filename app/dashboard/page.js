
"use client";
import { GoogleGenerativeAI, HarmCategory } from "@google/generative-ai";
import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import CustomAlert from "../components/alerter";
import { TabsDemo } from "../components/customTab";
import CustomTable from "../components/customTable";
import ToApplyJobsTable from "../components/customTable2";

const APIKey = process.env.NEXT_PUBLIC_GENERATIVE_AI_API_KEY;
const Model = "gemini-2.0-flash-exp";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inputdata, setInputData] = useState('');
  const [formattedEmails, setFormattedEmails] = useState([]);
  const [responseData, setResponseData] = useState('');
  const [isChatRunning, setIsChatRunning] = useState(false);
  const [chatRan, setChatRan] = useState(false);
  
  const generationConfig = {
    temperature: 2,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
  };

  // Ref to prevent re-running of runChat
  const runChatRef = useRef(false); 

  function processResponseData(response) {
    const appliedJobs = response.Applied;
    const toApplyJobs = response.ToApply;
    setResponseData({
      summary: response.Summary,
      appliedJobs: appliedJobs,
      toApplyJobs: toApplyJobs,
    });
  }

  async function runChat() {
    // Prevent running if already executed
    if (runChatRef.current) return;
    
    console.log("run chat started");
    runChatRef.current = true; // Mark that runChat has been executed
    
    const genAI = new GoogleGenerativeAI(APIKey);
    const model = genAI.getGenerativeModel({ model: Model });
    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });

    const formatForGemini = (formattedEmails) => {
      return formattedEmails
        .map((email) => {
          return `
            Email ID: ${email.id}
            Subject: ${email.subject}
            From: ${email.from}
            Content: ${email.fullEmail.decodedBody}
          `;
        })
        .join("\n\n--------\n\n");
    };

    const str = formatForGemini(formattedEmails);

    setIsChatRunning(true);

    const result = await chatSession.sendMessage(
      `Process the following list of emails: ${str}.Filter only employment mails not swiggy zommato ,bank bazar,github,make my trip or other not relevant mails then Extract and organize the information into the following structure:
          names of th following field should be here is an example {
          ApplyLink
: 
"https://www.glassdoor.co.in/partner/jobListing.htm?pos=102&ao=1136043&s=224&guid=000001941cde1c689dce270d9adb804a&src=GD_JOB_AD&t=JA&vt=e&uido=A425BDA6497C8E544E799AA99FB125F0&ea=1&cs=1_b2bfdecc&cb=1735651238287&jobListingId=1009579190673&jrtk=5-yul1-0-1igee086igeda800-6b248bb0f0794cf4&tgt=GD_JOB_VIEW&utm_medium=email&utm_source=jobalert&utm_campaign=jobAlertAlert&utm_content=ja-jobpos2-1009579190673&utm_term=jadbnone"
CompanyName
: 
"ARK Power Solutions Pvt. Ltd."
Platform
: 
"Glassdoor"
Position
: 
"Software Developer"}
      Summary: A string summarizing the total number of jobs applied , and whether any meetings were scheduled.
      Applied: list of companies where applications were sent via platforms like LinkedIn or email. The output should include the following details:

CompanyName
Position 
Platform (e.g., LinkedIn, email, etc.)
status
Additionally:
This type of email should be added in applied (Hello Shashank,Thank you again for your interest in the Software Engineer position. Your application is being reviewed by our team and you should expect to receive an update from us soon. )

These applications were sent through platforms that do not provide a direct "Apply" link if you are getting apply link with them then its should not be added to applied , it should be add in ToApply.
The focus is on identifying applications sent via platforms like LinkedIn or email..
      ToApply: A list of recommended jobs to apply for, including the company name, position, platform name, and apply link.`
    );

    const responseText = result.response.text();
    const jsonOutput = JSON.parse(responseText);
    processResponseData(jsonOutput);
    setIsChatRunning(false);
  }

  const decodeBase64 = (encodedString) => {
    try {
      return decodeURIComponent(
        atob(encodedString.replace(/-/g, "+").replace(/_/g, "/"))
          .split("")
          .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
          .join("")
      );
    } catch (err) {
      console.error("Error decoding Base64:", err);
      return "Unable to decode email content.";
    }
  };

  useEffect(() => {
    if (status === "authenticated" && session?.accessToken) {
      const fetchEmails = async () => {
        try {
          const response = await fetch(
            "https://gmail.googleapis.com/gmail/v1/users/me/messages",
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${session.accessToken}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error("Failed to fetch emails");
          }
          

          const data = await response.json();

          if (data.messages) {
            const messageDetails = await Promise.all(
              data.messages.slice(0, 3).map(async (message) => {
                const messageRes = await fetch(
                  `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
                  {
                    method: "GET",
                    headers: {
                      Authorization: `Bearer ${session.accessToken}`,
                    },
                  }
                );
// fgjfkjg
                const messageData = await messageRes.json();

                let bodyData = "";
                if (messageData.payload.parts) {
                  const htmlPart = messageData.payload.parts.find(
                    (part) => part.mimeType === "text/html"
                  );
                  bodyData = htmlPart ? htmlPart.body?.data : "";
                } else if (messageData.payload.body?.data) {
                  bodyData = messageData.payload.body.data;
                }

                return {
                  ...messageData,
                  decodedBody: decodeBase64(bodyData),
                };
              })
            );

            setEmails(messageDetails);
            const formatted = messageDetails.map((email) => ({
              id: email.id,
              subject:
                email.payload.headers.find((header) => header.name === "Subject")
                  ?.value || "No Subject",
              from:
                email.payload.headers.find((header) => header.name === "From")
                  ?.value || "Unknown Sender",
              fullEmail: email,
            }));
            setFormattedEmails(formatted);
          } else {
            setEmails([]);
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchEmails();
    }
  }, [session, status]);

  useEffect(() => {
    if (formattedEmails.length > 0 && !runChatRef.current) {
      console.log("formattedEmails ready:", formattedEmails);
       runChat();
      setChatRan(true);
    }
  }, [formattedEmails]);

  if (status === "loading" || loading || isChatRunning) {
    return (
      <CustomAlert variant={"default"} headsUp={"Loading.."} description={"LOading"} >
           <img
          src="/loader.gif" // Replace with your SVG source
          alt="Placeholder"
          className="w-full h-auto object-contain"
        />
      </CustomAlert>
    );
  }

  if (!session) {
    return (
      <CustomAlert headsUp={"Session expired"} description={"Please sign in to view your Gmail inbox."} />
    );
  }

  if (error) {
    return <CustomAlert variant={"destructive"} headsUp={"error"} description={error} />;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    runChat();
  };

  return (
    <div className="border w-full flex justify-center">
      {
        console.log(responseData)
      }
      <TabsDemo
        firstComponent={<CustomTable responseData={responseData} />}
        secondComponent={<ToApplyJobsTable responseData={responseData} />}
      />
    </div>
  );
}
