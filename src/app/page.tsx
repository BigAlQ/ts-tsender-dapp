import { RainbowKitProvider, ConnectButton } from "@rainbow-me/rainbowkit";
// ConnectButton is a pre-built button component from RainbowKit that allows users to connect their cryptocurrency wallets to your application.
export default function Home() {
  return (
    <div>
      <ConnectButton />
    </div>
  );
}
