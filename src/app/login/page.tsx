import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-[#050505] px-4 py-16 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-8rem] top-[-8rem] h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.22),transparent_62%)] blur-3xl" />
        <div className="absolute bottom-[-8rem] right-[-8rem] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.2),transparent_64%)] blur-3xl" />
      </div>
      <div className="relative mx-auto grid max-w-xl pt-8">
        <LoginForm />
      </div>
    </main>
  );
}
