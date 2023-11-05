import type { NextApiRequest, NextApiResponse } from 'next'
import { Network, Alchemy } from "alchemy-sdk";
import { AlchemySubscription } from "alchemy-sdk";

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
if (!projectId) {
  throw new Error("You need to provide NEXT_PUBLIC_PROJECT_ID env variable");
}
export interface Event {
  eventName: string;
  subscribed: boolean
}

const settings = {
  apiKey: process.env.ALCHEMY_GOERLI,
  network: Network.ETH_GOERLI,
};

const notifyApiSecret = process.env.NOTIFY_API_SECRET;
if (!notifyApiSecret) {
  throw new Error("You need to provide NOTIFY_API_SECRET env variable");
}

const alchemy = new Alchemy(settings);

type ResData = {
  error?: string;
  message?: string;
}

const sendMessage = async (message: string, eventName: string) => {
  console.log("message");
  console.log(message);
  try {
    const result = await fetch(
      `https://notify.walletconnect.com/${projectId}/notify`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${notifyApiSecret}`,
        },
        body: JSON.stringify({
          notification: {
            type: "5472094a-3ac1-4483-a861-26aef4ca05ae",
            title: `Event ${eventName} was executed`,
            body: message,
            icon: `https://gazton.vercel.app/WalletConnect-blue.svg`,
            url: "https://gazton.vercel.app/",
          },
          accounts: [
            'eip155:1:0xB3622628546DE921A70945ffB51811725FbDA109' // TODO: change to be more flexible
          ]
        }),
      }
    );

    const gmRes = await result.json();
    console.log(gmRes);
  } catch (err) {
    console.error(err);
  }
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResData>
) {
  if (req.method !== 'POST') return res.status(404).json({ error: 'request method not found' });
  const { events, address }: { events: Event[], address: string } = req.body;

  if (!events.length || !address) return res.status(400).json({ error: 'invalid arguements passed' });
  alchemy.ws.removeAllListeners(); //TODO: find a better way to handle the events on/off switching

  for (const singleEvent of events) {
    const { eventName, subscribed }: Event = singleEvent;

    if (!eventName) return res.status(400).json({ error: 'invalid event parameters given' });

    const onSubscribeEventFire = (tx: any, eventName: string) => {
      if (!eventName) throw new Error("No event name found in event call.");
      sendMessage(`The event "${eventName}" has been called in a smart contract ${address}`, eventName)
    }
    console.log(address);
    if (subscribed) {
      console.log("sub", eventName);
      alchemy.ws.on(
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
        (tx) => {
          console.log(`"the event ${eventName} has fired`);
          onSubscribeEventFire(tx, eventName)
        },
      );

    } else {
      console.log("unsub", eventName);
    }

  }
  return res.status(200).json({ message: 'Successfully edited an event listeners.' })
}
