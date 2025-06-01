import React, { useState } from "react";
import { getSigner, parseAmount } from "../utils/ethersUtils";
import { ethers } from "ethers";
import erc20Artifact from "../abi/ERC20Custom.json";

function BurnToken() {
  const [form, setForm] = useState({
    tokenAddress: "",
    fromAddress: "",
    amount: ""
  });
  const [decimals, setDecimals] = useState(18);
  const [isBurnable, setIsBurnable] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [balance, setBalance] = useState("");
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
      
      const [tokenDecimals, burnable, owner] = await Promise.all([
        token.decimals(),
        token.isBurnable(),
        token.owner()
      ]);
      
      setDecimals(Number(tokenDecimals));
      setIsBurnable(burnable);
      setIsOwner(owner.toLowerCase() === userAddress.toLowerCase());
      
      // Set default fromAddress to user's address
      if (!form.fromAddress) {
        setForm(prev => ({ ...prev, fromAddress: userAddress }));
      }
    } catch {
      setDecimals(18);
      setIsBurnable(true);
      setIsOwner(false);
    }
  };

  const fetchBalance = async () => {
    if (form.tokenAddress && form.fromAddress) {
      try {
        const signer = await getSigner();
        const token = new ethers.Contract(form.tokenAddress, erc20Artifact.abi, signer);
        const bal = await token.balanceOf(form.fromAddress);
        setBalance(ethers.formatUnits(bal, decimals));
      } catch {
        setBalance("");
      }
    }
  };

  const handleTokenAddressBlur = (e) => {
    const address = e.target.value;
    if (address && address.length === 42) {
      fetchTokenInfo(address);
    }
  };

  const handleFromAddressBlur = () => {
    fetchBalance();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert("");
    
    if (!isBurnable) {
      setAlert("Error: This token is not burnable");
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
      
      const tx = await token.burn(form.fromAddress, amount);
      await tx.wait();
      
      setAlert("✅ Burn successful!");
      
      // Refresh balance
      await fetchBalance();
    } catch (err) {
      setAlert("Error: " + (err.message || err));
    }
    setLoading(false);
  };

  return (
    <div className="card p-4">
      <h5 className="mb-3">🔥 Burn Tokens</h5>
      
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
              <small className={`badge ${isBurnable ? 'bg-success' : 'bg-danger'} me-2`}>
                {isBurnable ? 'Burnable' : 'Not Burnable'}
              </small>
              <small className={`badge ${isOwner ? 'bg-success' : 'bg-warning'}`}>
                {isOwner ? 'You are Owner' : 'Not Owner'}
              </small>
            </div>
          )}
        </div>
        
        <div className="mb-3">
          <label className="form-label">From Address (Address to burn from)</label>
          <input 
            className="form-control" 
            name="fromAddress" 
            placeholder="0x..." 
            value={form.fromAddress} 
            onChange={handleChange}
            onBlur={handleFromAddressBlur}
            required 
          />
          {balance && (
            <small className="text-muted">Balance: {balance} tokens</small>
          )}
        </div>
        
        <div className="mb-3">
          <label className="form-label">Amount to Burn</label>
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
          className="btn btn-danger" 
          type="submit" 
          disabled={loading || !isBurnable || !isOwner}
        >
          {loading ? "Burning..." : "Burn Tokens"}
        </button>
        
        {!isBurnable && (
          <div className="alert alert-warning mt-3">
            ⚠️ This token is not burnable
          </div>
        )}
        
        {!isOwner && form.tokenAddress && (
          <div className="alert alert-warning mt-3">
            ⚠️ You must be the token owner to burn tokens
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

export default BurnToken;
