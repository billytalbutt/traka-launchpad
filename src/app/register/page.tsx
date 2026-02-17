"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      if (data.needsApproval) {
        router.push("/login?registered=true&pending=true");
      } else {
        router.push("/login?registered=true");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-void bg-dots bg-ambient p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="mb-10">
          <Image
            src="/traka-logo-dark.svg"
            alt="Traka - ASSA ABLOY"
            width={120}
            height={56}
            className="h-10 w-auto"
          />
        </div>

        <h2 className="text-display-sm text-2xl text-text-primary mb-1">
          Create account
        </h2>
        <p className="text-text-secondary text-sm mb-8">
          Join Traka Launchpad to get started
        </p>

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
            <label className="text-label mb-2 block">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              required
              className="w-full px-4 py-2.5 rounded-lg input-field text-sm"
            />
          </div>

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
              placeholder="Min. 6 characters"
              required
              minLength={6}
              className="w-full px-4 py-2.5 rounded-lg input-field text-sm"
            />
          </div>

          <div>
            <label className="text-label mb-2 block">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              minLength={6}
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
                Create Account
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <p className="text-text-tertiary text-sm mt-8 text-center">
          Already have an account?{" "}
            <Link
              href="/login"
              className="text-traka-orange hover:text-traka-orange-light transition-colors"
            >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
