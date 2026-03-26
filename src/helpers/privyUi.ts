import type { PrivyClientConfig, SendTransactionModalUIOptions, SignMessageModalUIOptions } from '@privy-io/react-auth'
import { type Locale, translate } from '../i18n'

export const getPrivyIntlConfig = (locale: Locale): NonNullable<PrivyClientConfig['intl']> => ({
  defaultCountry: locale === 'ko' ? 'KR' : 'US',
  textLocalization: {
    'connectionStatus.successfullyConnected': translate('privy.connected', undefined, locale),
    'connectionStatus.errorTitle': translate('privy.errorTitle', undefined, locale),
    'connectionStatus.connecting': translate('privy.connecting', undefined, locale),
    'connectionStatus.connectOneWallet': translate('privy.connectOneWallet', undefined, locale),
    'connectionStatus.checkOtherWindows': translate('privy.checkOtherWindows', undefined, locale),
    'connectionStatus.stillHere': translate('privy.stillHere', undefined, locale),
    'connectionStatus.tryConnectingAgain': translate('privy.tryAgain', undefined, locale),
    'connectionStatus.or': translate('privy.or', undefined, locale),
    'connectionStatus.useDifferentLink': translate('privy.useDifferentLink', undefined, locale),
    'connectWallet.connectYourWallet': translate('privy.connectWallet', undefined, locale),
    'connectWallet.waitingForWallet': translate('privy.waitingForWallet', undefined, locale),
    'connectWallet.connectToAccount': translate('privy.connectToAccount', undefined, locale),
    'connectWallet.installAndConnect': translate('privy.installAndConnect', undefined, locale),
    'connectWallet.tryConnectingAgain': translate('privy.tryConnectingAgain', undefined, locale),
    'connectWallet.openInApp': translate('privy.openInApp', undefined, locale),
    'connectWallet.copyLink': translate('privy.copyLink', undefined, locale),
    'connectWallet.retry': translate('privy.retry', undefined, locale),
    'connectWallet.searchPlaceholder': translate('privy.searchWallet', undefined, locale),
    'connectWallet.noWalletsFound': translate('privy.noWalletsFound', undefined, locale),
    'connectWallet.lastUsed': translate('privy.lastUsed', undefined, locale),
    'connectWallet.selectYourWallet': translate('privy.selectWallet', undefined, locale),
    'connectWallet.selectNetwork': translate('privy.selectNetwork', undefined, locale),
    'connectWallet.goToWallet': translate('privy.goToWallet', undefined, locale),
    'connectWallet.scanToConnect': translate('privy.scanToConnect', undefined, locale),
    'connectWallet.openOrInstall': translate('privy.openOrInstall', undefined, locale),
  },
})

const getDefaultSendTransactionUiOptions = (locale: Locale): SendTransactionModalUIOptions => ({
  description: translate('privy.txDescription', undefined, locale),
  buttonText: translate('privy.confirm', undefined, locale),
  successHeader: translate('privy.successHeader', undefined, locale),
  successDescription: translate('privy.successDescription', undefined, locale),
})

const getDefaultSignMessageUiOptions = (locale: Locale): SignMessageModalUIOptions => ({
  title: translate('privy.signTitle', undefined, locale),
  description: translate('privy.signDescription', undefined, locale),
  buttonText: translate('privy.signButton', undefined, locale),
})

export const withPrivySendTransactionUi = <T extends { uiOptions?: SendTransactionModalUIOptions } | undefined>(options?: T) => ({
  ...options,
  uiOptions: {
    ...getDefaultSendTransactionUiOptions((localStorage.getItem('combat-expert:locale') as Locale) || 'ko'),
    ...options?.uiOptions,
  },
})

export const withPrivySignMessageUi = <T extends { uiOptions?: SignMessageModalUIOptions } | undefined>(options?: T) => ({
  ...options,
  uiOptions: {
    ...getDefaultSignMessageUiOptions((localStorage.getItem('combat-expert:locale') as Locale) || 'ko'),
    ...options?.uiOptions,
  },
})
