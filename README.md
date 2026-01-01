🗳️ VoteChain – Decentralized Voting dApp

VoteChain is a decentralized voting application built using Solidity, Ethereum, and JavaScript.
It allows an admin to create proposals and users to vote transparently on the blockchain.

The project is designed to be simple, educational, and easy to deploy for anyone learning Web3.

🚀 Features

✅ Admin can create proposals

🕒 Time-based voting (start & end time)

👍👎 Users can vote YES / NO

🔐 One vote per wallet

📊 View live and completed proposal results

🌐 Fully decentralized (on-chain logic)

🛠️ Tech Stack

Solidity – Smart contract

Ethereum / EVM chain – Blockchain

Ethers.js – Blockchain interaction

HTML / CSS / JavaScript – Frontend

Vercel – Frontend deployment

MetaMask – Wallet connection

📁 Project Structure
VoteChain/
│
├── contracts/
│   └── VoteChain.sol        # Smart contract
│
├── frontend/
│   ├── admin.html           # Admin panel
│   ├── index.html           # User voting page
│   ├── app.js               # Contract interaction logic
│   └── style.css
│
├── vercel.json
├── README.md

🔐 Who is the Admin?

The admin is the wallet address that deploys the smart contract.

This address has permission to:

Create proposals

Set voting duration

Admin is stored on-chain during deployment

👉 Only the deployer wallet becomes admin

🧑‍💼 How to Become Admin (Step-by-Step)
1️⃣ Deploy the Smart Contract

Open Remix IDE

Upload VoteChain.sol

Compile the contract

Deploy using MetaMask

Copy the contract address

⚠️ The wallet used here becomes the admin

2️⃣ Update Frontend Contract Details

In app.js, update:

const contractAddress = "YOUR_DEPLOYED_CONTRACT_ADDRESS";


And ensure ABI is correct.

3️⃣ Open Admin Page

Open admin.html

Connect MetaMask using the admin wallet

You can now:

Create proposals

Set voting time

If a non-admin wallet connects, admin actions will fail.

👤 How Users Can Vote

Open index.html

Connect MetaMask

View active proposals

Vote YES or NO

Results are stored on-chain
