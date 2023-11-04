import { useWeb3Modal } from '@web3modal/wagmi/react'
import { Button, Tooltip } from "antd";
import { useAccount, useNetwork, usePublicClient, useSignMessage } from 'wagmi';
import useIsHydrated from '@/hooks/useIsHydrated';
import EventsDashboard from '@/components/EventsDashboard';
import { useInterval } from "usehooks-ts";
import Layout from '@/components/Layout';

import {
  useInitWeb3InboxClient,
  useManageSubscription,
  useSubscription,
  useW3iAccount,
} from "@web3inbox/widget-react";
import "@web3inbox/widget-react/dist/compiled.css";

// import { FaBell, FaBellSlash, FaPause, FaPlay } from "react-icons/fa";
// import { BsSendFill } from "react-icons/bs";
import useSendNotification from "../utils/useSendNotification";
// import Preferences from "../components/Preferences";
// import Messages from "../components/Messages";
// import Subscription from "../components/Subscription";
import { getAllSubscribers, sendNotification } from "../utils/fetchNotify";
import { useCallback, useEffect, useState } from 'react';
import Preferences from '@/components/Preferences';
import toast from 'react-hot-toast';
// import Subscribers from "../components/Subscribers";

export default function Home() {
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

  console.log("isSubscribed: ", isSubscribed);

  const { signMessageAsync } = useSignMessage();
  const wagmiPublicClient = usePublicClient();
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
      const res = await registerIdentity(signMessage);
      console.log("Register identity: ", res);
    } catch (registerIdentityError) {
      console.error({ registerIdentityError });
    }
  }, [signMessage, registerIdentity, account]);

  useEffect(() => {
    // register even if an identity key exists, to account for stale keys
    handleRegistration();
  }, [handleRegistration]);

  const handleSubscribe = useCallback(async () => {
    console.log(identityKey);
    if (!identityKey) {
      await handleRegistration();
    }
    const res = await subscribe();
  }, [subscribe, identityKey])

  // handleSendNotification will send a notification to the current user and includes error handling.
  // If you don't want to use this hook and want more flexibility, you can use sendNotification.
  const handleTestNotification = useCallback(async () => {
    if (isSubscribed) {
      handleSendNotification({
        title: "GM Hacker",
        body: "Hack it until you make it!",
        // url: appDomain,
        type: "6b384ff5-bf8d-4cd8-9cdb-69c7569031af",
      });
    }
  }, [handleSendNotification, isSubscribed]);

  return (
    <Layout>
      <div className='pt-10 gap-8 flex flex-col'>
        {isHydrated && isConnecting && <h2>Connecting…</h2>}
        {isHydrated && isDisconnected && !address && (
          <div className='flex flex-col justify-center'>
            <h2>Please connect your wallet</h2>
            <Button type="primary" onClick={() => open()}>Open Connect Modal</Button>
          </div>
        )}

        {isHydrated && address && <EventsDashboard />}

        {isSubscribed ? (
          <div className='flex flex-col gap-4 align-center'>
            <Button
              type="primary"
              onClick={handleTestNotification}
              disabled={!isW3iInitialized}
              loading={isSending}
            >
              Send test notification
            </Button>
            <Button
              onClick={unsubscribe}
              type="primary"
              disabled={!isW3iInitialized || !account}
              loading={isUnsubscribing}
            >
              Unsubscribe
            </Button>
          </div>
        ) : (
          <Tooltip placement="top" title={!Boolean(address)
            ? "Connect your wallet first."
            : "Register your account."}
            className={`${Boolean(account) && "none"}`}
          >
            <Button
              onClick={handleSubscribe}
              type='primary'
              loading={isSubscribing}
              disabled={!Boolean(address) || !Boolean(account)}
            >
              Subscribe
            </Button>
          </Tooltip>
        )}

        {isSubscribed && (
          // <Subscription />
          // <Messages />
          <Preferences />
          // <Subscribers />
        )}
      </div>
    </Layout >
  )
}
