import { ethers } from 'ethers';

export const getWeb3Provider = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  throw new Error('No Ethereum wallet found');
};
