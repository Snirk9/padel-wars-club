import Link from "next/link";
import { SignupForm } from "@/components/auth/SignupForm";
import { PadelLogo } from "@/components/ui/PadelLogo";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="px-5 py-4 flex items-center justify-between max-w-lg mx-auto w-full">
        <Link href="/" className="flex items-center gap-2">
          <PadelLogo className="w-7 h-7" />
          <span className="font-black text-gray-900 tracking-tight text-sm">PADEL WARS</span>
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-start px-5 pt-4 pb-10 max-w-lg mx-auto w-full">
        <div className="w-full">
          <h1 className="text-2xl font-black text-gray-900 mb-1">Create your account</h1>
          <p className="text-sm text-gray-500 mb-6">
            One account. All your clubs. All your W's.
          </p>
          <SignupForm />
          <p className="text-sm text-center text-gray-500 mt-5">
            Already in?{" "}
            <Link href="/login" className="font-semibold text-sky-500 hover:text-sky-600">
              Log in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

