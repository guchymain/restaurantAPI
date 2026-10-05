"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  UtensilsCrossed,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  Loader2,
  AlertCircle,
  UserCheck,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { login, register, isAuthenticated, user, logout } = useAuth();

  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form state (customer only)
  const [name, setName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    if (!loginEmail || !loginPassword) {
      setErrorMessage("Please enter both your email address and password.");
      return;
    }

    setLoading(true);
    const result = await login({ email: loginEmail, password: loginPassword });
    setLoading(false);

    if (result.success) {
      router.push("/");
    } else {
      setErrorMessage(result.error || "Invalid email or password.");
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    if (!name || !regEmail || !phone || !regPassword) {
      setErrorMessage("Please fill in all registration fields.");
      return;
    }

    setLoading(true);
    const result = await register({
      name,
      email: regEmail,
      phone,
      password: regPassword,
    });
    setLoading(false);

    if (result.success) {
      // User is NOT logged in automatically; prompt user to sign in
      setLoginEmail(regEmail);
      setLoginPassword("");
      setName("");
      setRegEmail("");
      setPhone("");
      setRegPassword("");
      setMode("login");
      setSuccessMessage("Account created successfully! Please sign in with your email and password.");
    } else {
      setErrorMessage(result.error || "Registration failed. Please try again.");
    }
  };

  if (isAuthenticated && user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="rounded-3xl border border-stone-200 bg-stone-100 p-8 shadow-sm dark:border-stone-850 dark:bg-stone-950">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <UserCheck className="h-7 w-7" />
          </div>
          <h2 className="mt-4 font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
            Welcome back, {user.name}
          </h2>
          <p className="mt-1 text-xs text-stone-600 dark:text-stone-400">
            You are currently signed in with <strong className="text-stone-900 dark:text-stone-200">{user.email}</strong>.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 rounded-xl bg-amber-600 py-3 text-xs font-bold text-white shadow-xs hover:bg-amber-700 transition-colors"
            >
              <span>Explore Menu & Order</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <button
              onClick={logout}
              className="rounded-xl border border-stone-300 bg-stone-100 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-200/60 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-300 dark:hover:bg-stone-900 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
      <div className="overflow-hidden rounded-3xl border border-stone-200 bg-stone-100 shadow-md dark:border-stone-850 dark:bg-stone-950">
        {/* Card Header */}
        <div className="bg-stone-900 dark:bg-stone-950 px-8 py-8 text-center text-white border-b border-stone-800">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-600 text-white shadow-sm mb-3">
            <UtensilsCrossed className="h-6 w-6" />
          </div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-white">
            Customer Portal
          </h1>
          <p className="mt-1 text-xs text-stone-300 dark:text-stone-400 max-w-xs mx-auto">
            {mode === "login"
              ? "Sign in to place orders, track kitchen preparation, and view receipts."
              : "Register your customer account to start ordering."}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-stone-200 bg-stone-200/50 dark:border-stone-850 dark:bg-stone-900/60">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMessage("");
              setSuccessMessage("");
            }}
            className={`flex-1 py-3.5 text-center text-xs font-bold transition-all cursor-pointer ${
              mode === "login"
                ? "border-b-2 border-amber-600 bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-white shadow-2xs"
                : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setErrorMessage("");
              setSuccessMessage("");
            }}
            className={`flex-1 py-3.5 text-center text-xs font-bold transition-all cursor-pointer ${
              mode === "register"
                ? "border-b-2 border-amber-600 bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-white shadow-2xs"
                : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
            }`}
          >
            Create Customer Account
          </button>
        </div>

        <div className="p-8 bg-stone-100 dark:bg-stone-950">
          {/* Success Banner */}
          {successMessage && (
            <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-emerald-300 bg-emerald-50 p-3.5 text-xs text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
              <span className="font-medium">{successMessage}</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          {mode === "login" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-stone-100 py-2.5 pl-10 pr-4 text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 dark:placeholder:text-stone-500 shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <input
                    type="password"
                    required
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-stone-100 py-2.5 pl-10 pr-4 text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 dark:placeholder:text-stone-500 shadow-2xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 py-3 text-xs font-bold text-white shadow-sm hover:bg-amber-700 active:scale-98 disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  className="text-xs text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 underline font-medium"
                >
                  New customer? Create an account
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-stone-100 py-2.5 pl-10 pr-4 text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 dark:placeholder:text-stone-500 shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <input
                    type="email"
                    required
                    placeholder="jane@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-stone-100 py-2.5 pl-10 pr-4 text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 dark:placeholder:text-stone-500 shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 08012345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-stone-100 py-2.5 pl-10 pr-4 text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 dark:placeholder:text-stone-500 shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <input
                    type="password"
                    required
                    placeholder="Choose a secure password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-stone-100 py-2.5 pl-10 pr-4 text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 dark:placeholder:text-stone-500 shadow-2xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 py-3 text-xs font-bold text-white shadow-sm hover:bg-amber-700 active:scale-98 disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Customer Account</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  className="text-xs text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 underline font-medium"
                >
                  Already have an account? Sign in
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
