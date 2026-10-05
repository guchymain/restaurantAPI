"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { categoriesAPI, menuItemsAPI } from "@/lib/api";
import {
  ChefHat,
  Plus,
  Pencil,
  Trash2,
  FolderTree,
  Utensils,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  Lock,
  ArrowLeft,
  DollarSign
} from "lucide-react";

export default function StaffMenuManagementPage() {
  const { user, isAuthenticated, loading: authLoading, isStaffOrAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState("categories"); // 'categories' | 'menu'
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Category Modal State
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [catName, setCatName] = useState("");
  const [catDescription, setCatDescription] = useState("");
  const [catSaving, setCatSaving] = useState(false);

  // Menu Item Modal State
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemName, setItemName] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemCategoryId, setItemCategoryId] = useState("");
  const [itemAvailable, setItemAvailable] = useState(true);
  const [itemSaving, setItemSaving] = useState(false);

  // Action Loading Id (for deletes)
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [catRes, itemsRes] = await Promise.all([
        categoriesAPI.getAll(),
        menuItemsAPI.getAll(),
      ]);
      setCategories(catRes.categories || []);
      setMenuItems(itemsRes.menuItems || []);
    } catch (err) {
      setError(err.message || "Failed to load menu data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isStaffOrAdmin) {
      loadData();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [isAuthenticated, isStaffOrAdmin, authLoading]);

  // Open modal for Category Add/Edit
  const handleOpenCatModal = (cat = null) => {
    if (cat) {
      setEditingCategory(cat);
      setCatName(cat.name);
      setCatDescription(cat.description || "");
    } else {
      setEditingCategory(null);
      setCatName("");
      setCatDescription("");
    }
    setCatModalOpen(true);
  };

  // Submit Category
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    setCatSaving(true);
    setError(null);

    try {
      if (editingCategory) {
        await categoriesAPI.update(editingCategory.id, {
          name: catName,
          description: catDescription,
        });
        setSuccessMessage(`Category "${catName}" updated successfully!`);
      } else {
        await categoriesAPI.create({
          name: catName,
          description: catDescription,
        });
        setSuccessMessage(`Category "${catName}" created successfully!`);
      }
      setCatModalOpen(false);
      await loadData();
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      setError(err.message || "Failed to save category");
    } finally {
      setCatSaving(false);
    }
  };

  // Delete Category
  const handleDeleteCategory = async (catId, catName) => {
    if (!confirm(`Are you sure you want to delete category "${catName}"?`)) return;
    setActionLoadingId(catId);
    setError(null);
    try {
      await categoriesAPI.delete(catId);
      setSuccessMessage(`Category "${catName}" deleted successfully!`);
      await loadData();
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      setError(err.message || "Failed to delete category");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Open modal for Menu Item Add/Edit
  const handleOpenItemModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setItemName(item.name);
      setItemDescription(item.description || "");
      setItemPrice(item.price);
      setItemCategoryId(item.categoryId);
      setItemAvailable(item.isAvailable !== false);
    } else {
      setEditingItem(null);
      setItemName("");
      setItemDescription("");
      setItemPrice("");
      setItemCategoryId(categories[0]?.id || "");
      setItemAvailable(true);
    }
    setItemModalOpen(true);
  };

  // Submit Menu Item
  const handleSaveMenuItem = async (e) => {
    e.preventDefault();
    setItemSaving(true);
    setError(null);

    try {
      const payload = {
        name: itemName,
        description: itemDescription,
        price: parseFloat(itemPrice),
        categoryId: parseInt(itemCategoryId, 10),
        isAvailable: itemAvailable,
      };

      if (editingItem) {
        await menuItemsAPI.update(editingItem.id, payload);
        setSuccessMessage(`Menu item "${itemName}" updated successfully!`);
      } else {
        await menuItemsAPI.create(payload);
        setSuccessMessage(`Menu item "${itemName}" created successfully!`);
      }
      setItemModalOpen(false);
      await loadData();
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      setError(err.message || "Failed to save menu item");
    } finally {
      setItemSaving(false);
    }
  };

  // Delete Menu Item
  const handleDeleteMenuItem = async (itemId, itemName) => {
    if (!confirm(`Are you sure you want to delete dish "${itemName}"?`)) return;
    setActionLoadingId(itemId);
    setError(null);
    try {
      await menuItemsAPI.delete(itemId);
      setSuccessMessage(`Menu item "${itemName}" deleted successfully!`);
      await loadData();
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      setError(err.message || "Failed to delete menu item");
    } finally {
      setActionLoadingId(null);
    }
  };

  if (!authLoading && (!isAuthenticated || !isStaffOrAdmin)) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="rounded-3xl border border-stone-200 bg-stone-100 p-8 shadow-sm dark:border-stone-850 dark:bg-stone-950">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 mb-4">
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
            Access Restricted
          </h2>
          <p className="mt-2 text-xs text-stone-600 dark:text-stone-400">
            Only restaurant staff members and administrators have access to category and dish management controls.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-amber-700 transition-colors"
          >
            <span>Return to Menu</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-950 dark:text-stone-400 dark:hover:text-stone-100 mb-2 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Public Menu</span>
          </Link>
          <h1 className="font-serif text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-2.5">
            <ChefHat className="h-7 w-7 text-amber-600" />
            <span>Staff Menu & Category Controls</span>
          </h1>
          <p className="mt-1 text-xs text-stone-600 dark:text-stone-400">
            Logged in as {user?.role === "admin" ? "Admin" : "Staff"} ({user?.name}). Manage live culinary categories and menu items.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-2xl bg-stone-200/60 p-1.5 dark:bg-stone-900 border border-stone-300 dark:border-stone-800">
          <button
            onClick={() => setActiveTab("categories")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "categories"
                ? "bg-stone-100 text-stone-900 shadow-xs dark:bg-amber-600 dark:text-white"
                : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white"
            }`}
          >
            <FolderTree className="h-4 w-4" />
            <span>Categories ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("menu")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "menu"
                ? "bg-stone-100 text-stone-900 shadow-xs dark:bg-amber-600 dark:text-white"
                : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white"
            }`}
          >
            <Utensils className="h-4 w-4" />
            <span>Menu Dishes ({menuItems.length})</span>
          </button>
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

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-amber-600 mb-3" />
          <p className="text-sm font-bold text-stone-800 dark:text-stone-200">Loading catalog...</p>
        </div>
      ) : activeTab === "categories" ? (
        /* CATEGORIES TAB */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">
              Kitchen Categories
            </h2>
            <button
              onClick={() => handleOpenCatModal()}
              className="flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-700 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Category</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const count = menuItems.filter((m) => m.categoryId === cat.id).length;
              const isDeleting = actionLoadingId === cat.id;

              return (
                <div
                  key={cat.id}
                  className="flex flex-col justify-between rounded-3xl border border-stone-200 bg-stone-100 p-6 shadow-xs hover:border-amber-300 transition-all dark:border-stone-850 dark:bg-stone-950"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                        {cat.name}
                      </h3>
                      <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 dark:text-amber-300 border border-amber-500/20">
                        {count} {count === 1 ? "dish" : "dishes"}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2">
                      {cat.description || "No description provided"}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenCatModal(cat)}
                      className="flex items-center gap-1 rounded-xl border border-stone-300 bg-stone-100 px-3 py-1.5 text-xs font-bold text-stone-700 hover:bg-stone-200/60 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-850 transition-colors cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat.id, cat.name)}
                      disabled={isDeleting}
                      className="flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {isDeleting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* MENU DISHES TAB */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">
              Kitchen Menu Dishes
            </h2>
            <button
              onClick={() => handleOpenItemModal()}
              className="flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-700 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Dish</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuItems.map((item) => {
              const categoryName = categories.find((c) => c.id === item.categoryId)?.name || "General";
              const isDeleting = actionLoadingId === item.id;

              return (
                <div
                  key={item.id}
                  className="flex flex-col justify-between rounded-3xl border border-stone-200 bg-stone-100 p-6 shadow-xs hover:border-amber-300 transition-all dark:border-stone-850 dark:bg-stone-950"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                          {categoryName}
                        </span>
                        <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                          {item.name}
                        </h3>
                      </div>
                      <span className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                        ${Number(item.price).toFixed(2)}
                      </span>
                    </div>

                    <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 mt-1">
                      {item.description || "No description provided"}
                    </p>

                    <div className="mt-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          item.isAvailable !== false
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                        }`}
                      >
                        {item.isAvailable !== false ? "Available" : "Sold Out"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenItemModal(item)}
                      className="flex items-center gap-1 rounded-xl border border-stone-300 bg-stone-100 px-3 py-1.5 text-xs font-bold text-stone-700 hover:bg-stone-200/60 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-850 transition-colors cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteMenuItem(item.id, item.name)}
                      disabled={isDeleting}
                      className="flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {isDeleting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Category Modal (Add / Edit) */}
      {catModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => !catSaving && setCatModalOpen(false)}
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
          />

          <div className="relative w-full max-w-md rounded-3xl bg-stone-100 p-6 sm:p-8 shadow-2xl border border-stone-200 dark:border-stone-850 dark:bg-stone-950 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800 mb-4">
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                {editingCategory ? "Edit Category" : "New Category"}
              </h3>
              <button
                onClick={() => setCatModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1.5">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Appetizers"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 bg-stone-100 py-2.5 px-3.5 text-xs font-medium text-stone-900 focus:border-amber-600 focus:outline-none dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Short description of this food category..."
                  value={catDescription}
                  onChange={(e) => setCatDescription(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 bg-stone-100 py-2.5 px-3.5 text-xs font-medium text-stone-900 focus:border-amber-600 focus:outline-none dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCatModalOpen(false)}
                  className="rounded-xl border border-stone-300 px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-200/60 dark:border-stone-800 dark:text-stone-300 dark:hover:bg-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={catSaving}
                  className="flex items-center gap-1.5 rounded-xl bg-amber-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-700 disabled:opacity-50"
                >
                  {catSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{editingCategory ? "Update Category" : "Create Category"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Menu Item Modal (Add / Edit) */}
      {itemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => !itemSaving && setItemModalOpen(false)}
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
          />

          <div className="relative w-full max-w-lg rounded-3xl bg-stone-100 p-6 sm:p-8 shadow-2xl border border-stone-200 dark:border-stone-850 dark:bg-stone-950 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800 mb-4">
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                {editingItem ? "Edit Menu Dish" : "New Menu Dish"}
              </h3>
              <button
                onClick={() => setItemModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMenuItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1.5">
                  Dish Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Truffle Mushroom Risotto"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 bg-stone-100 py-2.5 px-3.5 text-xs font-medium text-stone-900 focus:border-amber-600 focus:outline-none dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1.5">
                    Category
                  </label>
                  <select
                    required
                    value={itemCategoryId}
                    onChange={(e) => setItemCategoryId(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-stone-100 py-2.5 px-3.5 text-xs font-medium text-stone-900 focus:border-amber-600 focus:outline-none dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1.5">
                    Price ($ USD)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="14.99"
                      value={itemPrice}
                      onChange={(e) => setItemPrice(e.target.value)}
                      className="w-full rounded-xl border border-stone-300 bg-stone-100 py-2.5 pl-8 pr-3.5 text-xs font-medium text-stone-900 focus:border-amber-600 focus:outline-none dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Ingredients and culinary preparation..."
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 bg-stone-100 py-2.5 px-3.5 text-xs font-medium text-stone-900 focus:border-amber-600 focus:outline-none dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="itemAvailableCheckbox"
                  checked={itemAvailable}
                  onChange={(e) => setItemAvailable(e.target.checked)}
                  className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                />
                <label htmlFor="itemAvailableCheckbox" className="text-xs font-semibold text-stone-700 dark:text-stone-300 cursor-pointer">
                  Available in kitchen line (unchecked means Sold Out)
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setItemModalOpen(false)}
                  className="rounded-xl border border-stone-300 px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-200/60 dark:border-stone-800 dark:text-stone-300 dark:hover:bg-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={itemSaving}
                  className="flex items-center gap-1.5 rounded-xl bg-amber-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-700 disabled:opacity-50"
                >
                  {itemSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{editingItem ? "Update Dish" : "Create Dish"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
