import { Dashboard } from "@/components/Dashboard";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-uri-navy bg-gradient-to-b from-uri-navy via-uri-navy to-uri-navy/95">
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-4 sm:py-6 pb-8">
        <Dashboard />
      </main>
    </div>
  );
}
