import { useEffect, useState } from "react";
import { Users, Trash2 } from "lucide-react";
import { fetchAllUsers, deleteCitizenRequest } from "../../services/adminService.js";
import { timeAgo } from "../../utils/timeAgo.js";
import { TableRowSkeleton } from "../../components/ui/SkeletonLoader.jsx";
import useAuthStore from "../../store/useAuthStore.js";
import toast from "react-hot-toast";
import ConfirmDialog from "../../components/ui/ConfirmDialog.jsx";

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const { user: currentUser } = useAuthStore();
  const isSuperAdmin = currentUser?.role === "super_admin";
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      await deleteCitizenRequest(deleteTarget._id);
      toast.success("Citizen account deleted successfully");
      setUsers((prev) => prev.filter((u) => u._id !== deleteTarget._id));
      if (pagination) {
        setPagination((prev) => ({
          ...prev,
          total: Math.max(0, prev.total - 1),
        }));
      }
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete citizen account");
    } finally {
      setIsDeleting(false);
    }
  };



  useEffect(() => {
    let isMounted = true;
    Promise.resolve().then(() => {
      if (isMounted) setIsLoading(true);
    });
    fetchAllUsers({ page, limit: 15, role: "citizen" })
      .then((res) => {
        if (isMounted) {
          setUsers(res.users);
          setPagination(res.pagination);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError("Failed to load users");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [page]);

  return (
    <div>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0f172a] tracking-tight">
          Citizens
        </h1>
        {pagination && (
          <p className="text-sm text-[#64748b] mt-1">
            {pagination.total} registered account
            {pagination.total !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* ── Error ──────────────────────────────────────────────────────── */}
      {error && (
        <div
          className="bg-red-50 border-l-4 border-red-500 text-red-700 text-sm
          rounded-lg p-4 mb-4"
        >
          {error}
        </div>
      )}

      {/* ── Table ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                {[
                  "Citizen",
                  "Email",
                  "Role",
                  "Province",
                  "Phone",
                  "Joined",
                  ...(isSuperAdmin ? ["Actions"] : []),
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[10px] font-semibold text-[#94a3b8]
                      uppercase tracking-widest px-4 py-3 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f8fafc]">
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <TableRowSkeleton key={i} colCount={isSuperAdmin ? 7 : 6} />
                ))
              ) : users.length > 0 ? (
                users.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-[#f8fafc] transition-colors"
                  >
                    {/* Citizen — avatar + name */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-full bg-[#f0fdf4] border
                            border-[#bbf7d0] flex items-center justify-center shrink-0"
                        >
                          <span className="text-xs font-bold text-[#16a34a]">
                            {user.name?.[0]?.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-[#0f172a] whitespace-nowrap">
                          {user.name}
                        </p>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3.5">
                      <p className="text-sm text-[#475569]">{user.email}</p>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full
                          ${
                            user.role === "admin"
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : "bg-[#f1f5f9] text-[#64748b]"
                          }`}
                      >
                        {user.role}
                      </span>
                    </td>

                    {/* Province */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <p className="text-sm text-[#64748b]">
                        {user.province || "—"}
                      </p>
                    </td>

                    {/* Phone */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <p className="text-sm text-[#64748b]">
                        {user.phone ? `+977 ${user.phone}` : "—"}
                      </p>
                    </td>

                    {/* Joined */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <p className="text-xs text-[#94a3b8]">
                        {timeAgo(user.createdAt)}
                      </p>
                    </td>

                    {/* Actions */}
                    {isSuperAdmin && (
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <button
                          onClick={() => setDeleteTarget(user)}
                          disabled={isDeleting}
                          className="text-xs text-red-600 hover:text-red-800 hover:underline font-medium flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isSuperAdmin ? 7 : 6} className="px-4 py-20 text-center">
                    <Users size={32} className="text-[#e2e8f0] mx-auto mb-3" />
                    <p className="text-sm text-[#94a3b8]">No users found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div
            className="flex items-center justify-between px-4 py-3.5
            border-t border-[#e2e8f0]"
          >
            <p className="text-xs text-[#94a3b8]">
              Page {pagination.page} of {pagination.pages} · {pagination.total}{" "}
              users
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={!pagination.hasPrev}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 text-xs font-medium border border-[#e2e8f0]
                  rounded-lg hover:bg-[#f8fafc] text-[#475569] disabled:opacity-40
                  disabled:cursor-not-allowed transition-colors"
              >
                ← Prev
              </button>
              <button
                disabled={!pagination.hasNext}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 text-xs font-medium border border-[#e2e8f0]
                  rounded-lg hover:bg-[#f8fafc] text-[#475569] disabled:opacity-40
                  disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete citizen account?"
        description={`"${deleteTarget?.name}" (${deleteTarget?.email}) will be permanently deleted. This action cannot be undone.`}
        confirmLabel="Delete"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => !isDeleting && setDeleteTarget(null)}
      />
    </div>
  );
};

export default AdminUsersPage;
