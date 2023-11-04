import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { WagmiConfig } from 'wagmi';
import { goerli, mainnet, polygon } from 'wagmi/chains'
import { Alchemy, Network } from "alchemy-sdk";
import { Toaster } from "react-hot-toast";
import { SessionProvider } from "next-auth/react";
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react';

const settings = {
  apiKey: process.env.ALCHEMY,
  network: Network.ETH_GOERLI,
};
export const alchemy = new Alchemy(settings);


const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "";

const metadata = {
  name: 'Web3Modal',
  description: 'Web3Modal Example',
  url: 'https://web3modal.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const chains = [mainnet, polygon, goerli]
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata })

// 3. Create modal
createWeb3Modal({ wagmiConfig, projectId, chains });

export default function App({ Component, pageProps: { session, ...pageProps }, }: AppProps) {
  return (
    <>
      <SessionProvider session={session}>
        <WagmiConfig config={wagmiConfig}>
          <Component {...pageProps} />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                maxWidth: 425
              }
            }}
          />
        </WagmiConfig>
      </SessionProvider>

    </>
  )
}
