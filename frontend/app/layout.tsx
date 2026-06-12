import type { Metadata } from "next";
import { Sidebar } from "../components/ui/sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "RentFlow - Internal Property Management",
  description: "B2B Operation Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-background antialiased">
      <body className="flex h-full overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-y-auto bg-muted/40">
          <header className="flex h-16 items-center border-b bg-card px-4 md:px-8">
            <h2 className="text-sm font-semibold text-muted-foreground pl-10 md:pl-0">Internal Operations Portal</h2>
          </header>
          <div className="p-4 md:p-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}