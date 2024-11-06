/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import * as React from 'react'
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar'
import { ThemeToggle } from '@/components/theme-toggle'
import { useAccount } from 'wagmi';
import MintNftModal from '@/components/MintNftModal'
import NftCard from '@/components/NftCard'
import { useReadContract } from 'wagmi'
import { basicNftAbi, marketPlaceAbi } from '@/lib/constants'
import { QueryKey } from '@tanstack/react-query'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import DashboardPagesSidebarProvider from '@/components/DashboardPagesSidebarProvider'



export default function Dashboard() {
  
  
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

  console.log("Basic Nft address in Dashboard: ", basicNftAddress)

  const {address} = useAccount()

  console.log("Address in Dashboard: ", address)


  const {data: myNftsTokenIds, queryKey: getMyNftsQueryKey} = useReadContract({
    abi: basicNftAbi,
    address: basicNftAddress,
    functionName: 'getMyNftsTokenIds',
    account: address
  })

  console.log("My NFTs token Ids in Dashboard: ", myNftsTokenIds)

  const itemsPerPage = 3
  let totalPages = 0;

  if(myNftsTokenIds?.length !== undefined && myNftsTokenIds?.length !=0 ){
    totalPages = Math.ceil(myNftsTokenIds?.length / itemsPerPage)
  }

  const [currentPage, setCurrentPage] = React.useState(1)

  const currentNFTsTokenIds = myNftsTokenIds?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
    )

  const goToPage = (page: number) => {
      setCurrentPage(page)
  }
      
  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1))
  }
  
  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages))
  }


  return (
   
      <DashboardPagesSidebarProvider>

        <SidebarInset className="flex flex-col flex-grow w-full">
          <header className="flex h-16 items-center gap-4 border-border px-6 w-full">
            <SidebarTrigger />
            <div className="flex flex-1 items-center space-x-4">
            </div>
            <ConnectButton chainStatus="full" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-y-auto w-full p-6">
            <h1 className="mb-8 text-2xl font-bold">My NFTs</h1>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              
              <MintNftModal nftsTokenIds={myNftsTokenIds} queryKey={getMyNftsQueryKey as QueryKey} />

              {currentNFTsTokenIds?.map( (tokenId) => (
                
                <NftCard key={tokenId} nftsTokenId={tokenId}/>
              ))}
              
            </div>

            {/* Pagination */}
            {
              currentNFTsTokenIds && currentNFTsTokenIds.length>0 && (
                <div className="mt-16 flex justify-center items-center space-x-2">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                >
                    <ChevronLeft  className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="icon"
                    onClick={() => goToPage(page)}
                    >
                    {page}
                    </Button>
                ))}
                <Button
                    variant="outline"
                    size="icon"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
                </div>
              )
            }
           

          </main>
        </SidebarInset>
      
    </DashboardPagesSidebarProvider>
  )
}