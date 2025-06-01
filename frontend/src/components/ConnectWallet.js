import React, { useState } from "react";
import { getAccount } from "../utils/ethersUtils";

function ConnectWallet({ onConnect }) {
  const [account, setAccount] = useState("");
  const [error, setError] = useState("");

  const connect = async () => {
    setError("");
    try {
      const acc = await getAccount();
      setAccount(acc);
      if (onConnect) onConnect(acc);
    } catch (e) {
      setError(e.message);
    }
  };

  const disconnect = () => {
    setAccount("");
    if (onConnect) onConnect("");
  };

  return (
    <div className="mb-3">
      {account ? (
        <>
          <span className="me-2">Connected: {account.slice(0, 6)}...{account.slice(-4)}</span>
          <button className="btn btn-outline-danger btn-sm" onClick={disconnect}>Disconnect</button>
        </>
      ) : (
        <button className="btn btn-primary" onClick={connect}>Connect Wallet</button>
      )}
      {error && <div className="text-danger mt-2">{error}</div>}
    </div>
  );
}

export default ConnectWallet;
