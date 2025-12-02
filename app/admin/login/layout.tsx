import { Metadata } from "next";
export async function generateMetadata(): Promise<Metadata> {
  return {
    openGraph: {
      images: ["/favicon.png"],
    },
    description: "Beckman - Admin Dashboard",
    title: "Beckman - Admin Dashboard",
    keywords: "Beckman, admin, dashboard",
  };
}
function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export default Layout;
