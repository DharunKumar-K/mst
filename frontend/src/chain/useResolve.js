import { useState } from 'react';
import { getRegistryContract } from './contracts';

export function useResolve() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const resolveChallenge = async (batchId, isVerified) => {
    setLoading(true);
    setError(null);
    try {
      const contract = await getRegistryContract(true);
      const tx = await contract.resolveChallenge(batchId, isVerified);
      const receipt = await tx.wait();
      return receipt;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { resolveChallenge, loading, error };
}
