import React, { useState } from "react";
import { getSigner, parseAmount } from "../utils/ethersUtils";
import { ethers } from "ethers";
import erc20Artifact from "../abi/ERC20Custom.json";

// import "bootstrap/dist/css/bootstrap.min.css";

function TokenActions() {
  const [form, setForm] = useState({
    tokenAddress: "",
    recipient: "",
    amount: "",
    action: "transfer"
  });
  const [decimals, setDecimals] = useState(18);
  const [isMintable, setIsMintable] = useState(true);
  const [isBurnable, setIsBurnable] = useState(true);
  const [alert, setAlert] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const fetchTokenInfo = async (address) => {
    try {
      const signer = await getSigner();
      const token = new ethers.Contract(address, erc20Artifact.abi, signer);
      setDecimals(Number(await token.decimals()));
      setIsMintable(await token.isMintable());
      setIsBurnable(await token.isBurnable());
    } catch {
      setDecimals(18);
      setIsMintable(true);
      setIsBurnable(true);
    }
  };

  const handleTokenAddressBlur = (e) => {
    const address = e.target.value;
    if (address && address.length === 42) fetchTokenInfo(address);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert("");
    setLoading(true);
    try {
      const signer = await getSigner();
      const token = new ethers.Contract(form.tokenAddress, erc20Artifact.abi, signer);
      const amount = parseAmount(form.amount, decimals);
      let tx;
      if (form.action === "transfer") {
        tx = await token.transfer(form.recipient, amount);
      } else if (form.action === "mint") {
        if (!isMintable) throw new Error("Token is not mintable");
        tx = await token.mint(form.recipient, amount);
      } else if (form.action === "burn") {
        if (!isBurnable) throw new Error("Token is not burnable");
        tx = await token.burn(form.recipient, amount);
      }
      await tx.wait();
      setAlert("Action successful!");
    } catch (err) {
      setAlert("Error: " + (err.message || err));
    }
    setLoading(false);
  };

  return (
    <form className="card p-4 mb-3" onSubmit={handleSubmit}>
      <h5 className="mb-3">Token Actions</h5>
      <div className="mb-2">
        <input className="form-control" name="tokenAddress" placeholder="Token Address" value={form.tokenAddress} onChange={handleChange} onBlur={handleTokenAddressBlur} required />
      </div>
      <div className="mb-2">
        <input className="form-control" name="recipient" placeholder="Recipient Address" value={form.recipient} onChange={handleChange} required />
      </div>
      <div className="mb-2">
        <input className="form-control" name="amount" type="number" min="0" placeholder="Amount" value={form.amount} onChange={handleChange} required />
      </div>
      <div className="mb-2">
        <select className="form-select" name="action" value={form.action} onChange={handleChange}>
          <option value="transfer">Transfer</option>
          <option value="mint">Mint</option>
          <option value="burn">Burn</option>
        </select>
      </div>
      <button className="btn btn-primary" type="submit" disabled={loading}>
        {loading ? "Processing..." : "Submit"}
      </button>
      {alert && <div className={`alert mt-3 ${alert.startsWith("Error") ? "alert-danger" : "alert-success"}`}>{alert}</div>}
    </form>
  );
}

export default TokenActions;
