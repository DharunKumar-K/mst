import { useState, useCallback } from 'react';
import { getWeb3Provider } from './provider';

export function useWallet() {
  const [account, setAccount] = useState(null);
  const [error, setError] = useState(null);

  const connectWallet = useCallback(async () => {
    try {
      const provider = getWeb3Provider();
      const accounts = await provider.send("eth_requestAccounts", []);
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setError(null);
      }
    } catch (err) {
      setError(err.message);
    }
  }, []);

  return { account, connectWallet, error };
}
