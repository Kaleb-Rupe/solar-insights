import { redirect } from "next/navigation";
import { isValidSolanaAddress } from "@/lib/utils/validation";
import DashboardPage from "./dashboard/page";

// Type definition for page props
interface AddressPageProps {
  params: {
    address: string;
  };
}

// Page component is now async
export default async function AddressPage({ params }: AddressPageProps) {
  // Properly await the address from params
  const address = params.address;

  // Validate the address format
  if (!isValidSolanaAddress(address)) {
    // If invalid, redirect to home page
    redirect("/");
  }

  // Forward to the dashboard page with the address
  return <DashboardPage address={address} />;
}
