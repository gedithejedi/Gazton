import { Button, Tooltip } from "antd";
import { useAccount, useSignMessage } from 'wagmi';
import useIsHydrated from '@/hooks/useIsHydrated';
import Layout from '@/components/Layout';

import {
  useInitWeb3InboxClient,
  useManageSubscription,
  useSubscription,
  useW3iAccount,
} from "@web3inbox/widget-react";
import "@web3inbox/widget-react/dist/compiled.css";

import useSendNotification from "../utils/useSendNotification";
import { useCallback, useEffect, useState } from 'react';
import Preferences from '@/components/Preferences';
import Messages from '@/components/Messages';
import Events from '@/components/Events';
import ContractForm from '@/components/ContractForm';
import SectionTitle from "@/components/SectionTitle";

export interface Event {
  eventName: string;
  subscribed: boolean
}

export type Events = Event[];

export default function Home() {
  const [contractEvents, setContractEvents] = useState<Events>([]);
  const [contractAddress, setContractAddres] = useState("");
  const { address, isConnecting, isDisconnected } = useAccount({
    onDisconnect: () => {
      setAccount("");
    },
  });
  const isHydrated = useIsHydrated();
  const { subscription } = useSubscription()
  console.log(subscription);
  const projectId = process.env.NEXT_PUBLIC_PROJECT_ID as string;
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN as string;

  /** Web3Inbox SDK hooks **/
  const isW3iInitialized = useInitWeb3InboxClient({
    projectId,
    domain: appDomain,
    isLimited: process.env.NODE_ENV == "production",
  });
  const {
    account,
    setAccount,
    register: registerIdentity,
    identityKey,
  } = useW3iAccount();
  const {
    subscribe,
    unsubscribe,
    isSubscribed,
    isSubscribing,
    isUnsubscribing,
  } = useManageSubscription(account);

  const { signMessageAsync } = useSignMessage();
  const { handleSendNotification, isSending } = useSendNotification();

  const signMessage = useCallback(
    async (message: string) => {
      const res = await signMessageAsync({
        message,
      });
      return res as string;
    },
    [signMessageAsync]
  );

  // We need to set the account as soon as the user is connected
  useEffect(() => {
    if (!Boolean(address)) return;
    setAccount(`eip155:1:${address}`);
  }, [signMessage, address, setAccount]);

  const handleRegistration = useCallback(async () => {
    if (!account) return;
    try {
      await registerIdentity(signMessage);
    } catch (registerIdentityError) {
      console.error({ registerIdentityError });
    }
  }, [signMessage, registerIdentity, account]);

  useEffect(() => {
    // register even if an identity key exists, to account for stale keys
    handleRegistration();
  }, [handleRegistration]);

  const handleSubscribe = useCallback(async () => {
    if (!identityKey) {
      await handleRegistration();
    }

    await subscribe();
  }, [subscribe, identityKey])

  // handleSendNotification will send a notification to the current user and includes error handling.
  // If you don't want to use this hook and want more flexibility, you can use sendNotification.
  const handleTestNotification = useCallback(async () => {
    if (isSubscribed) {
      handleSendNotification({
        title: "GM Hacker",
        body: "Hack it until you make it!",
        icon: `${window.location.origin}/notification.png`,
        url: window.location.origin,
        // ID retrieved from explorer api - Copy your notification type from WalletConnect Cloud and replace the default value below
        type: "5472094a-3ac1-4483-a861-26aef4ca05ae",
      });
    }
  }, [handleSendNotification, isSubscribed]);

  return (
    <Layout>
      <div className='pt-10 gap-5 flex flex-col'>
        {isHydrated && isConnecting && <h2>Connecting…</h2>}
        {isHydrated && isDisconnected && !address && (
          <div className='flex flex-col justify-center'>
            <h2 className='font-medium'>Please connect your wallet</h2>
            <Button type="primary" onClick={() => open()}>Open Connect Modal</Button>
          </div>
        )}

        {isSubscribed ? (
          <div className='flex gap-5'>

            {isHydrated && address && <div className='flex flex-col gap-5'>
              <ContractForm setContractEvents={setContractEvents} setContractAddres={setContractAddres} />
              {!!contractEvents.length && contractAddress !== "" && <Events events={contractEvents} contractAddress={contractAddress} />}
            </div>}

            <div className="flex gap-5 flex-col">
              <Messages />
              {isHydrated && (
                <div className="flex flex-wrap w-full bg-slate-100 justify-center gap-8">
                  <Preferences unsubscribe={unsubscribe} isW3iInitialized={isW3iInitialized} loading={isUnsubscribing} />
                </div>
              )}

              <Button
                type="primary"
                onClick={handleTestNotification}
                disabled={!isW3iInitialized}
                loading={isSending}
              >
                Send test notification
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <SectionTitle >Click the button to enable Notifications</SectionTitle>
            <Tooltip placement="top" title={!Boolean(address)
              ? "Connect your wallet first."
              : "Register your account."}
              className={`${Boolean(account) && "none"}`}
            >
              <Button
                className="mt-3 max-w-[200px]"
                onClick={handleSubscribe}
                type='primary'
                loading={isSubscribing}
                disabled={!Boolean(address) || !Boolean(account)}
              >
                Allow to send events
              </Button>
            </Tooltip>
          </div>
        )}
      </div>
    </Layout >
  )
}
