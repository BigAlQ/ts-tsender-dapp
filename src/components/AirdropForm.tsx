"use client";

import { InputForm } from "@/components/ui/InputField";
import { TransactionButton } from "@/components/ui/TransactionButton";
import { useState, useMemo, useEffect } from "react";
import { chainsToTSender, tsenderAbi, erc20Abi } from "@/constants";
import {
  useChainId,
  useConfig,
  useAccount,
  useWriteContract,
  useReadContract,
  useWaitForTransactionReceipt,
} from "wagmi";

// readContract (Imperative Function)
// Manual execution: You call it explicitly when needed
// Returns Promise: Returns Promise<data>
// Used anywhere: Can be used in functions, event handlers, etc.
// One-time call: Only runs when you explicitly call it

import { readContract, waitForTransactionReceipt } from "@wagmi/core";

// useReadContract (React Hook)
// Automatic & Reactive: Automatically runs when component mounts or dependencies change
// Returns reactive data: Returns { data, error, isLoading, isSuccess, etc. }
// Used in components: Designed for React components
// Auto-refreshing: Can automatically refetch when args change

import { calculateTotal } from "@/utils";

export default function AirdropForm() {
  /*//////////////////////////////////////////////////////////////
                                 HOOKS
    //////////////////////////////////////////////////////////////*/
  //     Current value + function to update it
  const [tokenAddress, setTokenAddress] = useState(""); // useState returns an array [currentValue, setterFunction]
  const [recipients, setRecipients] = useState("");
  const [amounts, setAmounts] = useState("");
  const [currentTxHash, setCurrentTxHash] = useState<
    `0x${string}` | undefined
  >(); // ✅ ADD this state
  const [isAirdropApproved, setIsAirdropApproved] = useState(false); // ✅ ADD to track approval status

  const chainId = useChainId(); // Automitcally updates when changed
  const config = useConfig();
  const account = useAccount(); // This part here is the dependencies.
  // This line means, whenever amounts changes, call the function calculateTotal(amounts) and set total to the result.
  const total: number = useMemo(() => calculateTotal(amounts), [amounts]);

  const totalWei = BigInt(total);
  const totalTokens = total === 0 ? "0" : (total / 1e18).toFixed(6);

  const { data: hash, isPending, writeContractAsync } = useWriteContract();

  // ✅ ADD: Listen to blockchain confirmation for the current transaction
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    isError: transactionFailed,
    data: receipt,
  } = useWaitForTransactionReceipt({
    hash: currentTxHash,
  });

  // ✅ ADD: Track the current transaction hash
  useEffect(() => {
    if (hash) {
      setCurrentTxHash(hash);
      console.log("Transaction hash received:", hash);
    }
  }, [hash]);

  // ✅ ADD: Reset transaction state when form inputs change
  useEffect(() => {
    setCurrentTxHash(undefined);
    setIsAirdropApproved(false);
  }, [tokenAddress, recipients, amounts]);

  // ✅ ADD: Log transaction status changes
  useEffect(() => {
    if (isConfirming) {
      console.log("⏳ Transaction confirming on blockchain...");
    }
    if (isConfirmed) {
      console.log("✅ Transaction confirmed! Block:", receipt?.blockNumber);
      setIsAirdropApproved(true);
    }
    if (transactionFailed) {
      console.log("❌ Transaction failed");
    }
  }, [isConfirming, isConfirmed, transactionFailed, receipt]);

  // Get token name using useReadContract
  const { data: tokenName } = useReadContract({
    abi: erc20Abi,
    address: tokenAddress as `0x${string}`,
    functionName: "name",
    query: {
      enabled: !!tokenAddress, // Only run if tokenAddress is not empty
    },
  });

  // Optional: You can also get token symbol if needed
  const { data: tokenSymbol } = useReadContract({
    abi: erc20Abi,
    address: tokenAddress as `0x${string}`,
    functionName: "symbol",
    query: {
      enabled: !!tokenAddress,
    },
  });

  //
  async function getApprovedAmount(
    tSenderAddress: string | null
  ): Promise<number> {
    if (!tSenderAddress) {
      alert("No address found for TSender contract on this chain.");
      return 0;
    }
    // read from the chain if we have approved enough tokens

    // We are doing this solidity call:
    // token.allowance(account,tsender)
    // except we are doing it on the front end in react.
    const response = await readContract(config, {
      abi: erc20Abi,
      address: tokenAddress as `0x${string}`,
      functionName: "allowance",
      args: [account.address, tSenderAddress as `0x${string}`],
    });

    return response as number;
  }

  async function handleSubmit() {
    // 1a. If already approved, move to step 2.
    // 1b. Approve our TSender contract to send our tokens.
    // 2. Call the airdrop function on our TSender contract.
    // 3. Wait for the transaction to be mined.

    const tSenderAddress = chainsToTSender[chainId]["tsender"];
    const approvedAmount = await getApprovedAmount(tSenderAddress);

    console.log("Token Address:", tokenAddress);
    console.log("Recipients:", recipients);
    console.log("Amounts:", amounts);
    console.log("Approved Amount:", approvedAmount);

    if (total > approvedAmount) {
      const approvalHash = await writeContractAsync({
        abi: erc20Abi,
        address: tokenAddress as `0x${string}`,
        functionName: "approve",
        args: [
          tSenderAddress as `0x${string}`,
          BigInt(total), // approve the total amount needed
        ],
      });
      const approvalReceipt = await waitForTransactionReceipt(config, {
        hash: approvalHash,
      });
      console.log("Approval transaction mined:", approvalReceipt);

      await writeContractAsync({
        abi: tsenderAbi,
        address: tSenderAddress as `0x${string}`,
        functionName: "airdropERC20",
        args: [
          tokenAddress,
          // Comma or new line separated
          recipients
            .split(/[,\n]+/)
            .map((addr) => addr.trim())
            .filter((addr) => addr !== ""),
          amounts
            .split(/[,\n]+/)
            .map((amt) => amt.trim())
            .filter((amt) => amt !== ""),
          BigInt(total),
        ],
      });
    } else {
      await writeContractAsync({
        abi: tsenderAbi,
        address: tSenderAddress as `0x${string}`,
        functionName: "airdropERC20",
        args: [
          tokenAddress,
          // Comma or new line separated
          recipients
            .split(/[,\n]+/)
            .map((addr) => addr.trim())
            .filter((addr) => addr !== ""),
          amounts
            .split(/[,\n]+/)
            .map((amt) => amt.trim())
            .filter((amt) => amt !== ""),
          BigInt(total),
        ],
      });
    }
  }

  return (
    <div>
      <InputForm
        label="Token Address"
        placeholder="0x"
        value={tokenAddress}
        onChange={(e) => setTokenAddress(e.target.value)}
      />
      <InputForm
        label="Recipients"
        placeholder="0x12314, 0x1234567, ..."
        value={recipients}
        onChange={(e) => setRecipients(e.target.value)}
        large={true}
      />
      <InputForm
        label="Amounts"
        placeholder="100, 200, ..."
        value={amounts}
        onChange={(e) => setAmounts(e.target.value)} // When the input changes, this happens:
        // 1. Browser creates an event 'e'
        // 2. React calls your arrow function: (e) => setAmounts(e.target.value)
        // 3. setAmounts(e.target.value) updates the state
        // 4. Component re-renders with the new value
        large={true}
      />
      {/* Total Amounts Display */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Total Amounts
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-3 rounded border">
            <p className="text-sm text-gray-600 font-medium">Token</p>
            <p className="text-lg font-bold text-gray-900">
              {tokenName
                ? tokenName.toString()
                : tokenAddress
                ? "Loading..."
                : "Enter token address"}
            </p>
          </div>
          <div className="bg-white p-3 rounded border">
            <p className="text-sm text-gray-600 font-medium">Total (Wei)</p>
            <p className="text-lg font-bold text-gray-900">
              {BigInt(total).toString()}
            </p>
          </div>
          <div className="bg-white p-3 rounded border">
            <p className="text-sm text-gray-600 font-medium">Total (Tokens)</p>
            <p className="text-lg font-bold text-gray-900">
              {total === 0 ? "0" : (total / 1e18).toFixed(6)}
            </p>
          </div>
        </div>
      </div>
      <TransactionButton
        onClick={handleSubmit}
        isPending={isPending}
        transactionHash={hash} // Pass the transaction hash when available
        disabled={!tokenAddress || !recipients || !amounts}
      >
        Send Tokens
      </TransactionButton>
    </div>
  );
}
