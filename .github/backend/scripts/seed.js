require('dotenv').config();

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Organization = require('../models/Organization');
const User = require('../models/User');
const Batch = require('../models/Batch');

const organizations = [
  { name: 'Dell', type: 'PRODUCER', walletAddress: '0x0000000000000000000000000000000000000001' },
  { name: 'Recycler-A', type: 'RECYCLER', walletAddress: '0x0000000000000000000000000000000000000002' },
  { name: 'Auditor-B', type: 'AUDITOR', walletAddress: '0x0000000000000000000000000000000000000003' },
  { name: 'Buyer', type: 'BUYER', walletAddress: '0x0000000000000000000000000000000000000004' },
];

async function seed() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required');
  await mongoose.connect(process.env.MONGODB_URI);
  const savedOrganizations = new Map();
  for (const organization of organizations) {
    savedOrganizations.set(organization.name, await Organization.findOneAndUpdate(
      { name: organization.name }, organization, { upsert: true, new: true, setDefaultsOnInsert: true },
    ));
  }

  const passwordHash = await bcrypt.hash(process.env.SEED_PASSWORD || 'CirqProof-Demo-2026!', 12);
  const accounts = [
    { name: 'Dell', email: 'dell@example.test', role: 'PRODUCER', organization: 'Dell' },
    { name: 'Recycler-A', email: 'recycler@example.test', role: 'RECYCLER', organization: 'Recycler-A' },
    { name: 'Auditor-B', email: 'auditor@example.test', role: 'AUDITOR', organization: 'Auditor-B' },
    { name: 'Buyer', email: 'buyer@example.test', role: 'BUYER', organization: 'Buyer' },
  ];
  for (const account of accounts) {
    await User.findOneAndUpdate({ email: account.email }, {
      name: account.name,
      email: account.email,
      role: account.role,
      organization: savedOrganizations.get(account.organization)._id,
      passwordHash,
    }, { upsert: true, new: true, setDefaultsOnInsert: true });
  }

  await Batch.findOneAndUpdate({ batchId: 'CP-2026-001' }, {
    batchId: 'CP-2026-001', producer: 'Dell', recycler: 'Recycler-A', material: 'recycled polymer',
    claim: { quantity: 900, unit: 'kg' }, status: 'CREATED',
  }, { upsert: true, new: true, setDefaultsOnInsert: true });
  console.log('Seeded organizations, demo accounts, and CP-2026-001. Change demo passwords before deployment.');
}

seed().catch((error) => {
  console.error('Seed failed:', error.message);
  process.exitCode = 1;
}).finally(async () => {
  await mongoose.disconnect();
});