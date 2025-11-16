// This file assumes Web3 is loaded globally from a script tag in index.html
declare const Web3: any;

// Mock configuration
const MOCK_PROVIDER = 'https://ropsten.infura.io/v3/YOUR_PROJECT_ID'; // Using a placeholder
const MOCK_CONTRACT_ADDRESS = '0x0123456789ABCDEF0123456789ABCDEF01234567';
const MOCK_CONTRACT_ABI: any[] = [
    {
        "constant": false,
        "inputs": [
            { "name": "timestamp", "type": "uint256" },
            { "name": "user", "type": "string" },
            { "name": "action", "type": "string" },
            { "name": "dataHash", "type": "string" }
        ],
        "name": "logAction",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

// In a real app, you would initialize Web3 with a provider like MetaMask.
// Here, we just mock the objects to demonstrate the flow.
// const web3 = new Web3(MOCK_PROVIDER);
// const auditTrailContract = new web3.eth.Contract(MOCK_CONTRACT_ABI, MOCK_CONTRACT_ADDRESS);

export const logAction = async (user: string, action: string, dataHash: string): Promise<void> => {
    const timestamp = Date.now();
    const logEntry = {
        timestamp,
        user,
        action,
        dataHash
    };

    console.log('%cBLOCKCHAIN AUDIT TRAIL (MOCK)', 'color: #7C3AED; font-weight: bold;', 'New transaction submitted:');
    console.log(logEntry);

    // In a real app, this would be the call:
    /*
    const accounts = await web3.eth.getAccounts();
    await auditTrailContract.methods.logAction(
        timestamp,
        user,
        action,
        dataHash
    ).send({ from: accounts[0] });
    */

    // Simulate network delay for the mock
    return new Promise(resolve => setTimeout(resolve, 300));
};