const express = require('express');
const router = express.Router();

router.get('/config', (req, res) => {
  try {
    const addresses = require('../../shared/abi/addresses.testnet.json');
    res.json({
      network: addresses.network,
      chainId: addresses.chainId,
      registryAddress: addresses.CirqProofRegistry,
      settlementAddress: addresses.CirqProofSettlement
    });
  } catch (error) {
    res.status(404).json({ error: 'Config not available yet' });
  }
});

module.exports = router;
