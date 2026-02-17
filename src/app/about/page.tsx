"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Rocket,
  Shield,
  Users,
  Wrench,
  Mail,
} from "lucide-react";

const features = [
  {
    icon: Rocket,
    title: "One-Click Launch",
    description:
      "Access all your Traka tools from a single dashboard. No more bookmarking dozens of URLs — everything is one click away.",
  },
  {
    icon: Shield,
    title: "Role-Based Access",
    description:
      "Tools are shown based on your role. Admins see everything, while support teams only see the tools relevant to them.",
  },
  {
    icon: Users,
    title: "Team Management",
    description:
      "Administrators can manage user accounts, assign roles, and control which tools each team member can access.",
  },
  {
    icon: Wrench,
    title: "Tool Directory",
    description:
      "A curated collection of Traka products including TrakaWEB, Data Tool, SMTP, Jira, Confluence, and more.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-void bg-dots bg-ambient relative">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Back link */}
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-text-tertiary hover:text-text-secondary text-sm transition-colors mb-12"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Image
            src="/traka-logo-dark.svg"
            alt="Traka"
            width={140}
            height={40}
            className="h-8 w-auto mb-8"
          />

          <h1 className="text-display-lg text-3xl text-text-primary mb-4">
            Traka Launchpad
          </h1>
          <p className="text-text-secondary text-lg leading-relaxed mb-12">
            Traka Launchpad is your unified command center for every Traka tool
            and product. It brings together all the applications your team needs
            into a single, role-aware dashboard — so you can spend less time
            searching and more time working.
          </p>
        </motion.div>

        {/* Features */}
        <div className="grid sm:grid-cols-2 gap-6 mb-16">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 + i * 0.08 }}
              className="panel rounded-lg p-5"
            >
              <feature.icon className="w-5 h-5 text-traka-orange mb-3" />
              <h3 className="font-display font-semibold text-text-primary text-[15px] mb-1.5">
                {feature.title}
              </h3>
              <p className="text-text-secondary text-[13px] leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* How to sign up */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.5 }}
          className="panel-raised rounded-lg p-6 mb-12"
        >
          <h2 className="text-display-sm text-xl text-text-primary mb-3">
            How to get access
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-text-secondary text-sm leading-relaxed">
            <li>
              Click{" "}
              <Link
                href="/register"
                className="text-traka-orange hover:text-traka-orange-light transition-colors"
              >
                Sign Up
              </Link>{" "}
              to create your account with your Traka email address.
            </li>
            <li>
              An administrator will review your account and assign the
              appropriate role.
            </li>
            <li>
              Once approved, sign in and you will see all the tools available to
              your role.
            </li>
          </ol>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.6 }}
          className="text-center"
        >
          <p className="text-text-tertiary text-sm mb-4">
            Need help or have questions?
          </p>
          <a
            href="mailto:support@traka.com"
            className="inline-flex items-center gap-2 text-traka-orange hover:text-traka-orange-light text-sm transition-colors"
          >
            <Mail className="w-4 h-4" />
            Contact support
          </a>
        </motion.div>

        {/* Copyright */}
        <p className="text-text-ghost text-xs font-mono mt-16 text-center">
          &copy; {new Date().getFullYear()} ASSA ABLOY
        </p>
      </div>
    </div>
  );
}
