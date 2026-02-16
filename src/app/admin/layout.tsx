import { Providers } from "@/components/providers";
import { Sidebar } from "@/components/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <div className="min-h-screen bg-void bg-dots bg-ambient">
        <Sidebar />
        <main className="pl-[60px] md:pl-[240px] transition-all duration-200">
          <div className="max-w-6xl mx-auto px-6 lg:px-10 py-8">
            {children}
          </div>
        </main>
      </div>
    </Providers>
  );
}
