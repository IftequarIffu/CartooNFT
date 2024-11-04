/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import * as React from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PlusCircle, Upload } from "lucide-react"
import { Card, CardContent } from './ui/card'
import Image from 'next/image'
import { pinata } from '@/lib/pinataConfig'
import { useReadContract, useWriteContract, useAccount } from 'wagmi'
import { basicNftAbi, IPFS_BASE_URL, marketPlaceAbi } from '@/lib/constants'
import { uploadNftToIpfs } from '@/actions/pinataActions'
import { categories } from '@/lib/constants'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { useTransactionReceipt } from 'wagmi'
import { QueryKey } from '@tanstack/react-query'
import { queryClient } from '@/app/providers'
import { Spinner } from './LoadingSpinner'
import { toast } from 'sonner'


export default function MintNftModal({nftsTokenIds, queryKey}: {nftsTokenIds: any, queryKey: QueryKey}) {
  const [name, setName] = React.useState('')
  const [price, setPrice] = React.useState('')
  const [image, setImage] = React.useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
  const [open, setOpen] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)
  const [uploadedImageUrl, setUploadedImageUrl] = React.useState('')
  const { data: mintNftHash, writeContract, isSuccess, error } = useWriteContract()
  const [nftUrl, setNftUrl] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [category, setCategory] = React.useState("")
  const [isMintingProgressOpen, setIsMintingProgressOpen] = React.useState(false)
  const { isSuccess: isTxSuccess, isLoading: isTxLoading, error: isTxErrored } = useTransactionReceipt({
    hash: mintNftHash
  })
  // const {basicNftContractAddress, accountAddress} = useAppContext()



  // const handleMintNFT = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
  //   e.preventDefault();
  //   setIsMintingProgressOpen(true)
  // }

  console.log("Errorrrrrr in MintNftModal: ", error)

  console.log("Minting errored: ", isTxErrored)


  const uploadFile = async () => {
    if (!image) {
      alert("No file selected");
      return;
    }

    try {
      setUploading(true);
      const keyRequest = await fetch("/api/key");
      const keyData = await keyRequest.json();
      const upload = await pinata.upload.file(image).key(keyData.JWT);
      console.log(upload);
      setUploading(false);
      const ipfsHash =  upload.IpfsHash;
      return `${IPFS_BASE_URL}/${ipfsHash}`
    } catch (e) {
      console.log(e);
      setUploading(false);
      console.log("Trouble uploading file");
    }
  };

  const uploadNft = async() => {
    const imgUrl = await uploadFile()
    const nftUrl = await uploadNftToIpfs(imgUrl as string, name) 
    setNftUrl(nftUrl as string)
    return nftUrl
  }



  const basicNftAddress: `0x${string}` = useReadContract({
    abi: marketPlaceAbi,
    address: process.env.NEXT_PUBLIC_NFT_MARKETPLACE_CONTRACT_ADDRESS as `0x${string}`,
    functionName: 'getBasicNftContractAddress'
  }).data as `0x${string}`

  const {address} = useAccount()


  const mintNft = async(tokenUri: string, price: any) => {
    console.log("Minting NFT...")
    try {
      const txHash = writeContract({
        abi: basicNftAbi,
        functionName: 'mintNft',
        args: [tokenUri, name, BigInt(price*(10**18)), category, new Date().toString()],
        address: basicNftAddress,
        account: address,
      })
      // writeContract(data?.request)
      console.log("Minting NFT complete...", txHash)
      console.log(error)

    } catch (error: any) {
      console.log("Error while minting: ", error.message)
    }
    
  }

  // const totalNftsCreated = useReadContract({
  //   abi: basicNftAbi,
  //   address: basicNftAddress,
  //   functionName: 'getTotalNftsCreated'
  // }).data

  // console.log("Basic NFT contract address: ", basicNftAddress)
  // console.log("Total NFTs created: ", totalNftsCreated)

  

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImage(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  // if(isTxSuccess) {
  //   // setLoading(false)
  //   setOpen(false)
  //   queryClient.invalidateQueries({ queryKey: queryKey })
  // }

  // if(isTxSuccess || isTxErrored){
  //   setOpen(false)
  //   queryClient.invalidateQueries({ queryKey: queryKey })
  // }

  React.useEffect(() => {
    if (isTxSuccess || isTxErrored) {
      setLoading(false)
      setOpen(false)
      // if(isTxSuccess) {
      //   toast.success("Minting Success!")
      // }
      // else if(isTxErrored) {
      //   toast.error("Minting Failed!")
      // }
      queryClient.invalidateQueries({ queryKey })
    }
  }, [isTxSuccess, isTxErrored, queryKey])

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault()
//     // Here you would typically send the data to your backend
//     // console.log('Submitting NFT:', { name, price, image })
//     // // Reset form after submission
//     // setName('')
//     // setPrice('')
//     // setImage(null)
//     // setPreviewUrl(null)
//     // e.preventDefault();
//     setNfts([...nfts, {id: nfts.length + 1, name: name, price: price, image: previewUrl}])
//   }

  return (
    <>
    <Dialog open={open} onOpenChange={setOpen}>
      {/* <DialogTrigger asChild> */}
        {/* <Button variant="outline">
          <PlusCircle className="mr-2 h-4 w-4" />
          Create NFT
        </Button> */}
        <Card className="flex items-center justify-center">
            <CardContent>
                <Button
                variant="outline"
                size="lg"
                className="h-48 w-48 rounded-full"
                onClick={() => setOpen(true)}
                >
                <PlusCircle className="h-24 w-24" />
                <span className="sr-only">Add new NFT</span>
                </Button>
            </CardContent>
        </Card>
      {/* </DialogTrigger> */}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New NFT</DialogTitle>
          <DialogDescription>
            Enter the details of your new NFT here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <form 
        // onSubmit={handleSubmit}
        >
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price (ETH)
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
                Category
              </Label>
            <Select onValueChange={setCategory} required>
              <SelectTrigger className="w-[277px]">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {/* <SelectLabel>Categories</SelectLabel> */}
                  {
                    categories.map((item) => (
                      <SelectItem key={item} value={item}>{item}</SelectItem>
                    ))
                  }
                  {/* <SelectItem value="apple">Apple</SelectItem>
                  <SelectItem value="banana">Banana</SelectItem>
                  <SelectItem value="blueberry">Blueberry</SelectItem>
                  <SelectItem value="grapes">Grapes</SelectItem>
                  <SelectItem value="pineapple">Pineapple</SelectItem> */}
                </SelectGroup>
              </SelectContent>
            </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="image" className="text-right">
                Image
              </Label>
              <div className="col-span-3 relative">
                {
                    previewUrl && (<button className="absolute top-1 right-2  text-white rounded-full p-1 text-2xl hover:font-extrabold" onClick={() => setPreviewUrl(null)}>
                        &times;
                    </button>)
                }
                
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="image"
                    className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                  >
                    {previewUrl ? (
                        
                        <Image
                            src={previewUrl}
                            alt="Preview"
                            className="w-full h-full object-contain rounded-lg"
                            width={40}
                            height={40}
                        />
                            
                        
                      
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          SVG, PNG, JPG or GIF (MAX. 800x400px)
                        </p>
                      </div>
                    )}
                    <input
                      id="image"
                      type="file"
                      className="hidden"
                      onChange={handleImageChange}
                      accept="image/*"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" 
            onClick={
              // handleMintNFT
                    async(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => 
                    {
                        e.preventDefault();
                        // setNfts([...nfts, {id: nfts.length + 1, name: name, price: price, image: previewUrl}])
                        setLoading(true)
                        const nftUrl = await uploadNft();
                        await mintNft(nftUrl as string, price) 
                        // setLoading(false)
                        // console.log("Tx Hash: ", hash)

                        // try {
                        //   await queryClient.invalidateQueries({ queryKey: readContractsQueryKey})
                        //   console.log("Refetching done")
                        // } catch (error) {
                        //   console.log("Error while refetching")
                        // }
                        
                    }
                    
                }
                disabled={loading}
                >
                  {loading && <Spinner size="small" className='text-black'/>}
                  Mint NFT
                </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    {/* <NFTMintingProgress
      isOpen={isMintingProgressOpen}
      onOpenChange={setIsMintingProgressOpen}
      onUploadToIPFS={uploadNft}
      onMintNFT={async() => await mintNft(nftUrl, price)}
    /> */}
    </>
  )
}