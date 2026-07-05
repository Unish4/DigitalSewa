import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, ClipboardList } from "lucide-react";
import useIssueStore from "../../store/useIssueStore.js";
import useAuthStore from "../../store/useAuthStore.js";
import IssueCard from "../../components/issues/IssueCard.jsx";
import IssueCardSkeleton from "../../components/issues/IssueCardSkeleton.jsx";
import FilterBar from "../../components/issues/FilterBar.jsx";
import { useDebounce } from "../../hooks/useDebounce.js";

// Default filter values — extracted as a constant so "Clear all"
// can reset to exactly this shape without duplicating it.
const DEFAULT_FILTERS = {
  category: "",
  status: "",
  priority: "",
  sort: "newest",
};

const IssuesPage = () => {
  const { issues, pagination, isLoading, error, getIssues } = useIssueStore();
  const { isAuthenticated } = useAuthStore();

  // ── Filter state ────────────────────────────────────────────────────────
  // search is kept separate from filters because it's debounced independently.
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);

  // Debounce the raw search string — only the debounced version triggers
  // the API call, so the user can type freely without flooding the backend.
  const debouncedSearch = useDebounce(search, 400);

  // ── Fetch issues whenever debounced search, filters, or page changes ────
  // debouncedSearch in the dep array means search-triggered fetches wait
  // 400ms. Filter/page changes are immediate (no debounce needed).
  useEffect(() => {
    // Build params object — only include non-default values so the URL
    // stays clean and the backend doesn't receive unnecessary keys.
    const params = { page, limit: 12 };
    if (debouncedSearch) params.search = debouncedSearch;
    if (filters.category) params.category = filters.category;
    if (filters.status) params.status = filters.status;
    if (filters.priority) params.priority = filters.priority;
    if (filters.sort !== "newest") params.sort = filters.sort;

    getIssues(params);
  }, [
    debouncedSearch,
    filters.category,
    filters.status,
    filters.priority,
    filters.sort,
    page,
    getIssues,
  ]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1); // always reset to page 1 when search changes
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // always reset to page 1 when any filter changes
  };

  const handleClearAll = () => {
    setSearch("");
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  // A filter is "active" if any value differs from the default state.
  const hasActiveFilters =
    !!search ||
    !!filters.category ||
    !!filters.status ||
    !!filters.priority ||
    filters.sort !== "newest";

  return (
    <div>
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Community Issues
          </h1>
          {/* Show total only when not actively filtering — otherwise
              FilterBar shows its own result count */}
          {!hasActiveFilters && pagination && (
            <p className="text-sm text-gray-500 mt-1">
              {pagination.total} issue{pagination.total !== 1 ? "s" : ""}{" "}
              reported
            </p>
          )}
        </div>
        {isAuthenticated && (
          <Link
            to="/issues/new"
            className="flex items-center gap-2 bg-green-600 text-white text-sm
              font-medium px-4 py-2.5 rounded-lg hover:bg-green-700 transition-colors
              shrink-0"
          >
            <Plus size={16} />
            Report an Issue
          </Link>
        )}
      </div>

      {/* ── FilterBar — sticky, sits between header and grid ──────────── */}
      <FilterBar
        search={search}
        filters={filters}
        onSearchChange={handleSearchChange}
        onFilterChange={handleFilterChange}
        onClearAll={handleClearAll}
        hasActiveFilters={hasActiveFilters}
        totalResults={hasActiveFilters ? pagination?.total : undefined}
      />

      {/* ── Error state ─────────────────────────────────────────────────── */}
      {error && (
        <div
          className="bg-red-50 border border-red-200 text-red-700 text-sm
          rounded-lg p-4 mb-6"
        >
          {error}
        </div>
      )}

      {/* ── Issue grid ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          // Skeleton loaders — show 6 while any fetch is in progress
          Array.from({ length: 6 }).map((_, i) => <IssueCardSkeleton key={i} />)
        ) : issues.length > 0 ? (
          issues.map((issue) => <IssueCard key={issue._id} issue={issue} />)
        ) : (
          // Empty state — message differs based on whether filters are active
          <div className="col-span-full flex flex-col items-center text-center py-20">
            <div
              className="w-16 h-16 bg-gray-100 rounded-full flex items-center
              justify-center mb-4"
            >
              <ClipboardList size={24} className="text-gray-400" />
            </div>

            {hasActiveFilters ? (
              <>
                <h3 className="text-gray-900 font-medium mb-1">
                  No results found
                </h3>
                <p className="text-gray-500 text-sm mb-5">
                  Try adjusting your search or filters.
                </p>
                <button
                  onClick={handleClearAll}
                  className="text-sm text-green-600 hover:underline font-medium"
                >
                  Clear all filters
                </button>
              </>
            ) : (
              <>
                <h3 className="text-gray-900 font-medium mb-1">
                  No issues reported yet
                </h3>
                <p className="text-gray-500 text-sm mb-5">
                  Be the first to report a civic issue in your community.
                </p>
                {isAuthenticated && (
                  <Link
                    to="/issues/new"
                    className="bg-green-600 text-white text-sm font-medium px-5
                      py-2.5 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Report an issue
                  </Link>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Pagination ───────────────────────────────────────────────────── */}
      {!isLoading && pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            disabled={!pagination.hasPrev}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg
              hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed
              transition-colors"
          >
            ← Previous
          </button>

          {/* Page number pills */}
          <div className="flex items-center gap-1">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1)
              // Show max 5 page buttons: always show first, last, current,
              // and two neighbours. Shows "..." gaps for large page counts.
              .filter(
                (p) =>
                  p === 1 || p === pagination.pages || Math.abs(p - page) <= 1,
              )
              .reduce((acc, p, idx, arr) => {
                // Insert an ellipsis marker where there's a gap
                if (idx > 0 && p - arr[idx - 1] > 1) {
                  acc.push("...");
                }
                acc.push(p);
                return acc;
              }, [])
              .map((item, idx) =>
                item === "..." ? (
                  <span
                    key={`gap-${idx}`}
                    className="px-2 text-gray-400 text-sm"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setPage(item)}
                    className={`w-9 h-9 text-sm rounded-lg transition-colors
                      ${
                        page === item
                          ? "bg-green-600 text-white font-medium"
                          : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                  >
                    {item}
                  </button>
                ),
              )}
          </div>

          <button
            disabled={!pagination.hasNext}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg
              hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed
              transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default IssuesPage;
