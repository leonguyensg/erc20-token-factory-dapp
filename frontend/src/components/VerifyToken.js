import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { 
  getNetworkConfig, 
  getExplorerUrl, 
  verifyContract, 
  checkVerificationStatus 
} from "../utils/contractVerification";
import { getSigner } from "../utils/ethersUtils";
import erc20Artifact from "../abi/ERC20Custom.json";

function VerifyToken() {
  const [form, setForm] = useState({
    tokenAddress: "",
    name: "",
    symbol: "",
    decimals: "",
    initialSupply: "",
    owner: "",
    isMintable: false,
    isBurnable: false
  });
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [alert, setAlert] = useState("");
  const [networkConfig, setNetworkConfig] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [verificationGuid, setVerificationGuid] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("");

  useEffect(() => {
    const loadNetworkConfig = async () => {
      const config = await getNetworkConfig();
      setNetworkConfig(config);
    };
    loadNetworkConfig();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const fetchTokenData = async () => {
    if (!form.tokenAddress || form.tokenAddress.length !== 42) {
      setAlert("Please enter a valid token address");
      return;
    }

    setLoading(true);
    setAlert("");
    try {
      const signer = await getSigner();
      const token = new ethers.Contract(form.tokenAddress, erc20Artifact.abi, signer);
      
      const [name, symbol, decimals, totalSupply, owner, isMintable, isBurnable] = await Promise.all([
        token.name(),
        token.symbol(),
        token.decimals(),
        token.totalSupply(),
        token.owner(),
        token.isMintable(),
        token.isBurnable()
      ]);

      setForm(prev => ({
        ...prev,
        name,
        symbol,
        decimals: decimals.toString(),
        initialSupply: ethers.formatUnits(totalSupply, decimals),
        owner,
        isMintable,
        isBurnable
      }));

      setAlert("Token data loaded successfully!");
    } catch (err) {
      setAlert("Error: " + (err.message || err));
    }
    setLoading(false);
  };

  const handleVerify = async () => {
    if (!networkConfig) {
      setAlert("Network not supported for verification");
      return;
    }

    if (!networkConfig.apiKey) {
      setAlert("API key not configured. Please set REACT_APP_BSCSCAN_API_KEY in your environment variables.");
      return;
    }

    setVerifying(true);
    setAlert("");
    try {
      const tokenData = {
        name: form.name,
        symbol: form.symbol,
        decimals: parseInt(form.decimals),
        initialSupply: ethers.parseUnits(form.initialSupply, parseInt(form.decimals)),
        owner: form.owner,
        isMintable: form.isMintable,
        isBurnable: form.isBurnable
      };

      const result = await verifyContract(form.tokenAddress, tokenData, networkConfig);
      
      if (result.status === "1") {
        setVerificationGuid(result.result);
        setAlert("Verification submitted successfully! Checking status...");
        
        // Check verification status after a delay
        setTimeout(() => checkStatus(result.result), 5000);
      } else {
        setAlert("Verification failed: " + result.result);
      }
    } catch (err) {
      setAlert("Error: " + (err.message || err));
    }
    setVerifying(false);
  };

  const checkStatus = async (guid) => {
    try {
      const result = await checkVerificationStatus(guid, networkConfig);
      setVerificationStatus(result.result);
      
      if (result.result === "Pass - Verified") {
        setAlert("✅ Contract verified successfully!");
      } else if (result.result === "Pending in queue") {
        setAlert("⏳ Verification pending... Please wait.");
        setTimeout(() => checkStatus(guid), 10000);
      } else {
        setAlert("❌ Verification failed: " + result.result);
      }
    } catch (err) {
      setAlert("Error checking status: " + (err.message || err));
    }
  };

  const explorerUrl = networkConfig && form.tokenAddress ? 
    getExplorerUrl(form.tokenAddress, networkConfig) : null;

  return (
    <div className="card p-4">
      <h5 className="mb-3">🔍 Verify Token Contract</h5>
      
      {networkConfig && (
        <div className="alert alert-info mb-3">
          <strong>Network:</strong> {networkConfig.name}
        </div>
      )}

      <div className="mb-3">
        <label className="form-label">Token Contract Address</label>
        <div className="input-group">
          <input 
            className="form-control" 
            name="tokenAddress" 
            placeholder="0x..." 
            value={form.tokenAddress} 
            onChange={handleChange}
          />
          <button 
            className="btn btn-outline-primary" 
            type="button" 
            onClick={fetchTokenData}
            disabled={loading}
          >
            {loading ? "Loading..." : "Load Data"}
          </button>
        </div>
      </div>

      {form.name && (
        <div className="row">
          <div className="col-md-6 mb-2">
            <label className="form-label">Name</label>
            <input className="form-control" name="name" value={form.name} onChange={handleChange} />
          </div>
          <div className="col-md-6 mb-2">
            <label className="form-label">Symbol</label>
            <input className="form-control" name="symbol" value={form.symbol} onChange={handleChange} />
          </div>
          <div className="col-md-6 mb-2">
            <label className="form-label">Decimals</label>
            <input className="form-control" name="decimals" value={form.decimals} onChange={handleChange} />
          </div>
          <div className="col-md-6 mb-2">
            <label className="form-label">Initial Supply</label>
            <input className="form-control" name="initialSupply" value={form.initialSupply} onChange={handleChange} />
          </div>
          <div className="col-12 mb-2">
            <label className="form-label">Owner</label>
            <input className="form-control" name="owner" value={form.owner} onChange={handleChange} />
          </div>
          <div className="col-md-6 mb-2">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" name="isMintable" checked={form.isMintable} onChange={handleChange} />
              <label className="form-check-label">Mintable</label>
            </div>
          </div>
          <div className="col-md-6 mb-2">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" name="isBurnable" checked={form.isBurnable} onChange={handleChange} />
              <label className="form-check-label">Burnable</label>
            </div>
          </div>
        </div>
      )}

      <div className="d-flex gap-2 mt-3">
        <button 
          className="btn btn-success" 
          onClick={handleVerify}
          disabled={verifying || !form.tokenAddress || !form.name}
        >
          {verifying ? "Verifying..." : "Verify Contract"}
        </button>
        
        {explorerUrl && (
          <a href={explorerUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline-info">
            View on Explorer
          </a>
        )}
      </div>

      {alert && (
        <div className={`alert mt-3 ${alert.startsWith("Error") || alert.startsWith("❌") ? "alert-danger" : "alert-success"}`}>
          {alert}
        </div>
      )}

      {verificationStatus && (
        <div className="mt-3 p-3 border rounded bg-light">
          <h6>Verification Status:</h6>
          <p className="mb-0">{verificationStatus}</p>
        </div>
      )}
    </div>
  );
}

export default VerifyToken;
