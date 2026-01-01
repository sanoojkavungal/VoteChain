const connectBtn = document.getElementById("connectBtn");
const proposalContainer = document.getElementById("proposals");
const walletAddress = document.getElementById("wallet");

const contractAddress = "0x274ae19Fd5d3e36027156FA64B4e259339161bEa";

const abi =[
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
];

let provider, signer, contract;

/* =======================
   CONNECT WALLET
======================= */
connectBtn.onclick = async () => {
  if (!window.ethereum) {
    alert("Please install MetaMask");
    return;
  }

  provider = new ethers.BrowserProvider(window.ethereum);
  signer = await provider.getSigner();

  const address = await signer.getAddress();
  walletAddress.innerText = `Wallet: ${address}`;

  contract = new ethers.Contract(contractAddress, abi, signer);

  // Show sections AFTER connect
  document.getElementById("activeSection").style.display = "block";
  document.getElementById("completedSection").style.display = "block";

  await loadProposals();
};

/* =======================
   TIME FORMATTER
======================= */
function formatTime(seconds) {
  if (seconds <= 0) return "Voting ended";

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  return `${h}h ${m}m ${s}s`;
}

/* =======================
   LOAD PROPOSALS
======================= */
async function loadProposals() {
  const activeBox = document.getElementById("activeProposals");
  const completedBox = document.getElementById("completedProposals");
  const activeSection = document.getElementById("activeSection");
  const completedSection = document.getElementById("completedSection");

  activeBox.innerHTML = "";
  completedBox.innerHTML = "";

  const count = Number(await contract.proposalCount());
  const now = Math.floor(Date.now() / 1000);

  let hasActive = false;
  let completedShown = 0;

  // Latest → Oldest
  for (let i = count; i >= 1; i--) {
    const p = await contract.proposals(i);

    const start = Number(p.voteStartTime);
    const end = Number(p.voteEndTime);

    /* ===== ACTIVE PROPOSALS ===== */
    if (start <= now && end > now) {
      hasActive = true;

      const remaining = end - now;

      const card = document.createElement("div");
      card.className = "card active";

      card.innerHTML = `
        <h3>${p.head}</h3>
        <p>${p.title}</p>

        <p class="time">
          ⏳ Time Left:
          <span>${formatTime(remaining)}</span>
        </p>

        <p>YES: ${p.yesVotes} | NO: ${p.noVotes}</p>

        <button onclick="vote(${i}, true)">YES</button>
        <button onclick="vote(${i}, false)">NO</button>
      `;

      activeBox.appendChild(card);
    }

    /* ===== COMPLETED (LAST 2 ONLY) ===== */
    if (end <= now && completedShown < 2) {
      const result = await contract.getResult(i);

      const card = document.createElement("div");
      card.className = "card completed";

      card.innerHTML = `
        <h3>${p.head}</h3>
        <p>${p.title}</p>
        <strong>Result: ${result}</strong>
      `;

      completedBox.appendChild(card);
      completedShown++;
    }
  }

  /* ===== SHOW / HIDE SECTIONS ===== */
  activeSection.style.display = hasActive ? "block" : "none";
  completedSection.style.display = completedShown > 0 ? "block" : "none";
}

/* =======================
   VOTE
======================= */
async function vote(id, support) {
  try {
    const tx = await contract.vote(id, support);
    await tx.wait();

    alert("Vote submitted");
    await loadProposals();
  } catch (err) {
    alert(err.reason || "Voting failed");
  }
}


