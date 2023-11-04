import { Roboto } from 'next/font/google'
import useIsHydrated from '@/hooks/useIsHydrated';
import { Button } from 'antd';
import React, { ReactNode, useMemo } from 'react'
import { useAccount, useNetwork } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';

const roboto = Roboto({
  weight: '400',
  subsets: ['latin'],
});

const Layout = ({ children }: { children: ReactNode; }) => {
  const { isDisconnected } = useAccount();
  const isHydrated = useIsHydrated();
  const { chain } = useNetwork();
  const chainId = chain?.id || "";
  const { open } = useWeb3Modal();
  const isChainSupported = useMemo(() => [5].find(chain => chain === chainId), [chainId])

  return (
    <main className={`bg-gray-100 flex min-h-screen flex-col items-center pb-20 ${roboto.className}`}>
      <div className="w-full bg-white shadow-sm p-4 flex justify-between">
        <p className='uppercase text-4xl m-0 p-0 h-fit'>Gazton</p>
        <div className='flex gap-3'>
          <Button type="primary" onClick={() => open()}>{isHydrated && isDisconnected ? "Connect Wallet" : "Open Wallet Modal"}</Button>
        </div>
      </div>

      <div className='pt-10'>
        {(isHydrated && !isChainSupported) ? (
          <div className='w-[600px] bg-white shadow p-8 rounded-xl mt-10'>
            <h2 className='text-3xl text-center mb-6'>Please make sure you are on the supported chain to use this feature</h2>
          </div>)
          : children
        }
      </div>
    </main >
  )
}

export default Layout