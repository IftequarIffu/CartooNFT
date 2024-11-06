import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

export default function LandingPageHeroSection() {
  return (
    <section className="relative overflow-hidden md:py-10 sm:py-32">
      <div className="absolute inset-0 " />
      <div className="relative container mx-auto px-4">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          <div className="max-w-xl">
            <h1 className="mb-4 text-4xl font-normal tracking-tight sm:text-5xl lg:text-6xl">
              Discover, Collect, and Sell Extraordinary Cartoon NFTs
            </h1>
            <p className="mb-8 text-lg  sm:text-xl">
              Explore the world&apos;s leading Cartoon NFT marketplace. Buy and sell digital art, collectibles, and more with ease and security.
            </p>
            <div className="flex flex-wrap gap-4">
                <Link href={"/marketplace"}>
                <Button size="lg" className="">
                    Explore NFTs
                </Button>
              </Link>
              <Link href={"/dashboard"}>
              <Button size="lg" variant="outline" className="">
                Create NFT
              </Button>
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            {[
              "/25.svg",
              "/44.svg",
              "/8.svg",
              "/19.svg"
            ].map((src, index) => (
              <div key={index} className="relative aspect-square overflow-hidden rounded-xl  shadow-lg transition-transform hover:scale-105">
                <Image
                  src={src}
                  alt={`Featured NFT ${index + 1}`}
                  layout="fill"
                  objectFit="contain"
                  className="transition-opacity hover:opacity-80"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}