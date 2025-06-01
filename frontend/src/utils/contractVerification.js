import { ethers } from "ethers";

// Network configurations for contract verification
const NETWORK_CONFIGS = {
  97: { // BSC Testnet
    name: "BSC Testnet",
    explorerUrl: "https://testnet.bscscan.com",
    apiUrl: "https://api-testnet.bscscan.com/api",
    apiKey: process.env.REACT_APP_BSCSCAN_API_KEY || ""
  },
  56: { // BSC Mainnet
    name: "BSC Mainnet",
    explorerUrl: "https://bscscan.com",
    apiUrl: "https://api.bscscan.com/api",
    apiKey: process.env.REACT_APP_BSCSCAN_API_KEY || ""
  },
  1: { // Ethereum Mainnet
    name: "Ethereum Mainnet",
    explorerUrl: "https://etherscan.io",
    apiUrl: "https://api.etherscan.io/api",
    apiKey: process.env.REACT_APP_ETHERSCAN_API_KEY || ""
  },
  11155111: { // Sepolia Testnet
    name: "Sepolia Testnet",
    explorerUrl: "https://sepolia.etherscan.io",
    apiUrl: "https://api-sepolia.etherscan.io/api",
    apiKey: process.env.REACT_APP_ETHERSCAN_API_KEY || ""
  }
};

export async function getNetworkConfig() {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);
    return NETWORK_CONFIGS[chainId] || null;
  } catch (error) {
    console.error("Error getting network config:", error);
    return null;
  }
}

export function getExplorerUrl(address, networkConfig) {
  if (!networkConfig) return null;
  return `${networkConfig.explorerUrl}/address/${address}`;
}

export function getExplorerTxUrl(txHash, networkConfig) {
  if (!networkConfig) return null;
  return `${networkConfig.explorerUrl}/tx/${txHash}`;
}

// Generate Solidity source code for verification
export function generateSourceCode(tokenData) {
  // Use the actual multi-file structure to match deployed bytecode
  return {
    "contracts/IERC20.sol": {
      content: `// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}`
    },
    "contracts/ERC20Custom.sol": {
      content: `// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "./IERC20.sol";

contract ERC20Custom is IERC20 {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 private _totalSupply;
    address public owner;
    bool public isMintable;
    bool public isBurnable;

    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier modifyCanMint() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint256 _initialSupply,
        address _owner,
        bool _isMintable,
        bool _isBurnable
    ) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        owner = _owner;
        isMintable = _isMintable;
        isBurnable = _isBurnable;
        _mint(_owner, _initialSupply);
    }

    function totalSupply() public view override returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view override returns (uint256) {
        return _balances[account];
    }

    function transfer(address recipient, uint256 amount) public override returns (bool) {
        _transfer(msg.sender, recipient, amount);
        return true;
    }

    function allowance(address _owner, address spender) public view override returns (uint256) {
        return _allowances[_owner][spender];
    }

    function approve(address spender, uint256 amount) public override returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address sender, address recipient, uint256 amount) public override returns (bool) {
        uint256 currentAllowance = _allowances[sender][msg.sender];
        require(currentAllowance >= amount, "ERC20: transfer amount exceeds allowance");
        _approve(sender, msg.sender, currentAllowance - amount);
        _transfer(sender, recipient, amount);
        return true;
    }


    function mint(address to, uint256 amount) public onlyOwner {
        require(isMintable, "Minting is disabled");
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) public onlyOwner {
        require(isBurnable, "Burning is disabled");
        _burn(from, amount);
    }

    function _transfer(address from, address to, uint256 amount) internal {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");
        require(_balances[from] >= amount, "ERC20: transfer amount exceeds balance");
        _balances[from] -= amount;
        _balances[to] += amount;
        emit Transfer(from, to, amount);
    }

    function _mint(address account, uint256 amount) internal {
        require(account != address(0), "ERC20: mint to the zero address");
        _totalSupply += amount;
        _balances[account] += amount;
        emit Transfer(address(0), account, amount);
    }

    function _burn(address account, uint256 amount) internal {
        require(account != address(0), "ERC20: burn from the zero address");
        require(_balances[account] >= amount, "ERC20: burn amount exceeds balance");
        _balances[account] -= amount;
        _totalSupply -= amount;
        emit Transfer(account, address(0), amount);
    }

    function _approve(address _owner, address spender, uint256 amount) internal {
        require(_owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");
        _allowances[_owner][spender] = amount;
        emit Approval(_owner, spender, amount);
    }
}`
    }
  };
}

// Get constructor arguments encoded for verification
export function getConstructorArguments(tokenData) {
  const { name, symbol, decimals, initialSupply, owner, isMintable, isBurnable } = tokenData;
  
  // Encode constructor arguments
  const abiCoder = ethers.AbiCoder.defaultAbiCoder();
  return abiCoder.encode(
    ["string", "string", "uint8", "uint256", "address", "bool", "bool"],
    [name, symbol, decimals, initialSupply, owner, isMintable, isBurnable]
  ).slice(2); // Remove 0x prefix
}

// Verify contract on block explorer
export async function verifyContract(contractAddress, tokenData, networkConfig) {
  if (!networkConfig || !networkConfig.apiKey) {
    throw new Error("API key not configured for this network");
  }

  const sourceFiles = generateSourceCode(tokenData);
  const constructorArguments = getConstructorArguments(tokenData);

  // Format source code for multi-file verification
  const sourceCode = JSON.stringify({
    language: "Solidity",
    sources: sourceFiles,
    settings: {
      optimizer: {
        enabled: false,
        runs: 200
      },
      outputSelection: {
        "*": {
          "*": ["*"]
        }
      }
    }
  });

  const verifyData = {
    apikey: networkConfig.apiKey,
    module: "contract",
    action: "verifysourcecode",
    contractaddress: contractAddress,
    sourceCode: sourceCode,
    codeformat: "solidity-standard-json-input",
    contractname: "contracts/ERC20Custom.sol:ERC20Custom",
    compilerversion: "v0.8.28+commit.7893614a",
    constructorArguements: constructorArguments
  };

  try {
    const response = await fetch(networkConfig.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(verifyData)
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Verification error:", error);
    throw error;
  }
}

// Check verification status
export async function checkVerificationStatus(guid, networkConfig) {
  if (!networkConfig || !networkConfig.apiKey) {
    throw new Error("API key not configured for this network");
  }

  const checkData = {
    apikey: networkConfig.apiKey,
    module: "contract",
    action: "checkverifystatus",
    guid: guid
  };

  try {
    const response = await fetch(networkConfig.apiUrl + "?" + new URLSearchParams(checkData));
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Check verification status error:", error);
    throw error;
  }
}
