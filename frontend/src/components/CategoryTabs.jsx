"use client";

import { Sparkles, Utensils } from "lucide-react";

export default function CategoryTabs({ categories = [], selectedCategory = "all", onSelectCategory }) {
  return (
    <div className="relative border-b border-stone-200 dark:border-stone-850">
      <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none">
        {/* 'All' Tab */}
        <button
          onClick={() => onSelectCategory("all")}
          type="button"
          className={`group flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold transition-all active:scale-95 cursor-pointer ${
            selectedCategory === "all"
              ? "bg-stone-900 text-white shadow-xs dark:bg-amber-600 dark:text-white"
              : "bg-stone-100 text-stone-700 border border-stone-300 hover:bg-stone-200/60 hover:text-stone-950 dark:bg-stone-950 dark:text-stone-300 dark:border-stone-800 dark:hover:bg-stone-900 dark:hover:text-white"
          }`}
        >
          <Sparkles className={`h-3.5 w-3.5 ${selectedCategory === "all" ? "text-amber-400" : "text-stone-400"}`} />
          <span>All Menu</span>
        </button>

        {/* Dynamic Category Tabs */}
        {categories.map((category) => {
          const isSelected = String(selectedCategory) === String(category.id);
          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              type="button"
              className={`group flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                isSelected
                  ? "bg-stone-900 text-white shadow-xs dark:bg-amber-600 dark:text-white"
                  : "bg-stone-100 text-stone-700 border border-stone-300 hover:bg-stone-200/60 hover:text-stone-950 dark:bg-stone-950 dark:text-stone-300 dark:border-stone-800 dark:hover:bg-stone-900 dark:hover:text-white"
              }`}
            >
              <Utensils className={`h-3.5 w-3.5 ${isSelected ? "text-amber-400" : "text-stone-400"}`} />
              <span>{category.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
