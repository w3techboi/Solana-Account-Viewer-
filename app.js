
// Solana Account Viewer
// Network: Solana Devnet

const DEVNET_URL = "https://api.devnet.solana.com";

const walletInput = document.getElementById("walletAddress");
const addButton = document.getElementById("addWallet");
const walletList = document.getElementById("walletList");

// Store all added wallets
let wallets = [];

// Save wallet addresses in the browser
function saveWallets() {
    const savedAddresses = wallets.map(wallet => ({
        address: wallet.address
    }));

    localStorage.setItem(
        "solanaWallets",
        JSON.stringify(savedAddresses)
    );
}// Load previously saved wallets
function loadWallets() {
    const savedAddresses = JSON.parse(
        localStorage.getItem("solanaWallets") || "[]"
    );

    wallets = savedAddresses.map(item => ({
        address: item.address,
        balance: "Loading...",
        status: "Restoring..."
    }));

    displayWallets();

    wallets.forEach(wallet => {
        checkWallet(wallet);
    });
}
// Connect to Solana Devnet and retrieve balance
async function getBalance(address) {
    const response = await fetch(DEVNET_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "getBalance",
            params: [address]
        })
    });

    if (!response.ok) {
        throw new Error("Network connection failed.");
    }

    const data = await response.json();

    if (data.error) {
        throw new Error(data.error.message);
    }

    // Convert lamports into SOL
    return data.result.value / 1000000000;
}

// Display all wallets
function displayWallets() {
    walletList.innerHTML = "";

    if (wallets.length === 0) {
        walletList.textContent = "No wallets added yet.";
        return;
    }

    wallets.forEach((wallet, index) => {
        const card = document.createElement("div");
        card.className = "wallet-card";

        const address = document.createElement("p");
        address.textContent = "Address: " + wallet.address;

        const balance = document.createElement("p");
        balance.textContent = "Balance: " + wallet.balance;

        const status = document.createElement("p");
        status.textContent = wallet.status;

        const removeButton = document.createElement("button");
        removeButton.textContent = "Remove";

        removeButton.addEventListener("click", () => {
            wallets.splice(index, 1);
          saveWallets();
            displayWallets();
        });

        card.appendChild(address);
        card.appendChild(balance);
        card.appendChild(status);
        card.appendChild(removeButton);

        walletList.appendChild(card);
    });
}

// Check an individual wallet
async function checkWallet(wallet) {
    wallet.status = "Checking Devnet...";
    displayWallets();

    try {
        const solBalance = await getBalance(wallet.address);

        wallet.balance = solBalance.toFixed(4) + " SOL";
        wallet.status = "Connected to Devnet";

    } catch (error) {
        wallet.balance = "Unavailable";
        wallet.status = "Error: " + error.message;
    }

    displayWallets();
}

// Add a new wallet
function addWallet() {
    const address = walletInput.value.trim();

    if (!address) {
        alert("Please enter a wallet address.");
        return;
    }

    // Validate Solana address format
    const solanaAddressPattern = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

    if (!solanaAddressPattern.test(address)) {
        alert("Please enter a valid Solana wallet address.");
        return;
    }

    const alreadyExists = wallets.some(
        wallet => wallet.address === address
    );

    if (alreadyExists) {
        alert("This wallet has already been added.");
        return;
    }

    const newWallet = {
        address: address,
        balance: "Loading...",
        status: "Preparing..."
    };

    wallets.push(newWallet);
  saveWallets();
    walletInput.value = "";

    displayWallets();
    checkWallet(newWallet);
}

// Button event
addButton.addEventListener("click", addWallet);

// Allow Enter key to add a wallet
walletInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        addWallet();
    }
});
// Restore saved wallets when the app opens
loadWallets();
