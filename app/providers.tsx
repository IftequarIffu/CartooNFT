'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';

import { config } from '../lib/wagmiConfig';
// import { AppContextProvider } from '@/context/AppContext';

export const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {/* <AppContextProvider> */}
          <RainbowKitProvider>{children}</RainbowKitProvider>
        {/* </AppContextProvider> */}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
