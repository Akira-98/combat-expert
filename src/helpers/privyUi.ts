import type { PrivyClientConfig, SendTransactionModalUIOptions, SignMessageModalUIOptions } from '@privy-io/react-auth'

export const privyIntlConfig: NonNullable<PrivyClientConfig['intl']> = {
  defaultCountry: 'KR',
  textLocalization: {
    'connectionStatus.successfullyConnected': '{walletName} 연결 완료',
    'connectionStatus.errorTitle': '연결 오류',
    'connectionStatus.connecting': '연결 중',
    'connectionStatus.connectOneWallet': '지갑 하나를 연결해 주세요',
    'connectionStatus.checkOtherWindows': '다른 창이나 지갑 앱을 확인해 주세요',
    'connectionStatus.stillHere': '계속 이 화면에 계신가요?',
    'connectionStatus.tryConnectingAgain': '다시 연결해 보세요',
    'connectionStatus.or': '또는',
    'connectionStatus.useDifferentLink': '다른 연결 방식을 사용하세요',
    'connectWallet.connectYourWallet': '지갑 연결',
    'connectWallet.waitingForWallet': '지갑 응답 대기 중',
    'connectWallet.connectToAccount': '계정에 지갑 연결',
    'connectWallet.installAndConnect': '지갑 설치 후 연결',
    'connectWallet.tryConnectingAgain': '다시 연결',
    'connectWallet.openInApp': '앱에서 열기',
    'connectWallet.copyLink': '링크 복사',
    'connectWallet.retry': '다시 시도',
    'connectWallet.searchPlaceholder': '지갑 검색',
    'connectWallet.noWalletsFound': '지갑을 찾을 수 없습니다',
    'connectWallet.lastUsed': '최근 사용',
    'connectWallet.selectYourWallet': '지갑 선택',
    'connectWallet.selectNetwork': '네트워크 선택',
    'connectWallet.goToWallet': '지갑으로 이동',
    'connectWallet.scanToConnect': 'QR을 스캔해 연결',
    'connectWallet.openOrInstall': '열기 또는 설치',
  },
}

const defaultSendTransactionUiOptions: SendTransactionModalUIOptions = {
  description: '거래 내용을 확인한 뒤 진행해 주세요.',
  buttonText: '확인',
  successHeader: '처리 완료',
  successDescription: '거래가 완료되었습니다.',
}

const defaultSignMessageUiOptions: SignMessageModalUIOptions = {
  title: '서명',
  description: '계속하려면 서명해 주세요.',
  buttonText: '서명하고 계속',
}

export const withPrivySendTransactionUi = <T extends { uiOptions?: SendTransactionModalUIOptions } | undefined>(options?: T) => ({
  ...options,
  uiOptions: {
    ...defaultSendTransactionUiOptions,
    ...options?.uiOptions,
  },
})

export const withPrivySignMessageUi = <T extends { uiOptions?: SignMessageModalUIOptions } | undefined>(options?: T) => ({
  ...options,
  uiOptions: {
    ...defaultSignMessageUiOptions,
    ...options?.uiOptions,
  },
})
