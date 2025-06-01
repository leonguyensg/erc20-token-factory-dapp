import React, { useState } from "react";
import ConnectWallet from "./components/ConnectWallet";
import Navigation from "./components/Navigation";
import CreateTokenForm from "./components/CreateTokenForm";
import VerifyToken from "./components/VerifyToken";
import TransferToken from "./components/TransferToken";
import MintToken from "./components/MintToken";
import BurnToken from "./components/BurnToken";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [account, setAccount] = useState("");
  const [activeTab, setActiveTab] = useState("create");

  const renderActiveComponent = () => {
    switch (activeTab) {
      case "create":
        return <CreateTokenForm />;
      case "verify":
        return <VerifyToken />;
      case "transfer":
        return <TransferToken />;
      case "mint":
        return <MintToken />;
      case "burn":
        return <BurnToken />;
      default:
        return <CreateTokenForm />;
    }
  };

  return (
    <div className="container py-4">
      <div className="text-center mb-4">
        <h1 className="display-4 mb-2">🏭 ERC20 Token Factory</h1>
        <p className="lead text-muted">Create, verify, and manage your ERC20 tokens</p>
      </div>
      
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          <ConnectWallet onConnect={setAccount} />
          
          <Navigation 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            account={account} 
          />
          
          {account ? (
            renderActiveComponent()
          ) : (
            <div className="card p-4 text-center">
              <h5>Welcome to ERC20 Token Factory</h5>
              <p className="text-muted mb-3">
                Connect your wallet to start creating and managing ERC20 tokens
              </p>
              <div className="row text-start">
                <div className="col-md-6 mb-3">
                  <h6>🔨 Create New Token</h6>
                  <p className="small text-muted">Deploy custom ERC20 tokens with mintable/burnable options</p>
                </div>
                <div className="col-md-6 mb-3">
                  <h6>✅ Verify Token</h6>
                  <p className="small text-muted">Verify your token contracts on blockchain explorers</p>
                </div>
                <div className="col-md-6 mb-3">
                  <h6>💸 Transfer</h6>
                  <p className="small text-muted">Send tokens to other addresses</p>
                </div>
                <div className="col-md-6 mb-3">
                  <h6>⚡ Mint & 🔥 Burn</h6>
                  <p className="small text-muted">Mint new tokens or burn existing ones (owner only)</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <footer className="text-center mt-5 py-3 border-top">
        <small className="text-muted">
          ERC20 Token Factory - Built with React & ethers.js
        </small>
      </footer>
    </div>
  );
}

export default App;
