const connectBtn = document.getElementById("connectBtn");
const walletAddress = document.getElementById("walletAddress");
const statusText = document.getElementById("status");
const adminPanel = document.getElementById("adminPanel");

const contractAddress = "0x274ae19Fd5d3e36027156FA64B4e259339161bEa";
const abi = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_head",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_title",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_duration",
				"type": "uint256"
			}
		],
		"name": "createProposal",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "proposalId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "title",
				"type": "string"
			}
		],
		"name": "ProposalCreated",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "support",
				"type": "bool"
			}
		],
		"name": "vote",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "proposalId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "voter",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "choice",
				"type": "bool"
			}
		],
		"name": "Voted",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			}
		],
		"name": "getResult",
		"outputs": [
			{
				"internalType": "string",
				"name": "result",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "hasVoted",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "proposalCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "proposals",
		"outputs": [
			{
				"internalType": "string",
				"name": "head",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "title",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "yesVotes",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "noVotes",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "voteStartTime",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "voteEndTime",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "executed",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]

let provider, signer, contract;

// ================= CONNECT WALLET =================
connectBtn.onclick = async () => {
  try {
    if (!window.ethereum) {
      alert("Please install MetaMask");
      return;
    }

    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();

    const userAddress = await signer.getAddress();
    walletAddress.innerText = "Connected: " + userAddress;

    contract = new ethers.Contract(contractAddress, abi, signer);

    const owner = await contract.owner();

    if (owner.toLowerCase() === userAddress.toLowerCase()) {
      adminPanel.classList.remove("hidden");
      document.getElementById("resultsPanel").classList.remove("hidden");

      await loadAdminResults();
    } else {
      alert("You are not admin");
    }

  } catch (err) {
    console.error(err);
    alert("Connection failed");
  }
};

// ================= CREATE PROPOSAL =================
document.getElementById("createBtn").onclick = async () => {
  const head = document.getElementById("head").value;
  const title = document.getElementById("title").value;
  const duration = document.getElementById("duration").value;

  if (!head || !title || !duration) {
    alert("Fill all fields");
    return;
  }

  try {
    statusText.innerText = "Creating proposal...";
    const tx = await contract.createProposal(head, title, duration);
    await tx.wait();
    statusText.innerText = "✅ Proposal created";

    await loadAdminResults(); // refresh results after new proposal
  } catch (err) {
    console.error(err);
    statusText.innerText = "❌ Transaction failed";
  }
};

// ================= LOAD LAST 5 COMPLETED RESULTS =================
async function loadAdminResults() {
  const resultsBox = document.getElementById("adminResults");
  resultsBox.innerHTML = "";

  const count = Number(await contract.proposalCount());
  const now = Math.floor(Date.now() / 1000);

  let shown = 0;

  for (let i = count; i >= 1 && shown < 5; i--) {
    const p = await contract.proposals(i);
    const end = Number(p.voteEndTime);

    if (end <= now) {
      const result = await contract.getResult(i);

      const card = document.createElement("div");
      card.className = "result-card";

      card.innerHTML = `
        <h4>${p.head}</h4>
        <p>${p.title}</p>
        <strong>Result: ${result}</strong>
      `;

      resultsBox.appendChild(card);
      shown++;
    }
  }

  if (shown === 0) {
    resultsBox.innerHTML = "<p>No completed proposals yet</p>";
  }
}
