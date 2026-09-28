import { useState } from 'react';
import { getSettlementContract } from './contracts';

export function useDeposit() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deposit = async (batchId, amountInWei) => {
    setLoading(true);
    setError(null);
    try {
      const contract = await getSettlementContract(true);
      const tx = await contract.deposit(batchId, { value: amountInWei });
      const receipt = await tx.wait();
      return receipt;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deposit, loading, error };
}
