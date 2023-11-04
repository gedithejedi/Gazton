import { Event } from "../../components/EventsDashboard";

import type { NextApiRequest, NextApiResponse } from 'next'
import { Network, Alchemy } from "alchemy-sdk";
import { AlchemySubscription } from "alchemy-sdk";
import { sendNotification } from "@/components/SendNotification";
import { Client } from "@xmtp/xmtp-js";
import { ethers } from "ethers";

const settings = {
  apiKey: process.env.ALCHEMY,
  network: Network.ETH_GOERLI,
};

const alchemy = new Alchemy(settings);

type ResData = {
  error?: string;
  message?: string;
}

const sendXMTPMessage = async (address: string, message: string) => {
  if (!process.env.NEXT_PUBLIC_ACC2_PK) return console.error("No secondary wallet PK provided");
  try {
    const provider = new ethers.providers.JsonRpcProvider(process.env.GOERLI_RPC_URL || "");
    const signer = new ethers.Wallet(process.env.NEXT_PUBLIC_ACC2_PK, provider);
    const xmtp = await Client.create(signer, { env: "production" });
    const conversation = await xmtp.conversations.newConversation(
      address,
    );
    conversation.send(message);
  } catch (err) {
    console.error(err);
  }
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResData>
) {
  if (req.method !== 'POST') return res.status(404).json({ error: 'request method not found' });
  const { events, address, xmtpAddress }: { events: Event[], address: string, xmtpAddress: string } = req.body;
  console.log(xmtpAddress);
  if (!events.length || !address || !xmtpAddress) return res.status(400).json({ error: 'invalid arguements passed' });
  alchemy.ws.removeAllListeners(); //TODO: find a better way to handle the events on/off switching

  for (const singleEvent of events) {
    const { eventName, subscribed }: Event = singleEvent;

    if (!eventName) return res.status(400).json({ error: 'invalid event parameters given' });

    const onSubscribeEventFire = (tx: any, eventName: string) => {
      if (!eventName) throw new Error("No event name found in event call.");
      sendNotification(eventName) // Push Protocol
      sendXMTPMessage(xmtpAddress, `The event "${eventName}" has been called in a smart contract ${address}`) //XMTP
    }

    if (subscribed) {
      console.log("sub", eventName);
      alchemy.ws.once(
        {
          method: AlchemySubscription.MINED_TRANSACTIONS,
          addresses: [
            {
              to: address,
            },
          ],
          includeRemoved: true,
          hashesOnly: false,
        },
        (tx) => onSubscribeEventFire(tx, eventName),
      );
    } else {
      console.log("unsub", eventName);
    }

  }
  return res.status(200).json({ message: 'Successfully edited an event listeners.' })
}
