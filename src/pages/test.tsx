"use client";
import type { NextPage } from "next";
import { useCallback, useEffect, useState } from "react";
import { Image, Button, Tooltip } from 'antd';
import {
  useInitWeb3InboxClient,
  useManageSubscription,
  useW3iAccount,
} from "@web3inbox/widget-react";
import "@web3inbox/widget-react/dist/compiled.css";

import { useAccount, usePublicClient, useSignMessage } from "wagmi";
import { FaBell, FaBellSlash, FaPause, FaPlay } from "react-icons/fa";
import { BsSendFill } from "react-icons/bs";
import useSendNotification from "../utils/useSendNotification";
import { useInterval } from "usehooks-ts";
import Preferences from "../components/Preferences";
// import Messages from "../components/";
// import Subscription from "../components/Subscription";
import { sendNotification } from "../utils/fetchNotify";
import toast from "react-hot-toast";
import useIsHydrated from "@/hooks/useIsHydrated";
import Subscription from "@/components/Subscription";
import Messages from "@/components/Messages";
// import Subscribers from "../components/Subscribers";

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID as string;
const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN as string;

const Home: NextPage = () => {
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

  const { address } = useAccount({
    onDisconnect: () => {
      setAccount("");
    },
  });
  const { signMessageAsync } = useSignMessage();
  const wagmiPublicClient = usePublicClient();

  const { handleSendNotification, isSending } = useSendNotification();
  const [lastBlock, setLastBlock] = useState<string>();
  const [isBlockNotificationEnabled, setIsBlockNotificationEnabled] =
    useState(true);

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
        type: "5472094a-3ac1-4483-a861-26aef4ca05ae",
      });
    }
  }, [handleSendNotification, isSubscribed]);

  // Example of how to send a notification based on some "automation".
  // sendNotification will make a fetch request to /api/notify
  const handleBlockNotification = useCallback(async () => {
    if (isSubscribed && account && isBlockNotificationEnabled) {
      const blockNumber = await wagmiPublicClient.getBlockNumber();
      if (lastBlock !== blockNumber.toString()) {
        setLastBlock(blockNumber.toString());
        try {
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
          toast.error("Failed to send new block notification");
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

  const isHydrated = useIsHydrated();

  if (!isHydrated) return <div>Not hydrated yer</div>
  return (
    <div className="flex flex-col w-full max-w-700px">
      <Image
        alt="WalletConnect"
      // src={colorMode === "dark" ? "/WalletConnect-white.svg" : "/WalletConnect-black.svg"}
      />
      <h2 className="self-center text-center mb-6">Web3Inbox hooks</h2>

      <div className="flex flex-col space-y-4">
        {isSubscribed ? (
          <div className="flex flex-col items-center space-y-4">
            <Button
              icon={<BsSendFill />}
              // type="outline"
              onClick={handleTestNotification}
              disabled={!isW3iInitialized}
              className="rounded-full text-purple-500 border-purple-500"
              loading={isSending}
            >
              Send test notification
            </Button>
            <Button
              icon={isBlockNotificationEnabled ? <FaPause /> : <FaPlay />}
              // type="outline"
              onClick={() => setIsBlockNotificationEnabled((isEnabled) => !isEnabled)}
              disabled={!isW3iInitialized}
              className={`rounded-full ${isBlockNotificationEnabled ? 'text-orange-500 border-orange-500' : 'text-blue-500 border-blue-500'}`}
            >
              {isBlockNotificationEnabled ? "Pause" : "Resume"} block notifications
            </Button>
            <Button
              icon={<FaBellSlash />}
              onClick={unsubscribe}
              // type="outline"
              disabled={!isW3iInitialized || !account}
              className="rounded-full text-red-500 border-red-500"
              loading={isUnsubscribing}
            >
              Unsubscribe
            </Button>
          </div>
        ) : (
          <Tooltip title={!Boolean(address) ? "Connect your wallet first." : "Register your account."} visible={!Boolean(account)}>
            <Button
              icon={<FaBell />}
              onClick={handleSubscribe}
              className="rounded-full text-cyan-500 border-cyan-500 w-auto self-center"
              loading={isSubscribing}
              disabled={!Boolean(address) || !Boolean(account)}
            >
              Subscribe
            </Button>
          </Tooltip>
        )}

        {isSubscribed && (
          <div className="flex flex-wrap w-full bg-slate-100 justify-center gap-8">
            {/* <Subscription /> */}
            <Messages />
            {/* <Preferences /> */}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
