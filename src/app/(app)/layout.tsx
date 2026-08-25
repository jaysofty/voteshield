
import { Sidebar } from "../components/layout/sidebar";
import { Topbar } from "../components/layout/topbar";


export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-muted/20">
      <Sidebar />

      <div className="min-h-screen lg:pl-64">
        <Topbar />

        <main className="min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}