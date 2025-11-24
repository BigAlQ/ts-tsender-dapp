import Header from "@/components/Header";
// Update the import path if the file is located elsewhere, for example:
import AirdropForm from "@/components/AirdropForm";
// or
// import AirdropForm from "../components/ui/AirdropForm";

// ConnectButton is a pre-built button component from RainbowKit that allows users to connect their cryptocurrency wallets to your application.
export default function Home() {
  return (
    <div>
      <AirdropForm />
    </div>
  );
}
