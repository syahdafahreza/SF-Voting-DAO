# SF Voting DAO
![Main Logo](https://github.com/user-attachments/assets/eb6447ed-6b04-49eb-975b-1ac81caea6c1)
<br>A private and secure on-chain voting system using Semaphore for anonymity and Hardhat for robust local development.

## 📖 Overview

This project provides a complete template for building a Decentralized Autonomous Organization (DAO) with a privacy-preserving voting mechanism. It leverages Zero-Knowledge proofs through the [Semaphore protocol](https://semaphore.appliedzkp.org/) to allow members to vote on proposals without revealing their identity, ensuring both fairness and privacy.

The core idea is that members can prove they belong to the group of eligible voters (the DAO) without disclosing which member they are. This is crucial for preventing collusion and coercion in decentralized governance.

## ✨ Key Features

- **Anonymous Voting:** Members cast votes without revealing their public wallet address.
- **ZK-Powered:** Utilizes ZK-SNARKs to generate and verify proofs of membership.
- **Hardhat Environment:** Comes with a pre-configured Hardhat setup for compiling, testing, and deploying smart contracts.
- **Comprehensive Tests:** Includes tests that simulate the full user flow: creating a group, making a proposal, and casting a vote anonymously.
- **Ready-to-Deploy:** Scripts are provided for easy deployment to a local or public network.

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js v18 or later
- Yarn or npm package manager

The necessary Semaphore circuit artifacts (`semaphore.wasm` & `semaphore.zkey`) are already included in the `/circuits` directory.

## 🏗️ Project Structure

Here's a breakdown of the repository's structure:

```
SF-Voting-DAO/
├── 📜 contracts/            # Smart contracts written in Solidity
│   └── PrivacyVotingDAOv2.sol # The core Privacy Voting DAO contract
├── frontend/               # React frontend application
├── 🧪 test/                 # Hardhat test files for contract verification
│   └── PrivacyVoting.test.ts # Comprehensive tests for PrivacyVotingDAOv2
├── 🚀 scripts/              # Deployment and interaction scripts
│   └── deploy.ts             # Script to deploy contracts to the blockchain
├── 🔗 circuits/             # Directory for Semaphore proof artifacts
│   ├── semaphore.wasm        # WebAssembly file for the Semaphore circuit
│   └── semaphore.zkey        # ZKey file for the Semaphore proving key
├── ⚙️ hardhat.config.ts      # Hardhat configuration for tasks and networks
├── 📦 package.json          # Project dependencies and scripts
└── 📝 README.md             # This file, providing a project overview
```

## 🚀 Getting Started

Follow these steps to get your local development environment up and running.

### 1. Clone the Repository

```bash
git clone https://github.com/syahdafahreza/SF-Voting-DAO/SF-Voting-DAO.git
cd SF-Voting-DAO
```

### 2. Install Dependencies

Dependencies must be installed in two places: the project root for the backend, and the `frontend` directory for the user interface.

**a) Backend Dependencies (Project Root)**

In your terminal, make sure you are in the project's root directory (`SF-Voting-DAO`) and run:
```bash
yarn install
# or
npm install
```

**b) Frontend Dependencies**

Next, navigate into the frontend directory and install its specific dependencies:
```bash
cd frontend
yarn install
# or
npm install
cd ..
```
After installation, the last command `cd ..` will bring you back to the root directory, ready for the next steps.


### 3. Compile Smart Contracts

From the root directory, compile the Solidity contracts.

```bash
npx hardhat compile
```

### 4. Run a Local Hardhat Node

In a new terminal (Terminal 1), start a local Ethereum network from the root directory.

```bash
npx hardhat node
```

**Important:** Leave this terminal window open. It's your local blockchain.

### 5. Deploy Contracts to the Local Network

Open a **new terminal window (Terminal 2)**. From the root directory, run the deployment script.

```bash
npx hardhat run scripts/deploy.ts --network localhost
```

If successful, you will see the deployed contract addresses. Copy the `PrivacyVotingDAOv2` address and paste it into your frontend configuration file (e.g., `frontend/src/App.tsx`).

### 6. Run the Frontend Application

Open a **third terminal window (Terminal 3)**, navigate to the frontend directory, and start the React application.

```bash
cd frontend
yarn start
# or
npm start
```

Your browser should automatically open to `http://localhost:3000`, where you can interact with the DAO.

## 🧪 Running Tests

To verify that the backend logic is working correctly, open a new terminal and run the test suite from the root directory.

```bash
npx hardhat test
```

## How the Tests Work

The main test file (`PrivacyVoting.test.ts`) executes the following key steps:

1.  **Identity & Group Creation:** It generates several user identities and adds their commitments to a Merkle group.
2.  **Contract Deployment:** It deploys the verifier and the main DAO contract, initializing it with the root of the Merkle group.
3.  **Proposal Creation:** It creates a new sample proposal to be voted on.
4.  **Proof Generation:** For a voter, it generates a valid Semaphore proof using the local `semaphore.wasm` and `semaphore.zkey` files.
5.  **Anonymous Voting:** It sends a transaction to the `vote` function with the generated proof.
6.  **Assertion:** Finally, it asserts that the vote was successfully recorded and the vote tally is correct.

## 🛠️ Troubleshooting & Notes

- **File Path Errors:** If you see errors related to file paths during testing, ensure your terminal's working directory is the project root.
- **Merkle Tree Depth:** The tree depth used in scripts must match the depth the circuit files were compiled with (the standard is 20).
- **Contract Address:** After deploying, always remember to update the contract address in your frontend application.
