/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from './ui/card'
import Image from 'next/image'
import axios from 'axios'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog'
import { DialogHeader } from './ui/dialog'
import { useWriteContract, useReadContract, useAccount, useTransactionReceipt } from 'wagmi'
import { basicNftAbi, marketPlaceAbi } from '@/lib/constants'
import { parseEther } from 'viem'
import { CheckCircle2, Heart } from 'lucide-react';
import { Badge } from './ui/badge'
import { timeAgo } from '@/lib/utils'
// import { useToast } from "@/hooks/use-toast"
import { queryClient } from '@/app/providers'
import { Spinner } from './LoadingSpinner'
import { toast } from 'sonner'



const NftCard = ({nftsTokenId} : {nftsTokenId: any}) => {

  const {address} = useAccount()

  const { data: listNftTxHash,  writeContract: listNftWriteContract } = useWriteContract()
  const { data: likeOrUnlikeNftTxHash, error: likeOrUnlikeAnNftErrored,  writeContract: likeOrUnlikeNftWriteContract } = useWriteContract()
  const { data: buyNftTxHash, writeContract: buyNftWriteContract } = useWriteContract()
  // const {toast} = useToast()


  const { isSuccess: isListNftTxSuccess, isError: isListNftErrored } = useTransactionReceipt({
    hash: listNftTxHash
  })

  const { isSuccess: isLikeOrUnlikeNftTxSuccess, isError: isLikeOrUnlikeNftErrored } = useTransactionReceipt({
    hash: likeOrUnlikeNftTxHash
  })

  const { isSuccess: isBuyNftTxSuccess, isError: isBuyNftErrored } = useTransactionReceipt({
    hash: buyNftTxHash
  })

  console.log("Like Or Unlike Errored: ", likeOrUnlikeAnNftErrored)

  

  interface NFT {
    tokenId: number
    price: string
    tokenUri: string
    isListed: boolean
    isSold: boolean
    owner: string
  }

  const basicNftAddress: `0x${string}` = useReadContract({
    abi: marketPlaceAbi,
    address: process.env.NEXT_PUBLIC_NFT_MARKETPLACE_CONTRACT_ADDRESS as `0x${string}`,
    functionName: 'getBasicNftContractAddress'
  }).data as `0x${string}`

  console.log("Basic Nft Address in Nft Card: ", basicNftAddress)


  const {data: nft, queryKey: getNftFromTokenIdQueryKey} = useReadContract({
    abi: basicNftAbi,
    address: basicNftAddress,
    functionName: 'getNftFromTokenId',
    args: [nftsTokenId],
    account: address
  })

  console.log("Nft in NftCard: ", nft)

  const [selectedNFT, setSelectedNFT] = React.useState<NFT | null>(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)


  const openModal = (nft: NFT) => {
    setSelectedNFT(nft)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setSelectedNFT(null)
    setSelectedNFT(null)
  }

  let listingPrice = Number(useReadContract({
    abi: marketPlaceAbi,
    address: process.env.NEXT_PUBLIC_NFT_MARKETPLACE_CONTRACT_ADDRESS as `0x${string}`,
    functionName: 'getListingPrice',
    // args: [BigInt(0)]
    account: address
  }).data)

  listingPrice = Number(listingPrice/(10**18))


  const listNft = async(tokenId: number) => {
    console.log("Listing NFT...")
    console.log("Basic NFT contract address: ", basicNftAddress)
    try {
      listNftWriteContract({
        abi: marketPlaceAbi,
        functionName: 'listNft',
        args: [BigInt(tokenId)],
        address: process.env.NEXT_PUBLIC_NFT_MARKETPLACE_CONTRACT_ADDRESS as `0x${string}`,
        account: address,
        value: parseEther(`${listingPrice}`)
      })
      // writeContract(data?.request)
      console.log("Listing NFT complete...")
    } catch (error: any) {
      console.log("Error while listing: ", error.message)
    }
  }

  const buyNft = async(tokenId: number, valueInEth: number) => {
    console.log("Buying NFT...")
    console.log("Basic NFT contract address: ", basicNftAddress)
    try {
      buyNftWriteContract({
        abi: basicNftAbi,
        functionName: 'buyNft',
        args: [BigInt(tokenId)],
        address: basicNftAddress,
        account: address,
        value: parseEther(`${valueInEth}`)
      })
      // writeContract(data?.request)
      console.log("Buying NFT complete...")
    } catch (error: any) {
      console.log("Error while buying: ", error.message)
    }
  }


  const likeOrUnlikeNft = async(tokenId: number) => {
    console.log("Liking NFT...")
    console.log("Basic NFT contract address: ", basicNftAddress)
    try {
      likeOrUnlikeNftWriteContract({
        abi: basicNftAbi,
        functionName: 'likeOrUnlikeAnNft',
        args: [BigInt(tokenId)],
        address: basicNftAddress,
        account: address,
        //value: parseEther('1')
      })
      // setIsNftLiked((prev) => !prev)
      // queryClient.invalidateQueries({queryKey: getMyLikedNftsQueryKey});
      // queryClient.invalidateQueries({queryKey: getMyNftsQueryKey});
      // writeContract(data?.request)
      console.log("Liking NFT complete...")
    } catch (error: any) {
      console.log("Error while Liking: ", error.message)
    }
  }

  const {data: myNftsTokenIds, queryKey: getMyNftsTokenIdsQueryKey} = useReadContract({
    abi: basicNftAbi,
    address: basicNftAddress,
    functionName: 'getMyNftsTokenIds',
    account: address
  })


  const {data: listedNftsTokenIds, queryKey: getListedNftsTokenIdsQueryKey} = useReadContract({
    abi: basicNftAbi,
    address: basicNftAddress,
    functionName: 'getListedNftsTokenIds',
    // args: [BigInt(0)]
    account: address
  })





  const {data: myLikedNftsTokenIds, queryKey: getMyLikedNftsTokenIdsQueryKey} = useReadContract({
    abi: basicNftAbi,
    address: basicNftAddress,
    functionName: 'getMyLikedNftsTokenIds',
    // args: [BigInt(0)]
    account: address
  })

  // let isNftLiked = false;

  const [isNftLiked, setIsNftLiked] = useState<boolean | undefined>(false)

  useEffect(() => {

    if(isLikeOrUnlikeNftTxSuccess || isLikeOrUnlikeNftErrored) {
      // setIsModalOpen(false)
      // toast({
      //   title: "Like or Unlike successful",
      //   // description: "Friday, February 10, 2023 at 5:57 PM",
      // })
      // queryClient.invalidateQueries({ queryKey: getMyLikedNftsQueryKey })
      // isNftLiked = !isNftLiked
      // setIsNftLiked((prev) => !prev)
      queryClient.invalidateQueries({ queryKey: getMyNftsTokenIdsQueryKey })
      queryClient.invalidateQueries({ queryKey: getMyLikedNftsTokenIdsQueryKey })
      queryClient.invalidateQueries({ queryKey: getNftFromTokenIdQueryKey })
      setIsNftLiked(false)
    }


  }, [isLikeOrUnlikeNftTxSuccess, isLikeOrUnlikeNftErrored,  getMyLikedNftsTokenIdsQueryKey, getMyNftsTokenIdsQueryKey, getNftFromTokenIdQueryKey])


  useEffect(() => {
    if(isListNftTxSuccess || isListNftErrored) {
      setIsListingLoading(false)
      // setIsModalOpen(false)
      queryClient.invalidateQueries({ queryKey: getMyNftsTokenIdsQueryKey })
      queryClient.invalidateQueries({ queryKey: getNftFromTokenIdQueryKey })
    }
  }, [isListNftTxSuccess, isListNftErrored, getMyNftsTokenIdsQueryKey, getNftFromTokenIdQueryKey ])

  useEffect(() => {
    if(isBuyNftTxSuccess || isBuyNftErrored) {
      setIsBuyingLoading(false)
      // setIsModalOpen(false)
      //queryClient.invalidateQueries({ queryKey: getMyNftsTokenIdsQueryKey })
      //queryClient.invalidateQueries({ queryKey: getNftFromTokenIdQueryKey })
    }
  }, [isBuyNftTxSuccess, isBuyNftErrored, getMyNftsTokenIdsQueryKey, getNftFromTokenIdQueryKey ])

  // Use it later
  useEffect(() => {
    if(myLikedNftsTokenIds){
      for (const tokenId of myLikedNftsTokenIds) {
        if(tokenId == nftsTokenId){
          setIsNftLiked(true)
          // isNftLiked = true;
          break;
        }
      }
    }
  }, [myLikedNftsTokenIds, nftsTokenId, isNftLiked, myNftsTokenIds])
  

  // React.useEffect(() => {
  //   if (isListNftTxHashSuccess || isLikeOrUnlikeNftTxHashSuccess || isBuyNftTxHashSuccess || isListNftErrored || isLikeOrUnlikeNftErrored || isBuyNftErrored) {
  //     setOpen(false)
  //     queryClient.invalidateQueries({ queryKey })
  //   }
  // }, [isListNftTxHashSuccess, isLikeOrUnlikeNftTxHashSuccess, isBuyNftTxHashSuccess, isListNftErrored, isLikeOrUnlikeNftErrored, isBuyNftErrored])
  
  

  // console.log("Errrrrror: ", error)

  const [nftTokenUri, setNftTokenUri] = useState<string | undefined>()

    useEffect(() => {

      if(nft?.tokenUri) {
        setNftTokenUri(nft?.tokenUri)
      }

    }, [nft])

    

    // if(nft) {
    //   setNftTokenUri()
    // }

    // const nftTokenUri = nft?.tokenUri;

    // const [nftName, setNftName] = useState("")
    const [nftImageUrl, setNftImageUrl] = useState("")
    // const [nftMintDate, setNftMintDate] = useState("")

    const getNftDetailsFromTokenUri = async(tokenUri: string) => {
      const jsonData = await axios.get(tokenUri)
      return {
        // name: jsonData.data.name,
        imageUrl: jsonData.data.image,
        // mintDate: jsonData.data.mintDate
      }
    }
    

    useEffect(() => {

      if(nftTokenUri) {

        const getDataFromIPFS = async() => {
          const data = await getNftDetailsFromTokenUri(nftTokenUri as string)
          // setNftName(data.name)
          setNftImageUrl(data.imageUrl)
          // setNftMintDate(data.mintDate)
        }
        
        getDataFromIPFS()

      }
      
      

    }, [nft, nftTokenUri])

    console.log("Image Url: ", nftImageUrl)
    console.log("Nft: ", nft)

    

    // if(isListNftTxSuccess) {
    //   setIsModalOpen(false)
    //   toast({
    //     title: "Listing successful",
    //     // description: "Friday, February 10, 2023 at 5:57 PM",
    //   })
    //   queryClient.invalidateQueries({ queryKey: getListedNftsQueryKey })
    // }

    
    console.log("Number of Likes: ", nft?.numberOfLikes)
  
    

    // if(isBuyNftTxSuccess) {
    //   setIsModalOpen(false)
    //   toast({
    //     title: "Purchase successful",
    //     // description: "Friday, February 10, 2023 at 5:57 PM",
    //   })
    //   queryClient.invalidateQueries({ queryKey: getMyNftsQueryKey })
    // }

    const [isListingLoading, setIsListingLoading] = useState(false)
    const [isBuyingLoading, setIsBuyingLoading] = useState(false)

    if(nft?.owner == "0x0000000000000000000000000000000000000000") {
      return null
    }


  

  return (
    <>
    <Card key={Number(nft?.tokenId)} className="overflow-hidden border-none hover:bg-secondary p-2">
        <CardHeader className="p-0">
        <div className="group relative w-64 h-64 overflow-hidden">
          {/* <h1>Minted {timeAgo(new Date(nft.mintDate))}</h1> */}
          {!nft?.isSold && (
            <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
              
              <CheckCircle2 className="h-4 w-4" />
            </div>
          )}
          {
            // !nftImageUrl || nftImageUrl == "" ? (<div className='mt-12 flex justify-center'><Spinner /></div>) : 
            (
              <Image
                  src={nftImageUrl}
                  alt={nft?.name as string}
                  width={50}
                  height={50}
                  unoptimized
                  priority
                  className="h-48 w-full object-contain transition-transform duration-300 ease-in-out transform group-hover:scale-110"
              />
            )
          }
        
        </div>
        </CardHeader>
        <CardContent className="px-4 py-2 flex justify-between">
          <div className='flex-col space-y-1 w-full'>
            <CardTitle className='flex justify-between w-full'>
              <div>{nft?.name}</div>
              <Badge>{nft?.category}</Badge>
            </CardTitle>
            <p className="text-sm text-gray-500">{Number(nft?.price)/(10**18)} ETH</p>
          </div>
          
        </CardContent>
        
        <CardFooter className="p-4">
        <div className='flex space-x-4 items-center w-full text-xl'>
          <Button className="w-full" 
            onClick={() => openModal(nft as any)}
          >View Details</Button>

            {
              isNftLiked ? 
              (<Heart fill='red' className='hover:cursor-pointer' color='red' strokeWidth={0} size={36} onClick={() => {
                if(address){
                  likeOrUnlikeNft(nft?.tokenId as unknown as number)
                } 
                
                else{
                  toast.error("Wallet is not connected!")
                }
              }
              }/>) : 
              (<Heart size={36} className='hover:cursor-pointer'  color='red' onClick={() => 
              {
                if(address){
                  likeOrUnlikeNft(nft?.tokenId as unknown as number)
                } 
                
                else{
                  toast.error("Wallet is not connected!")
                }
              }

              } />)
            }
            {Number(nft?.numberOfLikes)}
            
            
        </div>
        
        </CardFooter>
    </Card>
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{nft?.name}</DialogTitle>
        <DialogDescription>NFT Details</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="relative aspect-square overflow-hidden rounded-lg">
          {selectedNFT && (
            <Image
              src={nftImageUrl}
              alt={nft?.name as string}
              unoptimized
              layout="fill"
              objectFit="contain"
            />
          )}
        </div>
        <div className="flex justify-between items-center">
          <span className="font-bold">Price:</span>
          <span>{Number(Number(nft?.price)/(10**18))} ETH</span>
        </div>
        <div className='flex flex-col space-y-1'>
        {
          nft?.isListed == true ? (<Button disabled>Listed</Button>) : (
        
        <Button onClick={async() => {
          console.log(`Listing NFT: ${nft?.name}`)
          try {
            setIsListingLoading(true)
            await listNft(Number(nft?.tokenId))
            // setIsListingLoading(false)
            
          } catch (error: any) {
            console.log("Errorrrrrrrrrrr: ", error.message)
          }

        }} 
        disabled={isListingLoading}
        >
          {isListingLoading ? <div>Listing NFT...</div> : <div>List</div>}
        </Button>
        
        )
      }
      {
        nft?.isListed == true && nft.isSold == false && nft.owner != address && (
          <Button onClick={async() => {
            if(address) {
              console.log(`Buying NFT: ${nft.name}`)
              try {
                setIsBuyingLoading(true)
                await buyNft(Number(nft.tokenId), Number(nft.price)/(10**18))
              } catch (error: any) {
                console.log("Errorrrrrrrrrrr: ", error.message)
              }
            }
            else{
              toast.error("Wallet is not connected!")
            }
            
  
          }} 
          disabled={isBuyingLoading}
          >
            {isBuyingLoading ? <div>Buying NFT...</div> : <div>Buy NFT</div>}
        </Button>
        )
      }
      </div>
      </div>
    </DialogContent>
  </Dialog>
  </>

  )
}

export default NftCard