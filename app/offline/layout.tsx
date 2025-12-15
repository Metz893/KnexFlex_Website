export default function OfflineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen bg-white text-slate-900"
      suppressHydrationWarning
    >
      {children}
    </div>
  );
}
