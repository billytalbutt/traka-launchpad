import { Providers } from "@/components/providers";

export default function PendingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Providers>{children}</Providers>;
}
