import { Providers } from "@/components/providers";
import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <div className="min-h-screen bg-void">
        {/* Background image layer */}
        <div
          className="fixed inset-0 z-0"
          style={{
            backgroundImage: "url('/bg-space.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
        {/* Dark overlay so cards/text remain readable */}
        <div className="fixed inset-0 z-0 bg-void/70" />

        <Sidebar />
        <main className="relative z-10 pl-[60px] md:pl-[240px] transition-all duration-200">
          <div className="max-w-6xl mx-auto px-6 lg:px-10 py-8">
            {children}
          </div>
        </main>
      </div>
    </Providers>
  );
}
