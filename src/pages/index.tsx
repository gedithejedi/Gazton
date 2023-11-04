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
  useW3iAccount,
} from "@web3inbox/widget-react";
import "@web3inbox/widget-react/dist/compiled.css";

// import { FaBell, FaBellSlash, FaPause, FaPlay } from "react-icons/fa";
// import { BsSendFill } from "react-icons/bs";
import useSendNotification from "../utils/useSendNotification";
// import Preferences from "../components/Preferences";
// import Messages from "../components/Messages";
// import Subscription from "../components/Subscription";
import { sendNotification } from "../utils/fetchNotify";
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
// import Subscribers from "../components/Subscribers";

export default function Home() {
  const { address, isConnecting, isDisconnected } = useAccount({
    onDisconnect: () => {
      setAccount("");
    },
  });
  const { chain } = useNetwork();
  const chainId = chain?.id || "";
  const isHydrated = useIsHydrated();

  /** Web3Inbox SDK hooks **/
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

  const { signMessageAsync } = useSignMessage();
  const wagmiPublicClient = usePublicClient();

  const { handleSendNotification, isSending } = useSendNotification();
  const [lastBlock, setLastBlock] = useState<string>();
  const [isBlockNotificationEnabled, setIsBlockNotificationEnabled] = useState(true);

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
        icon: `${window.location.origin}/WalletConnect-blue.svg`,
        url: window.location.origin,
        // ID retrieved from explorer api - Copy your notification type from WalletConnect Cloud and replace the default value below
        type: "dc088fb8-276f-4abf-9eac-b9f0b9ae9ccd",
      });
    }
  }, [handleSendNotification, isSubscribed]);

  // Example of how to send a notification based on some "automation".
  // sendNotification will make a fetch request to /api/notify
  const handleBlockNotification = useCallback(async () => {
    console.log("hwreew");
    if (isSubscribed && account && isBlockNotificationEnabled) {
      console.log("here");
      const blockNumber = await wagmiPublicClient.getBlockNumber();
      if (lastBlock !== blockNumber.toString()) {
        console.log("in here");
        setLastBlock(blockNumber.toString());
        try {
          console.log("in hr again");
          toast.success("New block");
          await sendNotification({
            accounts: [account], // accounts that we want to send the notification to.
            notification: {
              title: "New block",
              body: blockNumber.toString(),
              icon: `${window.location.origin}/eth-glyph-colored.png`,
              url: `https://etherscan.io/block/${blockNumber.toString()}`,
              type: "transactional",
            },
          });
        } catch (error: any) {
          toast.error("Failed to send new block notification. " + error.message && error.message);
        }
      }
    }
  }, [
    wagmiPublicClient,
    isSubscribed,
    lastBlock,
    account,
    toast,
    isBlockNotificationEnabled,
  ]);

  useInterval(() => {
    handleBlockNotification();
  }, 12000);

  return (
    <Layout>
      <div className='pt-10'>
        {isHydrated && isConnecting && <h2>Connecting…</h2>}
        {isHydrated && isDisconnected && !address && (
          <div className='flex flex-col justify-center'>
            <h2>Please connect your wallet</h2>
            <Button type="primary" onClick={() => open()}>Open Connect Modal</Button>
          </div>
        )}

        {isSubscribed ? (
          <div className='flex flex-col gap-4 align-center'>
            <Button
              type="primary"
              onClick={handleTestNotification}
              disabled={!isW3iInitialized}
            // colorScheme="purple"
            // rounded="full"
            // isLoading={isSending}
            // loadingText="Sending..."
            >
              Send test notification
            </Button>
            <Button
              // leftIcon={isBlockNotificationEnabled ? <FaPause /> : <FaPlay />}
              type="primary"
              onClick={() =>
                setIsBlockNotificationEnabled((isEnabled) => !isEnabled)
              }
              disabled={!isW3iInitialized}
            // colorScheme={isBlockNotificationEnabled ? "orange" : "blue"}
            // rounded="full"
            >
              {isBlockNotificationEnabled ? "Pause" : "Resume"} block
              notifications
            </Button>
            <Button
              // leftIcon={<FaBellSlash />}
              onClick={unsubscribe}
              type="primary"
              disabled={!isW3iInitialized || !account}
            // colorScheme="red"
            // isLoading={isUnsubscribing}
            // loadingText="Unsubscribing..."
            // rounded="full"
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
              // leftIcon={<FaBell />}
              onClick={handleSubscribe}
              type='primary'
            // colorScheme="cyan"
            // rounded="full"
            // variant="outline"
            // w="fit-content"
            // alignSelf="center"
            // isLoading={isSubscribing}
            // loadingText="Subscribing..."
            // isDisabled={!Boolean(address) || !Boolean(account)}
            >
              Subscribe
            </Button>
          </Tooltip>
        )}

        {/* {isSubscribed && (
          <Accordion defaultIndex={[1]} allowToggle mt={10} rounded="xl">
            <Subscription />
            <Messages />
            <Preferences />
            <Subscribers />
          </Accordion>
        )} */}

        {isHydrated && address && <EventsDashboard />}
      </div>
    </Layout>
  )
}
