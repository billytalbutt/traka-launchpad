"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ArrowRight, X } from "lucide-react";
import ResponsiveHeroBanner from "@/components/ui/responsive-hero-banner";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

const EASE_CURVE = [0.32, 0.72, 0, 1] as const;
const TRANSITION_DURATION = 0.65;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

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
    <div className="min-h-screen flex bg-void overflow-hidden">
      {/* Hero banner — full width by default, shrinks when login panel opens */}
      <motion.div
        animate={{ width: showLogin ? "58%" : "100%" }}
        transition={{ duration: TRANSITION_DURATION, ease: EASE_CURVE }}
        className="relative min-h-screen hidden lg:block"
      >
        <ResponsiveHeroBanner
          logoUrl="/traka-logo-dark.svg"
          badgeLogoUrl="/launchpad-rocket-logo.png"
          badgeLabel="v1.0"
          badgeText="Traka Launchpad — Now Live"
          title="Your tools."
          titleLine2="One place."
          description="Access all of your Traka tools from a single command center. Launch, manage, and monitor your entire toolkit — all from one unified dashboard."
          navLinks={[
            { label: "Launchpad", href: "/dashboard", isActive: true },
            { label: "Jira", href: "https://jira.assaabloy.net/secure/Dashboard.jspa" },
            { label: "Confluence", href: "https://confluence.assaabloy.net/index.action#all-updates" },
          ]}
          ctaButtonText="Sign In"
          onCtaClick={() => setShowLogin(true)}
          primaryButtonText="Explore Tools"
          primaryButtonHref="/dashboard"
          secondaryButtonText="Learn More"
          secondaryButtonHref="/about"
          partnersTitle="Enabling management of your Traka Toolkit"
          partners={[
            { logoUrl: "/trakaweb-logo.png", href: "#" },
            { logoUrl: "/tool-icons/traka-ai-logo.png", href: "#" },
            { logoUrl: "/tool-icons/swagger-logo.png", href: "#" },
            { logoUrl: "/jira-logo.svg", href: "#" },
            { logoUrl: "/confluence-logo.svg", href: "#" },
          ]}
        />
      </motion.div>

      {/* Mobile: always show login form (no hero banner on small screens) */}
      <div className="lg:hidden flex-1 flex items-center justify-center p-6 sm:p-12 bg-void bg-dots bg-ambient">
        <div className="w-full max-w-sm">
          <div className="mb-10 flex items-center gap-3">
            <Image
              src="/traka-mark.svg"
              alt="Traka"
              width={80}
              height={20}
              className="h-5 w-auto"
            />
            <span className="font-display font-semibold text-[11px] text-text-tertiary uppercase tracking-[0.1em]">
              Launchpad
            </span>
          </div>
          <LoginFormContent
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            error={error}
            loading={loading}
            onSubmit={handleSubmit}
            callbackUrl={callbackUrl}
          />
        </div>
      </div>

      {/* Desktop: animated slide-in login panel */}
      <AnimatePresence>
        {showLogin && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "42%", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: TRANSITION_DURATION, ease: EASE_CURVE }}
            className="hidden lg:flex relative items-center justify-center bg-void bg-dots bg-ambient overflow-hidden"
          >
            {/* Subtle left border glow */}
            <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-traka-orange/20 to-transparent" />

            {/* Close button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              onClick={() => setShowLogin(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </motion.button>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.5, delay: 0.2, ease: EASE_CURVE }}
              className="w-full max-w-sm px-8"
            >
              <LoginFormContent
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                error={error}
                loading={loading}
                onSubmit={handleSubmit}
                callbackUrl={callbackUrl}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LoginFormContent({
  email,
  setEmail,
  password,
  setPassword,
  error,
  loading,
  onSubmit,
  callbackUrl,
}: {
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  error: string;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  callbackUrl: string;
}) {
  return (
    <>
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

      <form onSubmit={onSubmit} className="space-y-4">
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

      <p className="text-text-ghost text-xs font-mono mt-12 text-center">
        &copy; {new Date().getFullYear()} ASSA ABLOY
      </p>
    </>
  );
}
