// components/ui/TransactionButton.tsx
import { useEffect, useRef, useState } from "react";
import { useWaitForTransactionReceipt } from "wagmi"; // Add this import

interface TransactionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isPending: boolean;
  transactionHash?: `0x${string}`; // Use the proper type for transaction hashes
  children: React.ReactNode;
  className?: string;
}

export function TransactionButton({
  onClick,
  disabled = false,
  isPending,
  transactionHash,
  children,
  className = "",
}: TransactionButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [lastScrollTime, setLastScrollTime] = useState(0);

  // ✅ ACTUAL BLOCKCHAIN LISTENING
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    isError: transactionFailed,
  } = useWaitForTransactionReceipt({
    hash: transactionHash,
    query: {
      enabled: !!transactionHash, // Only listen if we have a transaction hash
    },
  });

  // Continuous scrolling during entire transaction process
  useEffect(() => {
    const shouldScroll = isPending || isConfirming;

    if (shouldScroll && buttonRef.current) {
      const now = Date.now();

      // Scroll immediately when state changes
      if (now - lastScrollTime > 1500) {
        buttonRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
        setLastScrollTime(now);
      }

      // Set up maintenance scrolling
      const intervalId = setInterval(() => {
        if (buttonRef.current && shouldScroll) {
          buttonRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest",
          });
          setLastScrollTime(Date.now());
        }
      }, 2500);

      return () => clearInterval(intervalId);
    }
  }, [isPending, isConfirming, lastScrollTime]);

  // Scroll on user interaction
  useEffect(() => {
    if (isPending || isConfirming) {
      const handleScroll = () => {
        // If user scrolls away, scroll back to button after a delay
        setTimeout(() => {
          if (buttonRef.current && (isPending || isConfirming)) {
            buttonRef.current.scrollIntoView({
              behavior: "smooth",
              block: "center",
              inline: "nearest",
            });
          }
        }, 500);
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [isPending, isConfirming]);

  const baseClasses =
    "mx-auto flex items-center justify-center gap-2 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-full max-w-md px-8 py-4 text-lg";

  const getButtonText = () => {
    if (isPending && !transactionHash) {
      return "Waiting for Approval...";
    } else if (isConfirming) {
      return "Confirming Transaction...";
    } else if (isConfirmed) {
      return "Transaction Confirmed!";
    } else if (transactionFailed) {
      return "Transaction Failed";
    }
    return children;
  };

  const getButtonVariant = () => {
    if (isConfirmed) return "bg-green-600 hover:bg-green-700";
    if (transactionFailed) return "bg-red-600 hover:bg-red-700";
    return "bg-blue-600 hover:bg-blue-700";
  };

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      disabled={disabled || isPending || isConfirming}
      className={`${baseClasses} ${getButtonVariant()} text-white ${className}`}
    >
      {isPending || isConfirming ? (
        <>
          <LoadingSpinner />
          {getButtonText()}
        </>
      ) : isConfirmed ? (
        "✅ Transaction Confirmed!"
      ) : transactionFailed ? (
        "❌ Transaction Failed"
      ) : (
        children
      )}
    </button>
  );
}

function LoadingSpinner() {
  return (
    <svg
      className="animate-spin h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
}
