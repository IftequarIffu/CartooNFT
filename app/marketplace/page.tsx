/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import * as React from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'
import { useAccount, useReadContract } from 'wagmi'
import { basicNftAbi, marketPlaceAbi } from '@/lib/constants'
import NftCard from '@/components/NftCard'
import { categories } from '@/lib/constants'
import { config } from '@/lib/wagmiConfig'
import { readContract } from '@wagmi/core'
import { ConnectButton } from '@rainbow-me/rainbowkit'


export default function Marketplace() {

    // const {address} = useAccount()

    let listingPrice = Number(useReadContract({
        abi: marketPlaceAbi,
        address: process.env.NEXT_PUBLIC_NFT_MARKETPLACE_CONTRACT_ADDRESS as `0x${string}`,
        functionName: 'getListingPrice',
        // account: address
      }).data)

    listingPrice = listingPrice/(10**18)
    
    console.log("Listing Price: ", listingPrice)

    const basicNftAddress: `0x${string}` = useReadContract({
        abi: marketPlaceAbi,
        address: process.env.NEXT_PUBLIC_NFT_MARKETPLACE_CONTRACT_ADDRESS as `0x${string}`,
        functionName: 'getBasicNftContractAddress'
      }).data as `0x${string}`

  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([])
  const [priceRange, setPriceRange] = React.useState<[number, number]>([0, 1])
  const [searchQuery, setSearchQuery] = React.useState<string>('')
  const [sortOption, setSortOption] = React.useState('recent')
  const [notSoldNfts, setNotSoldNfts] = React.useState(false)

  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 12


  type NftType = {
    tokenId: bigint;
    name: string;
    isListed: boolean;
    isSold: boolean;
    price: bigint;
    tokenUri: string;
    owner: `0x${string}`;
    category: string;
    mintDate: string;
    numberOfLikes: bigint;
}

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const handlePriceRangeChange = (newValues: number[]) => {
    setPriceRange([newValues[0], newValues[1]])
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
  }

  const handleSortChange = (value: string) => {
    setSortOption(value)
  }

  const handleNotSoldChange = (checked: boolean) => {
    setNotSoldNfts(checked)
    setCurrentPage(1)
  }



  const {data: listedNftsTokenIds, isLoading: isListedNftsLoading, queryKey: getListedNftsTokenIdsQueryKey} = useReadContract({
    abi: basicNftAbi,
    address: basicNftAddress,
    functionName: 'getListedNftsTokenIds',
    // account: address
  })

  const fetchNft = async(tokenId: number) => {
    const result = await readContract(config, {
      abi: basicNftAbi,
      address: basicNftAddress,
      functionName: 'getNftFromTokenId',
      args: [BigInt(tokenId)]
    })

    return result
  }


  const [listedNfts, setListedNfts] = React.useState<NftType[] | undefined>();

  React.useEffect(() => {
    if (!listedNftsTokenIds) return;

    const fetchNfts = async () => {
      const nftData = await Promise.all(
          listedNftsTokenIds.map(async (tokenId) => {
              const nft = await fetchNft(Number(tokenId));
              console.log("Nft in Fetch NFTs: ", fetchNfts)
              return nft;
          })
      );
      setListedNfts(nftData.filter(Boolean) as NftType[]); // Filter out any undefined results
  };

    fetchNfts();
}, [listedNftsTokenIds, basicNftAddress]);


const filteredNFTTokenIds = React.useMemo(() => {
  const result = listedNfts
      ?.filter(nft => {
          const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(nft.category);
          const priceMatch = Number(nft.price) / (10 ** 18) >= priceRange[0] && Number(nft.price) / (10 ** 18) <= priceRange[1];
          const searchMatch = nft.name.toLowerCase().includes(searchQuery.toLowerCase());
          const notSoldMatch = !notSoldNfts || !nft.isSold;
          
          return categoryMatch && priceMatch && searchMatch && notSoldMatch;
      })
      .map(nft => nft.tokenId); // Extract only the tokenId of each matching NFT

  switch (sortOption) {
      case 'recent':
          return result?.sort((a, b) => {
              const nftA = listedNfts?.find(nft => nft.tokenId === a);
              const nftB = listedNfts?.find(nft => nft.tokenId === b);
              return new Date(nftB?.mintDate as unknown as Date).getTime() - new Date(nftA?.mintDate as unknown as Date).getTime();
          });
      case 'price-low':
          return result?.sort((a, b) => {
              const nftA = listedNfts?.find(nft => nft.tokenId === a);
              const nftB = listedNfts?.find(nft => nft.tokenId === b);
              return Number(nftA?.price) - Number(nftB?.price);
          });
      case 'price-high':
          return result?.sort((a, b) => {
              const nftA = listedNfts?.find(nft => nft.tokenId === a);
              const nftB = listedNfts?.find(nft => nft.tokenId === b);
              return Number(nftB?.price) - Number(nftA?.price);
          });
      case 'likes':
          return result?.sort((a, b) => {
              const nftA = listedNfts?.find(nft => nft.tokenId === a);
              const nftB = listedNfts?.find(nft => nft.tokenId === b);
              return Number(nftB?.numberOfLikes) - Number(nftA?.numberOfLikes);
          });
      default:
          return result;
  }
}, [listedNfts, selectedCategories, priceRange, searchQuery, sortOption, notSoldNfts]);



  let totalPages = 0;

  if(filteredNFTTokenIds?.length !== undefined && filteredNFTTokenIds?.length !=0 ){
    totalPages = Math.ceil(filteredNFTTokenIds?.length / itemsPerPage)
  }


  const currentNFTsTokenIds = filteredNFTTokenIds?.slice(
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



  console.log("Listed NFTs: ", listedNfts)

  console.log("Price Range: ", priceRange[0], priceRange[1])

  return (
    <div className="flex min-h-screen ">
      {/* Sidebar */}
      <aside className="w-64  p-6 hidden lg:block sticky h-screen top-0">
        <Link href={"/"}>
            <h1 className="text-3xl font-bold mb-4 sm:mb-0">CartooNFT</h1>
        </Link>
        <h2 className="text-lg font-semibold mb-4 mt-20">Filters</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Price Range</label>
            <Slider
                value={priceRange}
                min={0}
                max={1}
                step={0.1}
                className="mt-2"
                onValueChange={handlePriceRangeChange}
            />
            <div className="flex justify-between mt-1">
                <span className="text-sm">{priceRange[0]} ETH</span>
                <span className="text-sm">{priceRange[1]} ETH</span>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Categories</label>
            <div className="mt-2 space-y-2">
              {categories.map((category) => (
                <div key={category} className="flex items-center">
                  <Checkbox 
                    id={category}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={() => handleCategoryChange(category)}
                  />
                  <label htmlFor={category} className="ml-2 text-sm">{category}</label>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium flex items-center justify-between">
              Not Sold
              <Switch checked={notSoldNfts}
                onCheckedChange={handleNotSoldChange} />
            </label>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="flex flex-col p-6 sm:flex-row justify-between items-center mb-8 sticky bg-background top-0 z-50 ">
            <Link href={"/dashboard"}>
                <Button className='bg-white dark:bg-black text-black hover:text-white dark:text-white dark:hover:bg-primary dark:hover:text-black'>
                  <ChevronLeft />
                  Back to Dashboard
                  
                </Button>
            </Link>
            
            <div className="flex items-center space-x-4">
            <ConnectButton accountStatus="full" chainStatus="none" showBalance={false} />
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search NFTs..."
                  className="pl-10 w-full sm:w-64"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
              <Select onValueChange={handleSortChange} value={sortOption}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="likes">Most Liked</SelectItem>
                </SelectContent>
              </Select>
              <ThemeToggle />
            </div>
          </header>

          {/* NFT Grid */}
          <h1 className="text-2xl font-bold mb-4 px-6">Marketplace</h1>

          {
            !currentNFTsTokenIds || currentNFTsTokenIds.length <= 0 ? (<div className='flex justify-center items-center mt-36 text-3xl'>Aww Snap!! No NFTs found</div>) : 

            (
    
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          
          {currentNFTsTokenIds?.map((tokenId: any) => (
            <NftCard key={tokenId} nftsTokenId={tokenId}/>
          ))}
            </div>

            <div className="mt-8 flex justify-center items-center space-x-2 p-6">
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
        </>
            )
          }

          
        </div>
      </main>
    </div>
  )
}