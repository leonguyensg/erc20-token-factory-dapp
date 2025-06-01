import React, { useState } from "react";
import { getSigner, parseAmount } from "../utils/ethersUtils";
import { ethers } from "ethers";
import erc20Artifact from "../abi/ERC20Custom.json";

function MintToken() {
  const [form, setForm] = useState({
    tokenAddress: "",
    recipient: "",
    amount: ""
  });
  const [decimals, setDecimals] = useState(18);
  const [isMintable, setIsMintable] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const fetchTokenInfo = async (address) => {
    try {
      const signer = await getSigner();
      const token = new ethers.Contract(address, erc20Artifact.abi, signer);
      const userAddress = await signer.getAddress();
      
      const [tokenDecimals, mintable, owner] = await Promise.all([
        token.decimals(),
        token.isMintable(),
        token.owner()
      ]);
      
      setDecimals(Number(tokenDecimals));
      setIsMintable(mintable);
      setIsOwner(owner.toLowerCase() === userAddress.toLowerCase());
    } catch {
      setDecimals(18);
      setIsMintable(true);
      setIsOwner(false);
    }
  };

  const handleTokenAddressBlur = (e) => {
    const address = e.target.value;
    if (address && address.length === 42) {
      fetchTokenInfo(address);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert("");
    
    if (!isMintable) {
      setAlert("Error: This token is not mintable");
      return;
    }
    
    if (!isOwner) {
      setAlert("Error: You are not the owner of this token");
      return;
    }
    
    setLoading(true);
    try {
      const signer = await getSigner();
      const token = new ethers.Contract(form.tokenAddress, erc20Artifact.abi, signer);
      const amount = parseAmount(form.amount, decimals);
      
      const tx = await token.mint(form.recipient, amount);
      await tx.wait();
      
      setAlert("✅ Mint successful!");
    } catch (err) {
      setAlert("Error: " + (err.message || err));
    }
    setLoading(false);
  };

  return (
    <div className="card p-4">
      <h5 className="mb-3">⚡ Mint Tokens</h5>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Token Contract Address</label>
          <input 
            className="form-control" 
            name="tokenAddress" 
            placeholder="0x..." 
            value={form.tokenAddress} 
            onChange={handleChange} 
            onBlur={handleTokenAddressBlur}
            required 
          />
          {form.tokenAddress && (
            <div className="mt-2">
              <small className={`badge ${isMintable ? 'bg-success' : 'bg-danger'} me-2`}>
                {isMintable ? 'Mintable' : 'Not Mintable'}
              </small>
              <small className={`badge ${isOwner ? 'bg-success' : 'bg-warning'}`}>
                {isOwner ? 'You are Owner' : 'Not Owner'}
              </small>
            </div>
          )}
        </div>
        
        <div className="mb-3">
          <label className="form-label">Recipient Address</label>
          <input 
            className="form-control" 
            name="recipient" 
            placeholder="0x..." 
            value={form.recipient} 
            onChange={handleChange} 
            required 
          />
        </div>
        
        <div className="mb-3">
          <label className="form-label">Amount to Mint</label>
          <input 
            className="form-control" 
            name="amount" 
            type="number" 
            min="0" 
            step="any"
            placeholder="0.0" 
            value={form.amount} 
            onChange={handleChange} 
            required 
          />
          <small className="text-muted">Decimals: {decimals}</small>
        </div>
        
        <button 
          className="btn btn-success" 
          type="submit" 
          disabled={loading || !isMintable || !isOwner}
        >
          {loading ? "Minting..." : "Mint Tokens"}
        </button>
        
        {!isMintable && (
          <div className="alert alert-warning mt-3">
            ⚠️ This token is not mintable
          </div>
        )}
        
        {!isOwner && form.tokenAddress && (
          <div className="alert alert-warning mt-3">
            ⚠️ You must be the token owner to mint
          </div>
        )}
      </form>
      
      {alert && (
        <div className={`alert mt-3 ${alert.startsWith("Error") ? "alert-danger" : "alert-success"}`}>
          {alert}
        </div>
      )}
    </div>
  );
}

export default MintToken;
