/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import * as React from 'react'
import {
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar'
import { ThemeToggle } from '@/components/theme-toggle'
import { useAccount } from 'wagmi';
import NftCard from '@/components/NftCard'
import { useReadContract } from 'wagmi'
import { basicNftAbi, marketPlaceAbi } from '@/lib/constants'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import DashboardPagesSidebarProvider from '@/components/DashboardPagesSidebarProvider'



export default function Favorites() {
  
  interface NFT {
    id: number
    name: string
    price: string
    image: string
  }

  const [selectedNFT, setSelectedNFT] = React.useState<NFT | null>(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)

  const openModal = (nft: NFT) => {
    setSelectedNFT(nft)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setSelectedNFT(null)
    setIsModalOpen(false)
  }

  const basicNftAddress: `0x${string}` = useReadContract({
    abi: marketPlaceAbi,
    address: process.env.NEXT_PUBLIC_NFT_MARKETPLACE_CONTRACT_ADDRESS as `0x${string}`,
    functionName: 'getBasicNftContractAddress'
  }).data as `0x${string}`

  console.log("Basic Nft address: ", basicNftAddress)

  const {address} = useAccount()


  const {data: myPurchasedNftsTokenIds, queryKey: getMyPurchasedNftsQueryKey} = useReadContract({
    abi: basicNftAbi,
    address: basicNftAddress,
    functionName: 'getMyPurchasedNftsTokenIds',
    account: address
  })

  console.log("My Purchases TokenIDs: ", myPurchasedNftsTokenIds)

  return (
    <DashboardPagesSidebarProvider>
        <SidebarInset className="flex flex-col flex-grow w-full">
          <header className="flex h-16 items-center gap-4 border-border px-6 w-full">
            <SidebarTrigger />
            <div className="flex flex-1 items-center space-x-4">
            </div>
            <ConnectButton />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-y-auto w-full p-6">
          <h1 className="mb-8 text-2xl font-bold">My Purchases</h1>
            {
                myPurchasedNftsTokenIds == undefined || myPurchasedNftsTokenIds?.length == 0 ? (<div className='flex justify-center items-center mt-36 text-3xl'>No Purchases yet!!!</div> ) :
                (
                    <>
                    
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    
                    {myPurchasedNftsTokenIds?.map( (tokenId) => (
                        
                        <NftCard nftsTokenId={tokenId}/>
                    ))}

                    </div>
                    </>
                    
                    
                )
            }
           
          </main>
        </SidebarInset>
    </DashboardPagesSidebarProvider>
  )
}