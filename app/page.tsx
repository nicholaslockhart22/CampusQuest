import { Dashboard } from "@/components/Dashboard";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-uri-navy">
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        <Dashboard />
      </main>
    </div>
  );
}
