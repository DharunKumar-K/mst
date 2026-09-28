import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const Registry = await hre.ethers.getContractFactory("CirqProofRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log("CirqProofRegistry deployed to:", registryAddress);

  const Settlement = await hre.ethers.getContractFactory("CirqProofSettlement");
  const settlement = await Settlement.deploy(registryAddress);
  await settlement.waitForDeployment();
  const settlementAddress = await settlement.getAddress();
  console.log("CirqProofSettlement deployed to:", settlementAddress);

  // Set settlement contract in registry
  const tx = await registry.setSettlementContract(settlementAddress);
  await tx.wait();
  console.log("Settlement contract set in Registry");

  const network = await hre.ethers.provider.getNetwork();
  const chainId = network.chainId;

  const addresses = {
    network: hre.network.name,
    chainId: chainId.toString(),
    CirqProofRegistry: registryAddress,
    CirqProofSettlement: settlementAddress
  };

  const abiDir = path.join(__dirname, "..", "..", "shared", "abi");
  if (!fs.existsSync(abiDir)) {
    fs.mkdirSync(abiDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(abiDir, "addresses.testnet.json"),
    JSON.stringify(addresses, null, 2)
  );
  
  // Copy ABIs
  const registryArtifact = await hre.artifacts.readArtifact("CirqProofRegistry");
  fs.writeFileSync(path.join(abiDir, "CirqProofRegistry.json"), JSON.stringify(registryArtifact.abi, null, 2));

  const settlementArtifact = await hre.artifacts.readArtifact("CirqProofSettlement");
  fs.writeFileSync(path.join(abiDir, "CirqProofSettlement.json"), JSON.stringify(settlementArtifact.abi, null, 2));

  console.log("ABIs and addresses saved to shared/abi");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
