"use client";

export type NotificationFilter =
  | "All"
  | "Unread"
  | "Challenges"
  | "Opportunities"
  | "System";

const filters: NotificationFilter[] = [
  "All",
  "Unread",
  "Challenges",
  "Opportunities",
  "System",
];

type NotificationFiltersProps = {
  activeFilter: NotificationFilter;
  onFilterChange: (filter: NotificationFilter) => void;
};

export default function NotificationFilters({
  activeFilter,
  onFilterChange,
}: NotificationFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <button
          key={filter}
          type="button"
          onClick={() => onFilterChange(filter)}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
            activeFilter === filter
              ? "bg-indigo-600 text-white"
              : "bg-white text-slate-600 shadow-sm hover:bg-slate-50"
          }`}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}