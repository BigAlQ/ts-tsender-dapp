import { ConnectButton } from "@rainbow-me/rainbowkit";
import { FaGithub } from "react-icons/fa";
import Image from "next/image";

export default function Header() {
  return (
    <header className="flex items-center justify-between p-4 border-b border-gray-200 bg-amber-900">
      {/* Left side - Title */}
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold text-gray-900">Tsender</h1>
      </div>

      {/* Right side - GitHub link and Connect button */}
      <div className="flex items-center space-x-4">
        {/* GitHub link */}
        <a
          href="https://github.com/BigAlQ/tsender"
          target="_blank" // Opens a new tab
          rel="noopener noreferrer" // prevents tracking and improves security
          className="flex items-center space-x-2 text-black-600 hover:text-gray-900 transition-colors" // Changes color when we hover over it
        >
          <FaGithub size={24} />
          <span className="hidden sm:inline">GitHub</span>
        </a>

        {/* Connect button */}
        <ConnectButton />
      </div>
    </header>
  );
}
