'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Trash2,
  RefreshCw,
  ArrowLeft,
  Search,
  X,
  AlertTriangle,
  FileText,
  BookOpen,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { isAdmin, getUserName, getUserEmail } from '@/lib/admin';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AdminResource {
  id: string;
  title: string;
  subject: string;
  department: string;
  semester: number;
  resource_type: string;
  file_format: string;
  file_size: string;
  author: string;
  file_url: string;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Admin Page
// ---------------------------------------------------------------------------

export default function AdminPage() {
  const router = useRouter();
  const { isLoggedIn, user, logout } = useAuth();

  const [resources, setResources] = useState<AdminResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AdminResource | null>(null);

  const adminEmail = getUserEmail(user);
  const adminName = getUserName(user);
  const userIsAdmin = isAdmin(user);

  // -------------------------------------------------------------------------
  // Guard: kick out non-admins
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/hub');
      return;
    }
    if (!userIsAdmin) {
      // Log them out and send to hub — they shouldn't even see this URL
      alert('Access denied. This page is for administrators only.');
      router.replace('/hub');
    }
  }, [isLoggedIn, userIsAdmin, router]);

  // -------------------------------------------------------------------------
  // Fetch all resources
  // -------------------------------------------------------------------------
  const fetchResources = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[Admin] Failed to load resources:', error);
        setResources([]);
      } else {
        setResources((data as AdminResource[]) || []);
      }
    } catch (err) {
      console.error('[Admin] Unexpected error:', err);
      setResources([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userIsAdmin) {
      fetchResources();
    }
  }, [userIsAdmin]);

  // -------------------------------------------------------------------------
  // Delete resource (Storage file + DB row)
  // -------------------------------------------------------------------------
  const handleDelete = async (resource: AdminResource) => {
    setDeletingId(resource.id);
    try {
      // 1. Extract the storage file path from the public URL
      let filePath: string | null = null;
      if (resource.file_url && resource.file_url.includes('/resource-files/')) {
        filePath = resource.file_url.split('/resource-files/')[1];
      }

      // 2. Delete the file from Storage (ignore errors if it was already removed)
      if (filePath) {
        const { error: storageError } = await supabase.storage
          .from('resource-files')
          .remove([filePath]);

        if (storageError) {
          console.warn('[Admin] Storage delete failed (continuing):', storageError);
        }
      }

      // 3. Delete the DB row
      const { error: dbError } = await supabase
        .from('resources')
        .delete()
        .eq('id', resource.id);

      if (dbError) throw dbError;

      // 4. Remove from local state
      setResources((prev) => prev.filter((r) => r.id !== resource.id));
      setConfirmDelete(null);
      alert(`Deleted: "${resource.title}"`);
    } catch (err: any) {
      console.error('=== DELETE FAILED ===');
      console.error('Raw:', err);
      console.error('Message:', err?.message);
      console.error('Code:', err?.code);
      console.error('====================');
      alert(`Delete failed: ${err?.message ?? 'Unknown error'}`);
    } finally {
      setDeletingId(null);
    }
  };

  // -------------------------------------------------------------------------
  // Filtered list
  // -------------------------------------------------------------------------
  const filteredResources = useMemo(() => {
    if (!search.trim()) return resources;
    const q = search.toLowerCase();
    return resources.filter(
      (r) =>
        r.title?.toLowerCase().includes(q) ||
        r.author?.toLowerCase().includes(q) ||
        r.subject?.toLowerCase().includes(q) ||
        r.department?.toLowerCase().includes(q)
    );
  }, [resources, search]);

  // -------------------------------------------------------------------------
  // Early return while guard runs
  // -------------------------------------------------------------------------
  if (!isLoggedIn || !userIsAdmin) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm max-w-md">
          <Shield className="w-10 h-10 text-red-500 mx-auto mb-3" strokeWidth={1.5} />
          <h2 className="text-base font-semibold text-slate-800">Access Denied</h2>
          <p className="text-sm text-slate-500 mt-1">
            You don&apos;t have administrator access to this page.
          </p>
          <button
            onClick={() => router.push('/hub')}
            className="mt-5 px-4 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            Back to Hub
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#F4F7FB] text-slate-800 flex flex-col font-sans">

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 h-16 px-4 sm:px-8 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.push('/hub')}
            className="flex items-center space-x-2 hover:opacity-80 transition"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <span className="font-semibold text-sm tracking-tight text-slate-800">CampusHub</span>
          </button>

          <span className="inline-flex items-center space-x-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
            <Shield className="w-3 h-3" strokeWidth={2} />
            <span>ADMIN</span>
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.push('/hub')}
            className="flex items-center space-x-1.5 text-xs font-medium text-slate-700 border border-slate-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Back to Hub</span>
          </button>

          <div className="hidden sm:flex flex-col items-end leading-tight">
            <span className="text-xs font-semibold text-slate-800 truncate max-w-[180px]">
              {adminName ?? 'Admin'}
            </span>
            <span className="text-[10px] text-slate-500 truncate max-w-[180px]">
              {adminEmail}
            </span>
          </div>

          <button
            onClick={() => {
              logout();
              router.push('/');
            }}
            className="flex items-center space-x-1.5 text-xs font-medium text-red-600 border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-lg transition"
          >
            <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full">

        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-slate-800 flex items-center space-x-2">
            <Shield className="w-5 h-5 text-blue-600" strokeWidth={2} />
            <span>Admin Control Panel</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Moderate uploaded resources. Delete anything that violates community rules.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Resources</div>
            <div className="text-2xl font-bold text-slate-800 mt-1">{resources.length}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Showing</div>
            <div className="text-2xl font-bold text-slate-800 mt-1">{filteredResources.length}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Admin</div>
            <div className="text-sm font-semibold text-slate-800 mt-2 truncate" title={adminEmail ?? ''}>
              {adminEmail}
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Search by title, author, subject, or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-9 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            )}
          </div>

          <button
            onClick={fetchResources}
            disabled={isLoading}
            className="flex items-center space-x-1.5 text-xs font-medium text-slate-700 border border-slate-200 hover:bg-slate-50 px-3 py-2 rounded-lg transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} strokeWidth={1.5} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-14 text-center shadow-xs">
            <RefreshCw className="w-10 h-10 text-blue-400 mx-auto mb-3 animate-spin" strokeWidth={1.5} />
            <h3 className="text-base font-semibold text-slate-800">Loading resources…</h3>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-14 text-center shadow-xs">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" strokeWidth={1.5} />
            <h3 className="text-base font-semibold text-slate-800">No resources found</h3>
            <p className="text-sm text-slate-500 mt-1">
              {search ? 'Try a different search term.' : 'Nothing has been uploaded yet.'}
            </p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Title</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Author</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Dept / Sem</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Format</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Date</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredResources.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-4 py-3 max-w-xs">
                        <div className="font-medium text-slate-800 truncate" title={r.title}>
                          {r.title}
                        </div>
                        <div className="text-xs text-slate-500 truncate" title={r.subject}>
                          {r.subject}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 max-w-[150px] truncate" title={r.author}>
                        {r.author}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-slate-600">{r.department}</div>
                        <div className="text-[11px] text-slate-400">Sem {r.semester}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                          {r.file_format}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                        {r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setConfirmDelete(r)}
                          disabled={deletingId === r.id}
                          className="inline-flex items-center space-x-1 text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                          <span>{deletingId === r.id ? 'Deleting…' : 'Delete'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* CONFIRM DELETE MODAL */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md p-6 shadow-xl relative">
            <button
              onClick={() => setConfirmDelete(null)}
              disabled={deletingId !== null}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition disabled:opacity-50"
              aria-label="Close"
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
            </button>

            <div className="flex items-start space-x-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center border border-red-100 shrink-0">
                <AlertTriangle className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-slate-800">Delete this resource?</h3>
                <p className="text-xs text-slate-500 mt-1">
                  This will permanently remove the file and its record. This cannot be undone.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-5">
              <div className="text-xs font-semibold text-slate-800 truncate" title={confirmDelete.title}>
                {confirmDelete.title}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                by {confirmDelete.author} • {confirmDelete.department} • Sem {confirmDelete.semester}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                disabled={deletingId !== null}
                className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 border border-slate-200 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirmDelete)}
                disabled={deletingId !== null}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-red-600 hover:bg-red-700 text-white shadow-xs transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>{deletingId ? 'Deleting…' : 'Delete Permanently'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}