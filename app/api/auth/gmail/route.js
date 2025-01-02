
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.accessToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const accessToken = session.accessToken;

  try {
    // console.log("Access Token:", accessToken);

    const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();
    
    if (data.messages) {
      // Fetch message details for the first 5 messages
      const messageDetails = await Promise.all(
        data.messages.slice(0, 5).map(async (message) => {
          const messageRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          const messageData = await messageRes.json();
          return messageData;
        })
      );
      
      return res.status(200).json({ messages: messageDetails });
    } else {
      return res.status(200).json({ messages: [] });
    }
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch emails", message: error.message });
  }
}
