export const config = {
  registryAddress: process.env.REACT_APP_REGISTRY_ADDRESS || '',
  settlementAddress: process.env.REACT_APP_SETTLEMENT_ADDRESS || '',
  networkName: 'MST Testnet',
  chainId: process.env.REACT_APP_CHAIN_ID ? parseInt(process.env.REACT_APP_CHAIN_ID) : 1337
};
