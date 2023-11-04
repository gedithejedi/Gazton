import { useWeb3Modal } from '@web3modal/wagmi/react'
import { Button } from "antd";
import { useAccount, useNetwork } from 'wagmi';
import useIsHydrated from '@/hooks/useIsHydrated';
import EventsDashboard from '@/components/EventsDashboard';
import { useMemo } from 'react';
import Layout from '@/components/Layout';

export default function Home() {
  const { address, isConnecting, isDisconnected } = useAccount();
  const { chain } = useNetwork();
  const chainId = chain?.id || "";
  const isHydrated = useIsHydrated();

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

        {isHydrated && address && <EventsDashboard />}
      </div>
    </Layout>
  )
}
