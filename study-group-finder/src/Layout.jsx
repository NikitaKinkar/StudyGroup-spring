export default function Layout({ children }) {
  return (
    <div className="font-sans min-h-screen bg-slate-50/50 text-slate-800 antialiased selection:bg-orange-500 selection:text-white">
      {children}
    </div>
  );
}