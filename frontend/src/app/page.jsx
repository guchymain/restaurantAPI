"use client";

import { useState, useEffect, useMemo } from "react";
import { categoriesAPI, menuItemsAPI } from "@/lib/api";
import CategoryTabs from "@/components/CategoryTabs";
import MenuCard from "@/components/MenuCard";
import { Search, Utensils, RefreshCw, AlertCircle, ShoppingBag, Flame, Sparkles } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function MenuPage() {
  const { openCart, totalCount } = useCart();
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      try {
        const [catRes, itemsRes] = await Promise.all([
          categoriesAPI.getAll(),
          menuItemsAPI.getAll(),
        ]);

        if (!ignore) {
          setCategories(catRes.categories || []);
          setMenuItems(itemsRes.menuItems || []);
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Failed to load restaurant menu data:", err);
          setError("Unable to connect to the restaurant API. Please ensure the backend is running.");
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      ignore = true;
    };
  }, []);

  const handleRetry = async () => {
    setLoading(true);
    setError(null);
    try {
      const [catRes, itemsRes] = await Promise.all([
        categoriesAPI.getAll(),
        menuItemsAPI.getAll(),
      ]);
      setCategories(catRes.categories || []);
      setMenuItems(itemsRes.menuItems || []);
    } catch {
      setError("Unable to connect to the restaurant API. Please ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // Filter items based on selected category and real-time search query
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory =
        selectedCategory === "all" ||
        String(item.categoryId) === String(selectedCategory);

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero Header Section */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-r from-stone-950 via-stone-900 to-stone-950 p-8 sm:p-12 text-white shadow-xl mb-10 border border-stone-800">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-3.5 py-1 text-xs font-bold text-amber-300 border border-amber-500/30 mb-4">
            <Flame className="h-3.5 w-3.5 text-amber-400" />
            <span>Seasonal Menu Fresh Daily</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white">
            Artisan Dining, <br />
            <span className="text-amber-400 italic">Prepared Fresh to Order.</span>
          </h1>

          <p className="mt-3 text-sm sm:text-base text-stone-200 leading-relaxed max-w-lg font-normal">
            Browse handcrafted specialties, customize your portion, and experience seamless real-time ordering directly from our culinary line.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button
              onClick={() => {
                const el = document.getElementById("menu-grid");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-amber-700 active:scale-95 transition-all cursor-pointer"
            >
              Explore Menu
            </button>

            {totalCount > 0 && (
              <button
                onClick={openCart}
                className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-sm hover:bg-white/25 active:scale-95 transition-all cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4 text-amber-300" />
                <span>View Cart ({totalCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* Subtle decorative background accent */}
        <div className="absolute -right-12 -bottom-12 h-64 w-64 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
      </section>

      {/* Control Bar: Search & Category Filter */}
      <section id="menu-grid" className="scroll-mt-24 space-y-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Utensils className="h-5 w-5 text-amber-600" />
              <span>Our Culinary Selection</span>
            </h2>
            <p className="text-xs text-stone-600 dark:text-stone-400 font-medium mt-0.5">
              Showing {filteredItems.length} delicious {filteredItems.length === 1 ? "dish" : "dishes"}
            </p>
          </div>

          {/* Real-time Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search burgers, pizzas, sides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-stone-300 bg-stone-100 py-2 pl-10 pr-4 text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 dark:placeholder:text-stone-500 shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 font-bold"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Category Tabs */}
        <CategoryTabs
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={(catId) => setSelectedCategory(catId)}
        />

        {/* Error State with Retry Button */}
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
            <AlertCircle className="mx-auto h-8 w-8 text-rose-600 mb-2" />
            <p className="text-sm font-bold text-stone-900 dark:text-stone-100">{error}</p>
            <p className="text-xs text-rose-700 dark:text-rose-400 mt-1 max-w-md mx-auto">
              Please check if the Express backend server is running on port 5000.
            </p>
            <button
              onClick={handleRetry}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-rose-700 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-800 active:scale-95 transition-all cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retry Connection</span>
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && !error && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="h-56 animate-pulse rounded-2xl border border-stone-200 bg-stone-100 p-5 dark:border-stone-850 dark:bg-stone-950"
              >
                <div className="h-4 w-20 rounded-md bg-stone-200 dark:bg-stone-800 mb-4" />
                <div className="h-5 w-3/4 rounded-md bg-stone-200 dark:bg-stone-800 mb-2" />
                <div className="h-3 w-full rounded-md bg-stone-200/60 dark:bg-stone-900 mb-1" />
                <div className="h-3 w-2/3 rounded-md bg-stone-200/60 dark:bg-stone-900 mb-6" />
                <div className="h-8 w-full rounded-xl bg-stone-200 dark:bg-stone-800 mt-auto" />
              </div>
            ))}
          </div>
        )}

        {/* Menu Items Grid */}
        {!loading && !error && (
          <>
            {filteredItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-100/60 py-16 text-center dark:border-stone-850 dark:bg-stone-950/60">
                <Sparkles className="mx-auto h-8 w-8 text-stone-400" />
                <h3 className="mt-3 font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                  No items found
                </h3>
                <p className="mt-1 text-xs text-stone-600 dark:text-stone-400 max-w-sm mx-auto">
                  {searchQuery
                    ? `No menu items match "${searchQuery}". Try searching for something else or reset your filter.`
                    : "There are currently no items in this category."}
                </p>
                {(searchQuery || selectedCategory !== "all") && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                    }}
                    className="mt-4 rounded-xl bg-stone-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-stone-800 dark:bg-amber-600 dark:hover:bg-amber-500 cursor-pointer"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredItems.map((item) => (
                  <MenuCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
