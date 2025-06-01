import React, { useState } from "react";
import { getSigner, parseAmount } from "../utils/ethersUtils";
import { ethers } from "ethers";
import erc20Artifact from "../abi/ERC20Custom.json";

function TransferToken() {
  const [form, setForm] = useState({
    tokenAddress: "",
    recipient: "",
    amount: ""
  });
  const [decimals, setDecimals] = useState(18);
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
      
      const [tokenDecimals, userBalance] = await Promise.all([
        token.decimals(),
        token.balanceOf(userAddress)
      ]);
      
      setDecimals(Number(tokenDecimals));
      setBalance(ethers.formatUnits(userBalance, tokenDecimals));
    } catch {
      setDecimals(18);
      setBalance("");
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
    setLoading(true);
    try {
      const signer = await getSigner();
      const token = new ethers.Contract(form.tokenAddress, erc20Artifact.abi, signer);
      const amount = parseAmount(form.amount, decimals);
      
      const tx = await token.transfer(form.recipient, amount);
      await tx.wait();
      
      setAlert("✅ Transfer successful!");
      
      // Refresh balance
      await fetchTokenInfo(form.tokenAddress);
    } catch (err) {
      setAlert("Error: " + (err.message || err));
    }
    setLoading(false);
  };

  return (
    <div className="card p-4">
      <h5 className="mb-3">💸 Transfer Tokens</h5>
      
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
          {balance && (
            <small className="text-muted">Your balance: {balance} tokens</small>
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
          <label className="form-label">Amount</label>
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
        
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Transferring..." : "Transfer"}
        </button>
      </form>
      
      {alert && (
        <div className={`alert mt-3 ${alert.startsWith("Error") ? "alert-danger" : "alert-success"}`}>
          {alert}
        </div>
      )}
    </div>
  );
}

export default TransferToken;
