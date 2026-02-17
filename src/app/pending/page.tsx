"use client";

import { signOut, useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Clock, LogOut, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PendingApprovalPage() {
  const { data: session, update } = useSession();
  const router = useRouter();

  // Poll for approval status every 15 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      const updated = await update();
      if (updated?.user?.isApproved) {
        router.push("/dashboard");
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [update, router]);

  const handleRefresh = async () => {
    const updated = await update();
    if (updated?.user?.isApproved) {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-void bg-dots bg-ambient p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md text-center"
      >
        {/* Logo */}
        <div className="mb-10 flex justify-center">
          <Image
            src="/traka-logo-dark.svg"
            alt="Traka - ASSA ABLOY"
            width={120}
            height={56}
            className="h-10 w-auto"
          />
        </div>

        {/* Pending icon */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="w-16 h-16 rounded-full bg-traka-orange/[0.08] border border-traka-orange/20 flex items-center justify-center mx-auto mb-6"
        >
          <Clock className="w-8 h-8 text-traka-orange" />
        </motion.div>

        <h1 className="text-display-sm text-2xl text-text-primary mb-2">
          Account Pending Approval
        </h1>
        <p className="text-text-secondary text-sm mb-2 max-w-sm mx-auto">
          Your account has been created successfully. An administrator needs to
          review and approve your account before you can access the launchpad.
        </p>

        {session?.user?.email && (
          <p className="text-text-tertiary text-xs mb-8">
            Signed in as{" "}
            <span className="text-text-secondary">{session.user.email}</span>
          </p>
        )}

        {/* Info card */}
        <div className="panel rounded-lg p-5 mb-8 text-left">
          <h3 className="text-sm font-medium text-text-primary mb-3">
            What happens next?
          </h3>
          <ul className="space-y-2.5 text-sm text-text-secondary">
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-traka-blue/[0.08] border border-traka-blue/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-traka-blue">1</span>
              </span>
              An administrator will review your account
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-traka-blue/[0.08] border border-traka-blue/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-traka-blue">2</span>
              </span>
              You&apos;ll be assigned the appropriate role and permissions
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-traka-blue/[0.08] border border-traka-blue/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-traka-blue">3</span>
              </span>
              This page will automatically redirect once approved
            </li>
          </ul>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg panel-interactive text-text-secondary text-sm hover:text-text-primary transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Check Status
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg panel-interactive text-text-secondary text-sm hover:text-red-400 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>

        {/* Copyright */}
        <p className="text-text-ghost text-xs font-mono mt-12">
          &copy; {new Date().getFullYear()} ASSA ABLOY
        </p>
      </motion.div>
    </div>
  );
}
