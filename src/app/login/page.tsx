"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-void bg-dots bg-ambient">
      {/* Left panel — brand / atmosphere */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[50%] flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-border-subtle to-transparent" />
        <div className="absolute bottom-[20%] left-[10%] w-48 h-48 rounded-full bg-traka-blue/5 blur-3xl" />
        <div className="absolute top-[30%] right-[15%] w-32 h-32 rounded-full bg-traka-orange/3 blur-3xl" />

        {/* Top — Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3"
        >
          <Image
            src="/traka-logo-dark.svg"
            alt="Traka - ASSA ABLOY"
            width={120}
            height={56}
            className="h-10 w-auto"
          />
        </motion.div>

        {/* Center — Hero text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-display-lg text-5xl xl:text-6xl text-text-primary mb-6">
            Your tools.
            <br />
            <span className="text-traka-orange">One place.</span>
          </h1>
          <p className="text-text-secondary text-lg leading-relaxed max-w-md">
            Access every Traka product from a single command center.
            Launch, manage, and monitor — all in one click.
          </p>

          {/* Decorative status indicators */}
          <div className="flex items-center gap-6 mt-12">
            {["Log Analyzer", "Data Tool", "CSV Import", "Docs AI"].map(
              (tool, i) => (
                <motion.div
                  key={tool}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="flex items-center gap-2"
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor:
                        i === 0
                          ? "#0071E3"
                          : i === 1
                          ? "#8b5cf6"
                          : i === 2
                          ? "#10b981"
                          : "#E8730E",
                      boxShadow: `0 0 6px ${
                        i === 0
                          ? "#0071E340"
                          : i === 1
                          ? "#8b5cf640"
                          : i === 2
                          ? "#10b98140"
                          : "#E8730E40"
                      }`,
                    }}
                  />
                  <span className="text-label !text-[10px]">{tool}</span>
                </motion.div>
              )
            )}
          </div>
        </motion.div>

        {/* Bottom — copyright */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-text-ghost text-xs font-mono"
        >
          &copy; {new Date().getFullYear()} ASSA ABLOY
        </motion.p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="lg:hidden mb-10">
            <Image
              src="/traka-logo-dark.svg"
              alt="Traka - ASSA ABLOY"
              width={120}
              height={56}
              className="h-10 w-auto"
            />
          </div>

          <h2 className="text-display-sm text-2xl text-text-primary mb-1">
            Welcome back
          </h2>
          <p className="text-text-secondary text-sm mb-8">
            Sign in to continue to your launchpad
          </p>

          {/* Google sign in */}
          <button
            onClick={() => signIn("google", { callbackUrl })}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg panel-interactive text-text-primary text-sm font-medium mb-6"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 0 0 0 12c0 1.94.46 3.77 1.28 5.4l3.56-2.77v-.54z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-border-subtle" />
            <span className="text-label !text-[10px]">OR</span>
            <div className="flex-1 h-px bg-border-subtle" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 rounded-lg bg-red-500/5 border border-red-500/15 text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            <div>
              <label className="text-label mb-2 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full px-4 py-2.5 rounded-lg input-field text-sm"
              />
            </div>

            <div>
              <label className="text-label mb-2 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-2.5 rounded-lg input-field text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <p className="text-text-tertiary text-sm mt-8 text-center">
            No account?{" "}
            <Link
              href="/register"
              className="text-traka-orange hover:text-traka-orange-light transition-colors"
            >
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
