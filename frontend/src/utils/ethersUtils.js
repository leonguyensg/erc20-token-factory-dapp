import { ethers } from "ethers";

export async function getProvider() {
  if (!window.ethereum) throw new Error("MetaMask not found");
  return new ethers.BrowserProvider(window.ethereum);
}

export async function getSigner() {
  const provider = await getProvider();
  return await provider.getSigner();
}

export async function getAccount() {
  const provider = await getProvider();
  const accounts = await provider.send("eth_requestAccounts", []);
  return accounts[0];
}

export function parseAmount(amount, decimals) {
  return ethers.parseUnits(amount, decimals);
}

export function formatAmount(amount, decimals) {
  return ethers.formatUnits(amount, decimals);
}
