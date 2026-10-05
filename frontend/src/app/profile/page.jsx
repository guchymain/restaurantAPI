"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { usersAPI } from "@/lib/api";
import {
  User,
  Mail,
  Phone,
  Lock,
  Calendar,
  Shield,
  Save,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Edit form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function fetchUserProfile() {
      if (!user?.id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await usersAPI.getById(user.id);
        if (!ignore && data?.user) {
          setProfileData(data.user);
          setName(data.user.name || "");
          setEmail(data.user.email || "");
          setPhone(data.user.phone || "");
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Failed to load user profile");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    if (isAuthenticated && user?.id) {
      fetchUserProfile();
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
    }

    return () => {
      ignore = true;
    };
  }, [isAuthenticated, user?.id, authLoading]);

  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setError(null);
    setSaving(true);

    try {
      const payload = { name, phone, email };
      if (password.trim()) {
        payload.password = password.trim();
      }

      const res = await usersAPI.update(user.id, payload);
      setProfileData(res.user);
      setPassword("");

      // Update user in localStorage
      const updatedUser = { ...user, ...res.user };
      localStorage.setItem("restaurant_user", JSON.stringify(updatedUser));

      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // Handle profile deletion
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      setDeleteError("Please type DELETE to confirm");
      return;
    }

    setDeleting(true);
    setDeleteError("");

    try {
      await usersAPI.delete(user.id);
      logout();
      router.push("/login");
    } catch (err) {
      setDeleteError(err.message || "Failed to delete account");
      setDeleting(false);
    }
  };

  if (!authLoading && !isAuthenticated) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="rounded-3xl border border-stone-200 bg-stone-100 p-8 shadow-sm dark:border-stone-850 dark:bg-stone-950">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 mb-4">
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
            Sign In Required
          </h2>
          <p className="mt-2 text-xs text-stone-600 dark:text-stone-400">
            Please sign in to access your profile settings and account information.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-amber-700 transition-colors"
          >
            <span>Sign In Now</span>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-amber-600 mb-3" />
        <p className="text-sm font-bold text-stone-800 dark:text-stone-200">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-950 dark:text-stone-400 dark:hover:text-stone-100 mb-2 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Menu</span>
          </Link>
          <h1 className="font-serif text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100">
            Account Profile
          </h1>
          <p className="mt-1 text-xs text-stone-600 dark:text-stone-400">
            Manage your personal contact details, security credentials, and preferences.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300">
            <Shield className="h-3.5 w-3.5" />
            <span className="capitalize">{profileData?.role || user?.role || "Customer"}</span>
          </span>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="mb-6 flex items-start gap-2.5 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-xs text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="mb-6 flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Account Overview Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="rounded-3xl border border-stone-200 bg-stone-100 p-6 shadow-xs dark:border-stone-850 dark:bg-stone-950">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-600 text-white shadow-md mb-4 font-serif text-2xl font-bold">
                {profileData?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <h2 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                {profileData?.name}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                {profileData?.email}
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-stone-200 dark:border-stone-800 space-y-3 text-xs">
              <div className="flex items-center justify-between text-stone-600 dark:text-stone-400">
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  <span>Account ID</span>
                </span>
                <span className="font-bold text-stone-900 dark:text-stone-100">#{profileData?.id}</span>
              </div>

              <div className="flex items-center justify-between text-stone-600 dark:text-stone-400">
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  <span>Phone</span>
                </span>
                <span className="font-bold text-stone-900 dark:text-stone-100">{profileData?.phone || "—"}</span>
              </div>

              {profileData?.createdAt && (
                <div className="flex items-center justify-between text-stone-600 dark:text-stone-400">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Member Since</span>
                  </span>
                  <span className="font-bold text-stone-900 dark:text-stone-100">
                    {new Date(profileData.createdAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-stone-200 dark:border-stone-800">
              <Link
                href="/orders"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-stone-300 bg-stone-100 py-2.5 text-xs font-semibold text-stone-800 hover:bg-stone-200/60 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-200 dark:hover:bg-stone-900 transition-colors"
              >
                <span>View Order History</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Update Profile Form & Danger Zone */}
        <div className="md:col-span-2 space-y-6">
          {/* Edit Form */}
          <div className="rounded-3xl border border-stone-200 bg-stone-100 p-6 sm:p-8 shadow-xs dark:border-stone-850 dark:bg-stone-950">
            <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 mb-1">
              Edit Profile Details
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-6">
              Update your account details below. Leave the password field empty if you do not wish to change it.
            </p>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-stone-100 py-2.5 pl-10 pr-4 text-xs font-medium text-stone-900 focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 shadow-2xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-stone-300 bg-stone-100 py-2.5 pl-10 pr-4 text-xs font-medium text-stone-900 focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 shadow-2xs"
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
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-xl border border-stone-300 bg-stone-100 py-2.5 pl-10 pr-4 text-xs font-medium text-stone-900 focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1.5">
                  Change Password (optional)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <input
                    type="password"
                    placeholder="Leave blank to keep current password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-stone-100 py-2.5 pl-10 pr-4 text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 dark:placeholder:text-stone-500 shadow-2xs"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-amber-600 px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-amber-700 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Danger Zone: Delete Profile */}
          <div className="rounded-3xl border border-rose-200 bg-rose-50/50 p-6 sm:p-8 dark:border-rose-950 dark:bg-rose-950/20">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-serif text-base font-bold text-rose-900 dark:text-rose-200">
                  Danger Zone: Delete Account
                </h3>
                <p className="mt-1 text-xs text-rose-700 dark:text-rose-400 leading-relaxed">
                  Permanently delete your profile and account credentials. This action cannot be undone.
                </p>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteModal(true);
                      setDeleteConfirmText("");
                      setDeleteError("");
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-700 active:scale-95 transition-all cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete My Account</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => !deleting && setShowDeleteModal(false)}
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
          />

          <div className="relative w-full max-w-md rounded-3xl bg-stone-100 p-6 sm:p-8 shadow-2xl border border-stone-200 dark:border-stone-850 dark:bg-stone-950 animate-in zoom-in-95 duration-150">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-300 mb-4">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <h3 className="font-serif text-xl font-bold text-center text-stone-900 dark:text-stone-100">
              Confirm Account Deletion
            </h3>

            <p className="mt-2 text-center text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              Are you sure you want to delete your profile? Type <strong className="text-rose-600 dark:text-rose-400 font-bold">DELETE</strong> below to confirm.
            </p>

            {deleteError && (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-center text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300">
                {deleteError}
              </div>
            )}

            <div className="mt-4">
              <input
                type="text"
                placeholder="Type DELETE"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full text-center rounded-xl border border-stone-300 bg-stone-100 py-2.5 text-xs font-bold text-stone-900 focus:border-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500/20 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
              />
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setShowDeleteModal(false)}
                className="rounded-xl border border-stone-300 px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-200/60 dark:border-stone-800 dark:text-stone-300 dark:hover:bg-stone-900 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleting || deleteConfirmText !== "DELETE"}
                onClick={handleDeleteAccount}
                className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-700 disabled:opacity-50 transition-all cursor-pointer"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Permanently Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
