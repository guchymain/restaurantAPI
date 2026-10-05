"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ordersAPI } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import StatusBadge from "@/components/StatusBadge";
import {
  RefreshCw,
  AlertCircle,
  Eye,
  Trash2,
  Calendar,
  PackageCheck,
  Loader2,
  Lock,
  ArrowRight,
  X,
  ChefHat
} from "lucide-react";

export default function OrdersPage() {
  const { user, isAuthenticated, loading: authLoading, isStaffOrAdmin } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Strictly fetch orders ONLY when authenticated!
  useEffect(() => {
    let ignore = false;

    async function loadOrders() {
      if (!isAuthenticated) {
        setOrders([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const params = {};
        if (statusFilter !== "all") {
          params.status = statusFilter;
        }
        const data = await ordersAPI.getAll(params);
        if (!ignore) {
          setOrders(data.orders || []);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Failed to retrieve your orders.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    if (!authLoading) {
      loadOrders();
    }

    return () => {
      ignore = true;
    };
  }, [statusFilter, isAuthenticated, authLoading]);

  const handleManualRefresh = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }
      const data = await ordersAPI.getAll(params);
      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message || "Failed to retrieve your orders.");
    } finally {
      setLoading(false);
    }
  };

  // Handle canceling a pending order (DELETE /api/orders/:id)
  const handleCancelOrder = async (orderId) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;

    setActionLoadingId(orderId);
    try {
      await ordersAPI.delete(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(null);
      }
    } catch (err) {
      alert(err.message || "Failed to cancel order.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const statusOptions = [
    { value: "all", label: "All Orders" },
    { value: "pending", label: "Pending" },
    { value: "preparing", label: "Preparing" },
    { value: "ready", label: "Ready" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  // If user is not signed in, show authentication required view
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
        <div className="rounded-3xl border border-stone-200 bg-stone-100 p-8 shadow-sm dark:border-stone-850 dark:bg-stone-950">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 mb-4">
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
            Sign In Required
          </h2>
          <p className="mt-2 text-xs text-stone-600 dark:text-stone-400 leading-relaxed max-w-sm mx-auto">
            Order history is protected. Please sign in with your customer account to view your past purchases, track prep status, and access receipts.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 rounded-xl bg-amber-600 py-3 text-xs font-bold text-white shadow-xs hover:bg-amber-700 active:scale-95 transition-all"
            >
              <span>Sign In / Create Account</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <Link
              href="/"
              className="rounded-xl border border-stone-300 bg-stone-100 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-200/60 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-300 dark:hover:bg-stone-900 transition-colors"
            >
              Browse Menu First
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-2.5">
            {isStaffOrAdmin && <ChefHat className="h-7 w-7 text-amber-600" />}
            <span>{isStaffOrAdmin ? "Kitchen & Order Management" : "My Orders & Tracking"}</span>
          </h1>
          <p className="mt-1 text-xs text-stone-600 dark:text-stone-400">
            {isStaffOrAdmin
              ? `Logged in as ${user?.role === "admin" ? "Admin" : "Staff Member"} (${user?.name}). Showing live restaurant kitchen orders.`
              : user ? `Showing orders for ${user.name} (${user.email}).` : "Loading your orders..."}
          </p>
        </div>

        <button
          onClick={handleManualRefresh}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-stone-300 bg-stone-100 px-4 py-2 text-xs font-bold text-stone-800 shadow-2xs hover:bg-stone-200/60 disabled:opacity-50 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-200 dark:hover:bg-stone-900 active:scale-95 transition-all cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-amber-600" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none mb-6">
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value)}
            className={`rounded-xl px-4 py-2 text-xs font-bold whitespace-nowrap transition-all active:scale-95 cursor-pointer ${
              statusFilter === opt.value
                ? "bg-stone-900 text-white shadow-xs dark:bg-amber-600 dark:text-white"
                : "bg-stone-100 text-stone-700 border border-stone-300 hover:bg-stone-200/60 hover:text-stone-950 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-300 dark:hover:bg-stone-900 dark:hover:text-white"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 mb-6">
          <AlertCircle className="mx-auto h-7 w-7 text-rose-600 mb-2" />
          <p className="text-sm font-bold">{error}</p>
          <button
            onClick={handleManualRefresh}
            className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-rose-700 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-800"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* Orders Grid / Table */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl border border-stone-200 bg-stone-100 dark:border-stone-850 dark:bg-stone-950"
            />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-100/60 py-16 text-center dark:border-stone-850 dark:bg-stone-950/60">
          <PackageCheck className="mx-auto h-10 w-10 text-stone-400 mb-2" />
          <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
            No orders found
          </h3>
          <p className="mt-1 text-xs text-stone-600 dark:text-stone-400 max-w-sm mx-auto">
            {statusFilter !== "all"
              ? `There are no orders with status "${statusFilter}". Try selecting "All Orders".`
              : "You haven't placed any orders yet. Visit our culinary menu to get started."}
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-amber-700 transition-colors"
          >
            <span>Browse Restaurant Menu</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const formattedTotal = Number(order.totalAmount).toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            });
            const itemCount = (order.items || []).reduce((acc, it) => acc + (it.quantity || 1), 0);
            const dateStr = new Date(order.createdAt).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            });

            const isPending = order.status === "pending";
            const isProcessingAction = actionLoadingId === order.id;

            return (
              <div
                key={order.id}
                className="group flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-stone-100 p-5 shadow-xs transition-all hover:border-amber-300 hover:shadow-md dark:border-stone-850 dark:bg-stone-950 dark:hover:border-stone-700"
              >
                {/* Left: Info */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-serif text-base font-extrabold text-stone-900 dark:text-stone-100">
                      Order #{order.id}
                    </span>
                    <StatusBadge status={order.status} />
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600 dark:text-stone-400">
                    <span className="flex items-center gap-1.5 font-medium text-stone-700 dark:text-stone-300">
                      <Calendar className="h-3.5 w-3.5 text-stone-400" />
                      {dateStr}
                    </span>
                    <span>•</span>
                    <span className="font-medium text-stone-700 dark:text-stone-300">
                      {itemCount} {itemCount === 1 ? "item" : "items"}
                    </span>
                    <span>•</span>
                    <span className="font-bold text-stone-900 dark:text-stone-100">
                      Total: {formattedTotal}
                    </span>
                  </div>

                  {/* Items summary */}
                  <div className="text-xs text-stone-600 dark:text-stone-300 line-clamp-1 font-medium">
                    {(order.items || [])
                      .map((it) => `${it.quantity}× ${it.name || "Item"}`)
                      .join(", ")}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-stone-200 dark:border-stone-850">
                  {/* View Details Modal Trigger */}
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="flex items-center gap-1.5 rounded-xl border border-stone-300 bg-stone-100 px-3.5 py-2 text-xs font-bold text-stone-800 hover:bg-stone-200/60 dark:border-stone-850 dark:bg-stone-950 dark:text-stone-200 dark:hover:bg-stone-900 transition-colors cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5 text-stone-500" />
                    <span>View Receipt</span>
                  </button>

                  <Link
                    href={`/orders/${order.id}`}
                    className="flex items-center gap-1.5 rounded-xl bg-stone-200/60 px-3.5 py-2 text-xs font-bold text-stone-800 hover:bg-stone-200 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-850 transition-colors"
                  >
                    <span>Full Details</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>

                  {/* Customer Cancel Button for pending orders */}
                  {!isStaffOrAdmin && isPending && (
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      disabled={isProcessingAction}
                      className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {isProcessingAction ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                      )}
                      <span>Cancel Order</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Itemized Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            onClick={() => setSelectedOrder(null)}
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
          />

          <div className="relative w-full max-w-lg rounded-3xl bg-stone-100 p-6 sm:p-8 shadow-2xl border border-stone-200 dark:border-stone-850 dark:bg-stone-950 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-stone-200 pb-4 dark:border-stone-800">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">
                    Order #{selectedOrder.id}
                  </h3>
                  <StatusBadge status={selectedOrder.status} />
                </div>
                <p className="mt-1 text-xs text-stone-500">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 dark:hover:bg-stone-850 dark:hover:text-stone-200 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Customer Details */}
            {selectedOrder.user && (
              <div className="mt-4 rounded-xl bg-stone-200/50 p-3 text-xs text-stone-700 border border-stone-300 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-300">
                <span className="font-bold text-stone-900 dark:text-stone-100">Order For: </span>
                {selectedOrder.user.name} ({selectedOrder.user.email})
              </div>
            )}

            {/* Itemized Receipt Table */}
            <div className="mt-4 max-h-60 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800 pr-1">
              {(selectedOrder.items || []).map((item) => (
                <div key={item.id || item.menuItemId} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-stone-900 dark:text-stone-100">
                      {item.name || item.menuItem?.name || `Item #${item.menuItemId}`}
                    </p>
                    <p className="text-stone-500 dark:text-stone-400 font-medium">
                      {item.quantity} × ${Number(item.price || item.unitPrice).toFixed(2)}
                    </p>
                  </div>
                  <span className="font-extrabold text-stone-900 dark:text-stone-100">
                    ${Number(item.subtotal || item.quantity * (item.price || item.unitPrice)).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-800 flex justify-between items-center">
              <span className="font-bold text-stone-800 dark:text-stone-200 text-sm">Total Paid</span>
              <span className="font-serif text-2xl font-extrabold text-amber-700 dark:text-amber-400">
                ${Number(selectedOrder.totalAmount).toFixed(2)}
              </span>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-2.5">
              {isStaffOrAdmin ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-600 dark:text-stone-400">Status:</span>
                  <select
                    value={selectedOrder.status}
                    disabled={actionLoadingId === selectedOrder.id}
                    onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, e.target.value)}
                    className="rounded-xl border border-stone-300 bg-stone-100 px-3 py-1.5 text-xs font-semibold text-stone-800 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                  >
                    <option value="pending">Pending</option>
                    <option value="preparing">Preparing</option>
                    <option value="ready">Ready</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              ) : (
                selectedOrder.status === "pending" && (
                  <button
                    type="button"
                    onClick={() => handleCancelOrder(selectedOrder.id)}
                    className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300 cursor-pointer"
                  >
                    Cancel Order
                  </button>
                )
              )}

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-xl bg-stone-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-stone-800 dark:bg-amber-600 dark:hover:bg-amber-500 cursor-pointer ml-auto"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
