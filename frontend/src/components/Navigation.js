import React from "react";

function Navigation({ activeTab, setActiveTab, account }) {
  const menuItems = [
    { id: "create", label: "Create New Token", icon: "🔨" },
    { id: "verify", label: "Verify Token", icon: "✅" },
    { id: "transfer", label: "Transfer", icon: "💸" },
    { id: "mint", label: "Mint Token", icon: "⚡" },
    { id: "burn", label: "Burn Token", icon: "🔥" }
  ];

  if (!account) {
    return null;
  }

  return (
    <div className="card mb-4">
      <div className="card-body">
        <h5 className="card-title mb-3">Token Factory Menu</h5>
        <div className="row">
          {menuItems.map((item) => (
            <div key={item.id} className="col-md-2 col-sm-4 col-6 mb-2">
              <button
                className={`btn w-100 ${
                  activeTab === item.id ? "btn-primary" : "btn-outline-primary"
                }`}
                onClick={() => setActiveTab(item.id)}
              >
                <div className="d-flex flex-column align-items-center">
                  <span style={{ fontSize: "1.5rem" }}>{item.icon}</span>
                  <small className="mt-1">{item.label}</small>
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Navigation;
