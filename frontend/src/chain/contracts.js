import { getWeb3Provider } from './provider';
import { config } from './config';
import RegistryABI from '../../../shared/abi/CirqProofRegistry.json';
import SettlementABI from '../../../shared/abi/CirqProofSettlement.json';
import { ethers } from 'ethers';

export const getRegistryContract = async (withSigner = false) => {
  const provider = getWeb3Provider();
  const signerOrProvider = withSigner ? await provider.getSigner() : provider;
  return new ethers.Contract(config.registryAddress, RegistryABI, signerOrProvider);
};

export const getSettlementContract = async (withSigner = false) => {
  const provider = getWeb3Provider();
  const signerOrProvider = withSigner ? await provider.getSigner() : provider;
  return new ethers.Contract(config.settlementAddress, SettlementABI, signerOrProvider);
};
