import { useState } from 'react';
import { getRegistryContract } from './contracts';

export function useVerify() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const verifyAttestation = async (batchId) => {
    setLoading(true);
    setError(null);
    try {
      const contract = await getRegistryContract(true);
      const tx = await contract.verifyAttestation(batchId);
      const receipt = await tx.wait();
      return receipt;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { verifyAttestation, loading, error };
}
