"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ordersAPI } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import StatusBadge from "@/components/StatusBadge";
import {
  ArrowLeft,
  Calendar,
  User,
  Receipt,
  Trash2,
  RefreshCw,
  AlertCircle,
  Loader2,
  ShoppingBag,
  Lock,
  ArrowRight
} from "lucide-react";

export default function OrderDetailsPage({ params }) {
  const unwrappedParams = use(params);
  const orderId = unwrappedParams.id;
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, isStaffOrAdmin } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadOrder() {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await ordersAPI.getById(orderId);
        if (!ignore) {
          setOrder(data.order);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Unable to locate order details.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    if (orderId && !authLoading) {
      loadOrder();
    }

    return () => {
      ignore = true;
    };
  }, [orderId, isAuthenticated, authLoading]);

  const handleRefresh = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const data = await ordersAPI.getById(orderId);
      setOrder(data.order);
    } catch (err) {
      setError(err.message || "Unable to locate order details.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    setActionLoading(true);
    try {
      await ordersAPI.delete(orderId);
      router.push("/orders");
    } catch (err) {
      alert(err.message || "Failed to cancel order");
      setActionLoading(false);
    }
  };

  if (!authLoading && !isAuthenticated) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
        <div className="rounded-3xl border border-stone-200 bg-stone-100 p-8 shadow-sm dark:border-stone-850 dark:bg-stone-950">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 mb-4">
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
            Sign In to View Receipt
          </h2>
          <p className="mt-2 text-xs text-stone-600 dark:text-stone-400 leading-relaxed max-w-sm mx-auto">
            Order receipts are linked to your customer profile. Please sign in to view this order.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 rounded-xl bg-amber-600 py-3 text-xs font-bold text-white shadow-xs hover:bg-amber-700 active:scale-95 transition-all"
            >
              <span>Sign In Now</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <Link
              href="/"
              className="rounded-xl border border-stone-300 bg-stone-100 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-200/60 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-300 dark:hover:bg-stone-900 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-amber-600 mb-3" />
        <p className="text-sm font-bold text-stone-800 dark:text-stone-200">Retrieving order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-rose-600 mb-3" />
        <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
          Order Not Found
        </h2>
        <p className="mt-1 text-xs text-stone-600 dark:text-stone-400">{error || "This order does not exist or has been removed."}</p>
        <Link
          href="/orders"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-amber-700 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to All Orders</span>
        </Link>
      </div>
    );
  }

  const isPending = order.status === "pending";
  const dateFormatted = new Date(order.createdAt).toLocaleString(undefined, {
    dateStyle: "full",
    timeStyle: "short",
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Top Back Link */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-700 hover:text-stone-950 dark:text-stone-300 dark:hover:text-stone-100 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Orders List</span>
        </Link>

        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs font-bold text-stone-700 hover:text-stone-950 dark:text-stone-300 dark:hover:text-stone-100 cursor-pointer"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Main Order Receipt Card */}
      <div className="overflow-hidden rounded-3xl border border-stone-200 bg-stone-100 shadow-sm dark:border-stone-850 dark:bg-stone-950">
        {/* Card Header */}
        <div className="border-b border-stone-200 bg-stone-100 p-6 sm:p-8 dark:border-stone-850 dark:bg-stone-950">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                Official Order Receipt
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 mt-1">
                Order #{order.id}
              </h1>
              <p className="mt-1 text-xs text-stone-600 dark:text-stone-400 flex items-center gap-1.5 font-medium">
                <Calendar className="h-3.5 w-3.5 text-stone-400" />
                <span>{dateFormatted}</span>
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <StatusBadge status={order.status} size="lg" />
            </div>
          </div>
        </div>

        {/* Customer Information (if available) */}
        {order.user && (
          <div className="border-b border-stone-200 p-6 sm:p-8 bg-stone-100 dark:border-stone-850 dark:bg-stone-950">
            <h3 className="font-serif text-sm font-bold text-stone-900 dark:text-stone-100 mb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-stone-500" />
              <span>Customer Details</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-stone-500 dark:text-stone-400 block font-medium">Name</span>
                <span className="font-bold text-stone-900 dark:text-stone-100">{order.user.name}</span>
              </div>
              <div>
                <span className="text-stone-500 dark:text-stone-400 block font-medium">Email</span>
                <span className="font-bold text-stone-900 dark:text-stone-100">{order.user.email}</span>
              </div>
              <div>
                <span className="text-stone-500 dark:text-stone-400 block font-medium">Phone</span>
                <span className="font-bold text-stone-900 dark:text-stone-100">{order.user.phone || "—"}</span>
              </div>
            </div>
          </div>
        )}

        {/* Itemized Breakdown Table */}
        <div className="p-6 sm:p-8 bg-stone-100 dark:bg-stone-950">
          <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100 mb-4 flex items-center gap-2">
            <Receipt className="h-4 w-4 text-amber-700 dark:text-amber-400" />
            <span>Ordered Items</span>
          </h3>

          <div className="divide-y divide-stone-200 dark:divide-stone-850">
            {(order.items || []).map((item) => {
              const unitPrice = Number(item.price || item.unitPrice);
              const subtotal = Number(item.subtotal || item.quantity * unitPrice);

              return (
                <div
                  key={item.id || item.menuItemId}
                  className="py-3.5 first:pt-0 flex items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <p className="font-bold text-sm text-stone-900 dark:text-stone-100">
                      {item.name || `Item #${item.menuItemId}`}
                    </p>
                    <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                      {item.quantity} × ${unitPrice.toFixed(2)}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-sm text-stone-900 dark:text-stone-100">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pricing Totals */}
          <div className="mt-6 pt-6 border-t border-stone-200 dark:border-stone-800 space-y-2">
            <div className="flex justify-between text-xs text-stone-600 dark:text-stone-400 font-medium">
              <span>Subtotal</span>
              <span className="font-bold text-stone-800 dark:text-stone-200">${Number(order.totalAmount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-stone-600 dark:text-stone-400 font-medium">
              <span>Taxes & Kitchen Service Fee</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">Included</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-stone-900 dark:text-stone-100 pt-2 border-t border-stone-200 dark:border-stone-800">
              <span>Total Paid</span>
              <span className="font-serif text-2xl text-amber-700 dark:text-amber-400">
                ${Number(order.totalAmount).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-stone-200 bg-stone-100 p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4 dark:border-stone-850 dark:bg-stone-950">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl border border-stone-300 bg-stone-100 px-4 py-2.5 text-xs font-bold text-stone-800 hover:bg-stone-200/60 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-200 dark:hover:bg-stone-900 transition-colors"
          >
            <ShoppingBag className="h-4 w-4 text-amber-700 dark:text-amber-400" />
            <span>Order More Items</span>
          </Link>

          {!isStaffOrAdmin && isPending && (
            <button
              onClick={handleCancelOrder}
              disabled={actionLoading}
              className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 disabled:opacity-50 cursor-pointer transition-colors"
            >
              {actionLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              <span>Cancel Order</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
