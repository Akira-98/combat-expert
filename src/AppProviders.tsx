import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PrivyProvider } from '@privy-io/react-auth'
import { SmartWalletsProvider } from '@privy-io/react-auth/smart-wallets'
import { WagmiProvider } from '@privy-io/wagmi'
import { AzuroSDKProvider } from '@azuro-org/sdk'
import { polygon } from 'viem/chains'
import App from './App'
import { AzuroSdkSocialAaConnectorProvider } from './azuroSdkSocialAaConnectorProvider'
import { AppConfigProvider } from './config/AppConfigContext'
import type { loadRuntimeConfig } from './config/runtimeConfig'
import { getPrivyIntlConfig } from './helpers/privyUi'
import { useI18n } from './i18n'
import { createWagmiConfig } from './wagmi'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      gcTime: 10 * 60_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchIntervalInBackground: false,
    },
  },
})

function createPrivyPolygonChain(rpcUrl: string) {
  return {
    ...polygon,
    rpcUrls: {
      default: { http: [rpcUrl] },
      public: { http: [rpcUrl] },
    },
  }
}

type RuntimeConfig = Awaited<ReturnType<typeof loadRuntimeConfig>>

export function AppProviders({ runtimeConfig }: { runtimeConfig: RuntimeConfig }) {
  const { locale } = useI18n()
  const privyPolygonChain = createPrivyPolygonChain(runtimeConfig.rpcUrl)
  const wagmiConfig = createWagmiConfig(runtimeConfig.rpcUrl)

  return (
    <AppConfigProvider config={runtimeConfig}>
      <PrivyProvider
        key={locale}
        appId={runtimeConfig.privyAppId}
        config={{
          defaultChain: privyPolygonChain,
          supportedChains: [privyPolygonChain],
          embeddedWallets: {
            ethereum: {
              createOnLogin: 'users-without-wallets',
            },
          },
          appearance: {
            showWalletLoginFirst: true,
            walletList: ['metamask'],
          },
          intl: getPrivyIntlConfig(locale),
          loginMethods: ['google', 'wallet'],
        }}
      >
        <SmartWalletsProvider>
          <QueryClientProvider client={queryClient}>
            <WagmiProvider config={wagmiConfig}>
              <AzuroSdkSocialAaConnectorProvider>
                <AzuroSDKProvider initialChainId={polygon.id}>
                  <App />
                </AzuroSDKProvider>
              </AzuroSdkSocialAaConnectorProvider>
            </WagmiProvider>
          </QueryClientProvider>
        </SmartWalletsProvider>
      </PrivyProvider>
    </AppConfigProvider>
  )
}
