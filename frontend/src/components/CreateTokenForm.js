import React, { useState, useEffect } from "react";
import { getSigner, parseAmount } from "../utils/ethersUtils";
import { ethers } from "ethers";
import factoryArtifact from "../abi/Erc20TokenFactory.json";
import { 
  getNetworkConfig, 
  getExplorerUrl, 
  verifyContract,
  checkVerificationStatus
} from "../utils/contractVerification";
import { factoryAddress, validateConfig } from "../utils/config";

function CreateTokenForm({ onTokenCreated }) {
  const [form, setForm] = useState({
    name: "Demo Token",
    symbol: "DMT",
    decimals: 18,
    initialSupply: "1000",
    isMintable: true,
    isBurnable: true
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState("");
  const [createdTokenAddress, setCreatedTokenAddress] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [networkConfig, setNetworkConfig] = useState(null);
  const [tokenData, setTokenData] = useState(null);
  const [configError, setConfigError] = useState("");

  useEffect(() => {
    // Validate configuration
    const errors = validateConfig();
    if (errors.length > 0) {
      setConfigError(errors.join(". "));
    } else {
      setConfigError("");
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert("");
    setCreatedTokenAddress("");
    setVerificationStatus("");
    
    // Check configuration before proceeding
    if (configError) {
      setAlert("Cannot create token: " + configError);
      return;
    }
    
    setLoading(true);
    
    try {
      // Load network config
      const config = await getNetworkConfig();
      setNetworkConfig(config);
      
      const signer = await getSigner();
      const factory = new ethers.Contract(factoryAddress, factoryArtifact.abi, signer);
      const decimals = Number(form.decimals);
      const initialSupply = parseAmount(form.initialSupply, decimals);
      const ownerAddress = await signer.getAddress();
      
      // Store token data for verification
      const tokenDataForVerification = {
        name: form.name,
        symbol: form.symbol,
        decimals,
        initialSupply,
        owner: ownerAddress,
        isMintable: form.isMintable,
        isBurnable: form.isBurnable
      };
      setTokenData(tokenDataForVerification);
      
      const tx = await factory.createToken(
        ownerAddress,
        form.name,
        form.symbol,
        decimals,
        initialSupply,
        form.isMintable,
        form.isBurnable
      );
      const receipt = await tx.wait();
      
      // Get the token address from the event logs
      const tokenCreatedEvent = receipt.logs.find(log => 
        log.topics[0] === ethers.id("TokenCreated(address,address,string,string,uint8,uint256)")
      );
      
      if (tokenCreatedEvent) {
        const tokenAddress = ethers.getAddress("0x" + tokenCreatedEvent.topics[1].slice(26));
        setCreatedTokenAddress(tokenAddress);
        setAlert(`✅ Token created successfully! Address: ${tokenAddress}`);
      } else {
        setAlert("✅ Token created successfully!");
      }
      
      if (onTokenCreated) onTokenCreated();
    } catch (err) {
      setAlert("Error: " + (err.message || err));
    }
    setLoading(false);
  };

  const handleVerifyContract = async () => {
    if (!createdTokenAddress || !tokenData || !networkConfig) return;
    
    if (!networkConfig.apiKey) {
      setAlert("API key not configured. Please set REACT_APP_BSCSCAN_API_KEY in your environment variables.");
      return;
    }
    
    setIsVerifying(true);
    setVerificationStatus("Starting verification...");
    
    try {
      const result = await verifyContract(createdTokenAddress, tokenData, networkConfig);
      
      if (result.status === "1") {
        setVerificationStatus("Verification submitted! Checking status...");
        
        // Check verification status after a delay
        setTimeout(() => checkVerificationStatusLocal(result.result), 5000);
      } else {
        setVerificationStatus("Verification failed: " + result.result);
      }
    } catch (err) {
      setVerificationStatus("Verification error: " + (err.message || err));
    }
    setIsVerifying(false);
  };

  const checkVerificationStatusLocal = async (guid) => {
    try {
      const result = await checkVerificationStatus(guid, networkConfig);
      
      if (result.result === "Pass - Verified") {
        setVerificationStatus("✅ Contract verified successfully!");
      } else if (result.result === "Pending in queue") {
        setVerificationStatus("⏳ Verification pending...");
        setTimeout(() => checkVerificationStatusLocal(guid), 10000);
      } else {
        setVerificationStatus("❌ Verification failed: " + result.result);
      }
    } catch (err) {
      setVerificationStatus("Error checking status: " + (err.message || err));
    }
  };

  const explorerUrl = networkConfig && createdTokenAddress ? 
    getExplorerUrl(createdTokenAddress, networkConfig) : null;

  return (
    <div className="card p-4">
      <h5 className="mb-3">🔨 Create ERC20 Token</h5>
      
      {configError && (
        <div className="alert alert-danger mb-3">
          <strong>Configuration Error:</strong> {configError}
        </div>
      )}
      
      {networkConfig && (
        <div className="alert alert-info mb-3">
          <strong>Network:</strong> {networkConfig.name}<br/>
          <strong>Factory:</strong> <code>{factoryAddress}</code>
        </div>
      )}
      
      {!networkConfig && !configError && (
        <div className="alert alert-secondary mb-3">
          <strong>Factory Address:</strong> <code>{factoryAddress}</code>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Token Name</label>
            <input className="form-control" name="name" placeholder="My Token" value={form.name} onChange={handleChange} required />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Symbol</label>
            <input className="form-control" name="symbol" placeholder="MTK" value={form.symbol} onChange={handleChange} required />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Decimals</label>
            <input className="form-control" name="decimals" type="number" min="0" max="18" placeholder="18" value={form.decimals} onChange={handleChange} required />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Initial Supply</label>
            <input className="form-control" name="initialSupply" type="number" min="0" step="any" placeholder="1000000" value={form.initialSupply} onChange={handleChange} required />
          </div>
        </div>
        
        <div className="row mb-3">
          <div className="col-md-6">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" name="isMintable" checked={form.isMintable} onChange={handleChange} id="mintableCheck" />
              <label className="form-check-label" htmlFor="mintableCheck">
                <strong>Mintable</strong> - Allow creating new tokens
              </label>
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" name="isBurnable" checked={form.isBurnable} onChange={handleChange} id="burnableCheck" />
              <label className="form-check-label" htmlFor="burnableCheck">
                <strong>Burnable</strong> - Allow destroying tokens
              </label>
            </div>
          </div>
        </div>
        
        <button className="btn btn-success btn-lg w-100" type="submit" disabled={loading || configError}>
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Creating Token...
            </>
          ) : configError ? (
            "⚠️ Configuration Required"
          ) : (
            "🚀 Create Token & Verify Token"
          )}
        </button>
      </form>
      
      {alert && (
        <div className={`alert mt-3 ${alert.startsWith("Error") ? "alert-danger" : "alert-success"}`}>
          {alert}
        </div>
      )}
      
      {createdTokenAddress && tokenData && (
        <div className="mt-4 p-4 border rounded bg-light">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h5 className="mb-0 text-success">🎉 Token Created Successfully!</h5>
            {explorerUrl && (
              <a 
                href={explorerUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-success btn-sm"
              >
                🔍 View on {networkConfig?.name || 'Explorer'}
              </a>
            )}
          </div>
          
          {/* Token Details Card */}
          <div className="row">
            <div className="col-md-8">
              <div className="card border-0 bg-white shadow-sm">
                <div className="card-header bg-primary text-white">
                  <h6 className="mb-0">📄 Contract Details</h6>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-sm-6">
                      <label className="form-label text-muted small fw-bold">Token Name</label>
                      <div className="fw-bold">{tokenData.name}</div>
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label text-muted small fw-bold">Symbol</label>
                      <div className="fw-bold">{tokenData.symbol}</div>
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label text-muted small fw-bold">Decimals</label>
                      <div>{tokenData.decimals}</div>
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label text-muted small fw-bold">Initial Supply</label>
                      <div>{(Number(tokenData.initialSupply) / Math.pow(10, tokenData.decimals)).toLocaleString()} {tokenData.symbol}</div>
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label text-muted small fw-bold">Owner</label>
                      <div className="text-break">
                        <code className="small">{tokenData.owner}</code>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label text-muted small fw-bold">Features</label>
                      <div>
                        {tokenData.isMintable && <span className="badge bg-success me-1">🔨 Mintable</span>}
                        {tokenData.isBurnable && <span className="badge bg-warning">🔥 Burnable</span>}
                        {!tokenData.isMintable && !tokenData.isBurnable && <span className="badge bg-secondary">Standard</span>}
                      </div>
                    </div>
                    <div className="col-12">
                      <label className="form-label text-muted small fw-bold">Contract Address</label>
                      <div className="input-group">
                        <input 
                          type="text" 
                          className="form-control font-monospace small" 
                          value={createdTokenAddress} 
                          readOnly 
                        />
                        <button 
                          type="button" 
                          className="btn btn-outline-primary"
                          onClick={() => {
                            navigator.clipboard.writeText(createdTokenAddress);
                            setAlert("📋 Address copied to clipboard!");
                            setTimeout(() => setAlert(""), 2000);
                          }}
                          title="Copy address"
                        >
                          📋
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="card border-0 bg-white shadow-sm">
                <div className="card-header bg-info text-white">
                  <h6 className="mb-0">🛠️ Actions</h6>
                </div>
                <div className="card-body">
                  <div className="d-grid gap-2">
                    {explorerUrl && (
                      <a 
                        href={explorerUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="btn btn-outline-info btn-sm"
                      >
                        🔗 Open in Explorer
                      </a>
                    )}
                    
                    {networkConfig && networkConfig.apiKey && (
                      <button 
                        className="btn btn-outline-success btn-sm" 
                        onClick={handleVerifyContract}
                        disabled={isVerifying}
                      >
                        {isVerifying ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                            Verifying...
                          </>
                        ) : (
                          "✅ Verify Contract"
                        )}
                      </button>
                    )}
                    
                    <button 
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => {
                        const tokenInfo = `Token: ${tokenData.name} (${tokenData.symbol})\nAddress: ${createdTokenAddress}\nSupply: ${(Number(tokenData.initialSupply) / Math.pow(10, tokenData.decimals)).toLocaleString()}\nNetwork: ${networkConfig?.name || 'Unknown'}\nExplorer: ${explorerUrl || 'N/A'}`;
                        navigator.clipboard.writeText(tokenInfo);
                        setAlert("📋 Token details copied to clipboard!");
                        setTimeout(() => setAlert(""), 2000);
                      }}
                    >
                      📋 Copy Details
                    </button>
                  </div>
                  
                  {verificationStatus && (
                    <div className="mt-3 p-2 border rounded bg-light">
                      <h6 className="small mb-1 text-muted">Verification Status:</h6>
                      <p className="mb-0 small">{verificationStatus}</p>
                    </div>
                  )}
                  
                  {!networkConfig?.apiKey && (
                    <div className="mt-3 alert alert-warning alert-sm p-2">
                      <small>
                        💡 Set <code>REACT_APP_BSCSCAN_API_KEY</code> to enable verification
                      </small>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Network Info */}
          <div className="mt-3 p-3 bg-white border rounded">
            <div className="row align-items-center">
              <div className="col-auto">
                <span className="badge bg-secondary">🌐 Network</span>
              </div>
              <div className="col">
                <strong>{networkConfig?.name || 'Unknown Network'}</strong>
                {networkConfig?.chainId && <span className="text-muted ms-2">(Chain ID: {networkConfig.chainId})</span>}
              </div>
              <div className="col-auto">
                <small className="text-muted">Factory: <code className="small">{factoryAddress}</code></small>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateTokenForm;
