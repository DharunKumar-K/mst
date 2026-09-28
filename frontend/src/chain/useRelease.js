import { useState } from 'react';
import { getSettlementContract } from './contracts';

export function useRelease() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const release = async (batchId) => {
    setLoading(true);
    setError(null);
    try {
      const contract = await getSettlementContract(true);
      const tx = await contract.release(batchId);
      const receipt = await tx.wait();
      return receipt;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { release, loading, error };
}
