import { ethers } from "hardhat";
import { Identity } from "@semaphore-protocol/identity";
import { Group } from "@semaphore-protocol/group";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // --- PERBAIKAN: Gunakan logika yang sama seperti di pengujian ---

  // 1. Definisikan daftar rahasia identitas yang sama persis
  const identitySecrets = [
      "secret-user-1-!@#$", "secret-user-2-!@#$",
      "secret-user-3-!@#$", "secret-user-4-!@#$",
      "secret-user-5-!@#$", "secret-user-6-!@#$",
      "secret-user-7-!@#$", "secret-user-8-!@#$",
      "secret-user-9-!@#$", "secret-user-10-!@#$"
  ];
  
  const group = new Group();
  const identities: Identity[] = [];

  for (const secret of identitySecrets) {
    const id = new Identity(secret);
    identities.push(id);
    group.addMember(id.commitment);
  }

  // 2. Hitung Merkle Root yang sebenarnya
  const actualMerkleRoot = group.root;
  
  console.log("✅ Actual Merkle Root calculated:", actualMerkleRoot.toString());
  
  // Opsi: Cetak komitmen lagi untuk memastikan sinkronisasi
  const memberCommitments = identities.map(id => id.commitment.toString());
  console.log("\n📋 Member commitments for this deployment:\n");
  console.log(JSON.stringify(memberCommitments, null, 2));
  console.log("\n");


  // Deploy verifier contract
  const VerifierFactory = await ethers.getContractFactory("SemaphoreVerifier");
  const verifier = await VerifierFactory.deploy();
  await verifier.waitForDeployment();
  const verifierAddress = await verifier.getAddress();
  console.log("✅ SemaphoreVerifier deployed to:", verifierAddress);

  // Deploy DAO contract
  const DAOFactory = await ethers.getContractFactory("PrivacyVotingDAOv2");
  
  // 3. Deploy kontrak DAO dengan Merkle Root yang benar
  const dao = await DAOFactory.deploy(
    verifierAddress,
    actualMerkleRoot, // Gunakan root yang sebenarnya, bukan dummy
    ethers.ZeroAddress
  );
  await dao.waitForDeployment();
  const daoAddress = await dao.getAddress();

  console.log("\n====================================================");
  console.log("✅ PrivacyVotingDAOv2 deployed to:", daoAddress);
  console.log("!!! PENTING: Salin alamat kontrak di atas dan perbarui DAO_ADDRESS di App.tsx Anda.");
  console.log("====================================================\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});