import { useState } from 'react';
import { getRegistryContract } from './contracts';

export function useAttest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submitAttestation = async (batchId) => {
    setLoading(true);
    setError(null);
    try {
      const contract = await getRegistryContract(true);
      const tx = await contract.submitAttestation(batchId);
      const receipt = await tx.wait();
      return receipt;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { submitAttestation, loading, error };
}
