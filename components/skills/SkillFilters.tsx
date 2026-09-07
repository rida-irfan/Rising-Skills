"use client";

interface SkillFiltersProps {
  search: string;
  setSearch: (value: string) => void;

  category: string;
  setCategory: (value: string) => void;

  state: string;
  setState: (value: string) => void;
}

export default function SkillFilters({
  search,
  setSearch,
  category,
  setCategory,
  state,
  setState,
}: SkillFiltersProps) {
  return (
    <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-3">
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search skills..."
        className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
      >
        <option value="All">All Categories</option>
        <option value="Frontend Development">
          Frontend Development
        </option>
        <option value="Backend Development">
          Backend Development
        </option>
        <option value="Database">
          Database
        </option>
        <option value="Testing">
          Testing
        </option>
      </select>

      <select
        value={state}
        onChange={(e) => setState(e.target.value)}
        className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
      >
        <option value="All">All States</option>
        <option value="Self-Reported">Self-Reported</option>
        <option value="Assessed">Assessed</option>
        <option value="Demonstrated">Demonstrated</option>
        <option value="Verified">Verified</option>
      </select>
    </div>
  );
}