import type { PrivyClientConfig, SendTransactionModalUIOptions, SignMessageModalUIOptions } from '@privy-io/react-auth'
import { translate } from '../i18n'

export const getPrivyIntlConfig = (): NonNullable<PrivyClientConfig['intl']> => ({
  defaultCountry: 'US',
  textLocalization: {
    'connectionStatus.successfullyConnected': translate('privy.connected'),
    'connectionStatus.errorTitle': translate('privy.errorTitle'),
    'connectionStatus.connecting': translate('privy.connecting'),
    'connectionStatus.connectOneWallet': translate('privy.connectOneWallet'),
    'connectionStatus.checkOtherWindows': translate('privy.checkOtherWindows'),
    'connectionStatus.stillHere': translate('privy.stillHere'),
    'connectionStatus.tryConnectingAgain': translate('privy.tryAgain'),
    'connectionStatus.or': translate('privy.or'),
    'connectionStatus.useDifferentLink': translate('privy.useDifferentLink'),
    'connectWallet.connectYourWallet': translate('privy.connectWallet'),
    'connectWallet.waitingForWallet': translate('privy.waitingForWallet'),
    'connectWallet.connectToAccount': translate('privy.connectToAccount'),
    'connectWallet.installAndConnect': translate('privy.installAndConnect'),
    'connectWallet.tryConnectingAgain': translate('privy.tryConnectingAgain'),
    'connectWallet.openInApp': translate('privy.openInApp'),
    'connectWallet.copyLink': translate('privy.copyLink'),
    'connectWallet.retry': translate('privy.retry'),
    'connectWallet.searchPlaceholder': translate('privy.searchWallet'),
    'connectWallet.noWalletsFound': translate('privy.noWalletsFound'),
    'connectWallet.lastUsed': translate('privy.lastUsed'),
    'connectWallet.selectYourWallet': translate('privy.selectWallet'),
    'connectWallet.selectNetwork': translate('privy.selectNetwork'),
    'connectWallet.goToWallet': translate('privy.goToWallet'),
    'connectWallet.scanToConnect': translate('privy.scanToConnect'),
    'connectWallet.openOrInstall': translate('privy.openOrInstall'),
  },
})

const getDefaultSendTransactionUiOptions = (): SendTransactionModalUIOptions => ({
  description: translate('privy.txDescription'),
  buttonText: translate('privy.confirm'),
  successHeader: translate('privy.successHeader'),
  successDescription: translate('privy.successDescription'),
})

const getDefaultSignMessageUiOptions = (): SignMessageModalUIOptions => ({
  title: translate('privy.signTitle'),
  description: translate('privy.signDescription'),
  buttonText: translate('privy.signButton'),
})

export const withPrivySendTransactionUi = <T extends { uiOptions?: SendTransactionModalUIOptions } | undefined>(options?: T) => ({
  ...options,
  uiOptions: {
    ...getDefaultSendTransactionUiOptions(),
    ...options?.uiOptions,
  },
})

export const withPrivySignMessageUi = <T extends { uiOptions?: SignMessageModalUIOptions } | undefined>(options?: T) => ({
  ...options,
  uiOptions: {
    ...getDefaultSignMessageUiOptions(),
    ...options?.uiOptions,
  },
})
