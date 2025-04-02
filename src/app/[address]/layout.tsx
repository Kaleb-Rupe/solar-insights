import { Metadata } from "next";

// Type definition for layout props
interface AddressLayoutProps {
  children: React.ReactNode;
  params: {
    address: string;
  };
}

// Generate metadata for the page (this is an async function)
export async function generateMetadata({
  params,
}: AddressLayoutProps): Promise<Metadata> {
  // Properly await the address from params
  const address = params.address;

  return {
    title: `${address.slice(0, 4)}...${address.slice(-4)} - Solar Insights`,
    description: `View trading analytics for Solana wallet ${address}`,
  };
}

// Layout component is now async
export default async function AddressLayout({
  children,
  params,
}: AddressLayoutProps) {
  // Properly await the address from params
  const address = params.address;

  return (
    <>
      {/* Client component that accepts address as a prop */}
      <TraderDataProviderWrapper address={address}>
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </TraderDataProviderWrapper>
    </>
  );
}


import { TraderDataProvider as OriginalTraderDataProvider } from "./providers/TraderDataProvider";

function TraderDataProviderWrapper({
  children,
  address,
}: {
  children: React.ReactNode;
  address: string;
}) {
  return (
    <OriginalTraderDataProvider address={address}>
      {children}
    </OriginalTraderDataProvider>
  );
}
