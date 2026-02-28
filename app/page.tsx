import { Dashboard } from "@/components/Dashboard";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-uri-navy bg-gradient-to-b from-uri-navy from-0% via-[#061e3a] via-40% to-[#041a35] to-100%">
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-4 sm:py-6 pb-8">
        <Dashboard />
      </main>
    </div>
  );
}
