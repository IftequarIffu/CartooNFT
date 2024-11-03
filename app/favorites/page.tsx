/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import * as React from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusCircle, LayoutDashboard, ShoppingBag, Search, X, Heart, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar'
import { ThemeToggle } from '@/components/theme-toggle'
import { useAccount } from 'wagmi';
import MintNftModal from '@/components/MintNftModal'
import NftCard from '@/components/NftCard'
import { useReadContract, useWriteContract, useSimulateContract } from 'wagmi'
import { BASIC_NFT_CONTRACT_ADDRESS, basicNftAbi, marketPlaceAbi, NFT_MARKETPLACE_CONTRACT_ADDRESS } from '@/lib/constants'
import { useQueryClient } from '@tanstack/react-query'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import DashboardPagesSidebarProvider from '@/components/DashboardPagesSidebarProvider'



export default function MyLikedNfts() {
  
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
    address: NFT_MARKETPLACE_CONTRACT_ADDRESS,
    functionName: 'getBasicNftContractAddress'
  }).data as `0x${string}`

  console.log("Basic Nft address: ", basicNftAddress)

  const {address} = useAccount()


  // const {data: myFavorites, queryKey: getMyLikedNftsQueryKey}  = useReadContract({
  //   abi: basicNftAbi,
  //   address: basicNftAddress,
  //   functionName: 'getMyLikedNfts',
  //   account: address
  // })

  const {data: myLikedNftsTokenIds, queryKey: getMyLikedNftsTokenIdsQueryKey} = useReadContract({
    abi: basicNftAbi,
    address: basicNftAddress,
    functionName: 'getMyLikedNftsTokenIds',
    // args: [BigInt(0)]
    account: address
  })

  console.log("My Favorites: ", myLikedNftsTokenIds)

  const itemsPerPage = 3
  let totalPages = 0;

  if(myLikedNftsTokenIds?.length !== undefined && myLikedNftsTokenIds?.length !=0 ){
    totalPages = Math.ceil(myLikedNftsTokenIds?.length / itemsPerPage)
  }

  const [currentPage, setCurrentPage] = React.useState(1)

  const currentNFTsTokenIds = myLikedNftsTokenIds?.slice(
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
              <form className="flex-1">
                {/* <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4" />
                  <Input
                    type="search"
                    placeholder="Search NFTs..."
                    className="w-full pl-8 md:w-2/3 lg:w-1/3"
                  />
                </div> */}
              </form>
            </div>
            <ConnectButton />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-y-auto w-full p-6">
            <h1 className="mb-8 text-2xl font-bold">My Favorites</h1>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              

              {myLikedNftsTokenIds?.map((tokenId) => (
                
                <NftCard nftsTokenId={tokenId}/>
              ))}
              
            </div>

            {/* Pagination */}
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
          </main>
        </SidebarInset>
    </DashboardPagesSidebarProvider>
  )
}