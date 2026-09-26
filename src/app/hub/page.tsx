'use client';
import { supabase } from '@/lib/supabase';
import { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Search,
  Plus,
  Star,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Download,
  FileText,
  ExternalLink,
  Filter,
  X,
  RotateCcw,
  LogOut,
  User,
  RefreshCw,
  Upload,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/AuthModal';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AcademicResource {
  id: string;
  title: string;
  subject: string;
  department: 'CSE' | 'ECE' | 'EEE' | 'MECH' | 'CIVIL' | 'OTHER';
  semester: number;
  resource_type: 'Notes' | 'PYQ' | 'Lab Manual' | 'Link';
  file_format: 'PDF' | 'DOCX' | 'LINK';
  file_size: string;
  author: string;
  time_ago: string;
  upvotes: number;
  download_count: number;
  file_url: string;
  description?: string;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Mock data (fallback when DB is empty/unreachable)
// ---------------------------------------------------------------------------

const MOCK_RESOURCES: AcademicResource[] = [
  {
    id: 'res-1',
    title: 'Data Structures & Algorithms: Comprehensive Midterm Notes',
    subject: 'Data Structures (CS201)',
    department: 'CSE',
    semester: 3,
    resource_type: 'Notes',
    file_format: 'PDF',
    file_size: '4.8 MB',
    author: 'Prof. Arvind Sharma',
    time_ago: '2 days ago',
    upvotes: 42,
    download_count: 128,
    file_url: 'https://example.com/dsa-notes.pdf',
    description:
      'Covers balanced trees, graphs, dynamic programming patterns, and asymptotic complexity proofs.',
    created_at: '2026-09-24T10:00:00Z',
  },
  {
    id: 'res-2',
    title: 'Calculus II (MATH201) Past End-Term Examination & Solutions',
    subject: 'Advanced Engineering Math',
    department: 'OTHER',
    semester: 2,
    resource_type: 'PYQ',
    file_format: 'PDF',
    file_size: '1.9 MB',
    author: 'Math Dept Archive',
    time_ago: '4 days ago',
    upvotes: 35,
    download_count: 215,
    file_url: 'https://example.com/calculus-pastpaper.pdf',
    description:
      'Complete 2023-2025 question papers with handwritten step-by-step integral calculus solutions.',
    created_at: '2026-09-22T08:30:00Z',
  },
  {
    id: 'res-3',
    title: 'Digital Signal Processing Simulation & MATLAB Lab Manual',
    subject: 'DSP Systems (EC502)',
    department: 'ECE',
    semester: 5,
    resource_type: 'Lab Manual',
    file_format: 'PDF',
    file_size: '8.2 MB',
    author: 'Lab Instructor Rao',
    time_ago: '1 week ago',
    upvotes: 19,
    download_count: 84,
    file_url: 'https://example.com/dsp-lab-manual.pdf',
    description:
      'Experiments 1 through 10 covering FFT implementation, Butterworth filter design, and spectral analysis.',
    created_at: '2026-09-18T14:20:00Z',
  },
  {
    id: 'res-4',
    title: 'Operating Systems: Virtual Memory & Concurrency Guide',
    subject: 'Operating Systems (CS304)',
    department: 'CSE',
    semester: 4,
    resource_type: 'Notes',
    file_format: 'PDF',
    file_size: '3.6 MB',
    author: 'T.A. Priya Menon',
    time_ago: '3 days ago',
    upvotes: 56,
    download_count: 172,
    file_url: 'https://example.com/os-guide.pdf',
    description:
      'Detailed breakdowns of Peterson algorithm, semaphores, paging tables, and TLB miss simulations.',
    created_at: '2026-09-23T11:45:00Z',
  },
  {
    id: 'res-5',
    title: 'Microprocessors & 8086 Assembly Language Quick Reference',
    subject: 'Computer Architecture (EC403)',
    department: 'ECE',
    semester: 4,
    resource_type: 'Notes',
    file_format: 'PDF',
    file_size: '2.1 MB',
    author: 'Devendra K.',
    time_ago: '5 days ago',
    upvotes: 27,
    download_count: 98,
    file_url: 'https://example.com/8086-reference.pdf',
    description:
      'Register layout diagram, opcodes cheat sheet, and interrupt vector tables.',
    created_at: '2026-09-21T09:15:00Z',
  },
  {
    id: 'res-6',
    title: 'Fluid Mechanics & Hydraulic Machines 4-Year PYQ Bank',
    subject: 'Fluid Dynamics (ME302)',
    department: 'MECH',
    semester: 4,
    resource_type: 'PYQ',
    file_format: 'PDF',
    file_size: '5.7 MB',
    author: 'Mech Academic Committee',
    time_ago: '2 weeks ago',
    upvotes: 18,
    download_count: 67,
    file_url: 'https://example.com/fluid-mechanics-pyq.pdf',
    description:
      'Compiled university semester question papers with marked weightage analysis and boundary layer problems.',
    created_at: '2026-09-12T16:00:00Z',
  },
  {
    id: 'res-7',
    title: 'Electrical Machines-I Laboratory Protocols & Graph Templates',
    subject: 'Power Systems & Machinery (EE301)',
    department: 'EEE',
    semester: 3,
    resource_type: 'Lab Manual',
    file_format: 'PDF',
    file_size: '6.4 MB',
    author: 'Dr. K. Nambiar',
    time_ago: '6 days ago',
    upvotes: 24,
    download_count: 110,
    file_url: 'https://example.com/ee-machines-manual.pdf',
    description:
      'Load characteristics tests for DC shunt motors and single-phase transformers.',
    created_at: '2026-09-20T13:00:00Z',
  },
  {
    id: 'res-8',
    title: 'Structural Analysis & Reinforced Concrete Design Notes',
    subject: 'Structural Engineering (CE501)',
    department: 'CIVIL',
    semester: 5,
    resource_type: 'Notes',
    file_format: 'PDF',
    file_size: '7.1 MB',
    author: 'Civil Faculty Board',
    time_ago: '1 week ago',
    upvotes: 22,
    download_count: 76,
    file_url: 'https://example.com/structural-analysis.pdf',
    description:
      'Moment distribution method, shear force bending moment envelopes, and limit state principles.',
    created_at: '2026-09-17T15:30:00Z',
  },
  {
    id: 'res-9',
    title: 'Interactive Algorithm Visualizer & Visual Proofs Portal',
    subject: 'Computer Science Core',
    department: 'CSE',
    semester: 3,
    resource_type: 'Link',
    file_format: 'LINK',
    file_size: 'Web Tool',
    author: 'Campus Open Source Guild',
    time_ago: '1 day ago',
    upvotes: 68,
    download_count: 340,
    file_url: 'https://visualgo.net',
    description:
      'Community-recommended interactive sandbox for pathfinding, sorting, and red-black tree operations.',
    created_at: '2026-09-25T14:10:00Z',
  },
  {
    id: 'res-10',
    title: 'Control Systems Engineering Formula & Stability Matrix',
    subject: 'Control Systems (EE503)',
    department: 'EEE',
    semester: 5,
    resource_type: 'Notes',
    file_format: 'PDF',
    file_size: '1.2 MB',
    author: 'S. Varma',
    time_ago: '3 weeks ago',
    upvotes: 31,
    download_count: 145,
    file_url: 'https://example.com/control-systems-cheat-sheet.pdf',
    description:
      'Routh-Hurwitz criterion, Root Locus plotting rules, Nyquist stability, and Bode plot guidelines.',
    created_at: '2026-09-05T12:00:00Z',
  },
  {
    id: 'res-11',
    title: 'Thermodynamics End-Term Exam Paper with Model Answers',
    subject: 'Thermodynamics (ME301)',
    department: 'MECH',
    semester: 3,
    resource_type: 'PYQ',
    file_format: 'PDF',
    file_size: '3.4 MB',
    author: 'Central Exam Vault',
    time_ago: '2 weeks ago',
    upvotes: 25,
    download_count: 88,
    file_url: 'https://example.com/thermo-exam.pdf',
    description:
      'Complete solutions for Rankine cycle, Otto cycle, and refrigeration psychrometric calculations.',
    created_at: '2026-09-10T10:00:00Z',
  },
  {
    id: 'res-12',
    title: 'Surveying & Geomatics Field Practical Observations Manual',
    subject: 'Geomatics Engineering (CE304)',
    department: 'CIVIL',
    semester: 3,
    resource_type: 'Lab Manual',
    file_format: 'PDF',
    file_size: '4.5 MB',
    author: 'Surveying Lab Tech',
    time_ago: '1 month ago',
    upvotes: 14,
    download_count: 53,
    file_url: 'https://example.com/surveying-manual.pdf',
    description:
      'Theodolite traverse calculation sheets, leveling reductions, and total station fieldwork protocols.',
    created_at: '2026-08-28T09:00:00Z',
  },
];

const DEPARTMENTS = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'OTHER'] as const;
export type Department = (typeof DEPARTMENTS)[number];
const RESOURCE_TYPES = ['Notes', 'PYQ', 'Lab Manual', 'Link'] as const;

// ---------------------------------------------------------------------------
// Avatar helper
// ---------------------------------------------------------------------------

function AvatarInitials({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
  return (
    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold select-none">
      {initials}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Hub Page
// ---------------------------------------------------------------------------

export default function HubPage() {
  const router = useRouter();
  const { isLoggedIn, user, logout, switchAccount } = useAuth();

  // Resources state
  const [resources, setResources] = useState<AcademicResource[]>([]);
  const [isLoadingResources, setIsLoadingResources] = useState(true);

  // Filter states
  const [search, setSearch] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [selectedSemester, setSelectedSemester] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('newest');

  // Bookmark & vote tracking
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(['res-1', 'res-4']);
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down'>>({});
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);

  // UI states
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAvatarDropdownOpen, setIsAvatarDropdownOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    title: '',
    subject: '',
    department: 'CSE' as Department,
    semester: 1,
    resource_type: 'Notes' as AcademicResource['resource_type'],
  });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Dropdown ref for click-outside
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsAvatarDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch resources from Supabase on mount
  useEffect(() => {
    const fetchResources = async () => {
      setIsLoadingResources(true);
      try {
        const { data, error } = await supabase
          .from('resources')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('[Hub] Failed to load resources from Supabase:', error);
          setResources(MOCK_RESOURCES);
        } else {
          setResources(data && data.length > 0 ? data : MOCK_RESOURCES);
        }
      } catch (err) {
        console.error('[Hub] Unexpected error fetching resources:', err);
        setResources(MOCK_RESOURCES);
      } finally {
        setIsLoadingResources(false);
      }
    };

    fetchResources();
  }, []);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleVote = (id: string, direction: 'up' | 'down') => {
    const currentVote = userVotes[id];
    let diff = 0;
    if (currentVote === direction) {
      diff = direction === 'up' ? -1 : 1;
      setUserVotes((prev) => { const next = { ...prev }; delete next[id]; return next; });
    } else if (currentVote) {
      diff = direction === 'up' ? 2 : -2;
      setUserVotes((prev) => ({ ...prev, [id]: direction }));
    } else {
      diff = direction === 'up' ? 1 : -1;
      setUserVotes((prev) => ({ ...prev, [id]: direction }));
    }
    setResources((prev) =>
      prev.map((r) => (r.id === id ? { ...r, upvotes: r.upvotes + diff } : r))
    );
  };

  /** Guard: upload button requires login */
  const handleUploadClick = () => {
    if (!isLoggedIn) {
      setIsAuthModalOpen(true);
    } else {
      setIsUploadOpen(true);
    }
  };

  const handleSignOut = () => {
    logout();
    setIsAvatarDropdownOpen(false);
    router.push('/');
  };

  const handleSwitchAccount = () => {
    switchAccount();
    setIsAvatarDropdownOpen(false);
  };

  const resetFilters = () => {
    setSelectedDepartment('All');
    setSelectedSemester('All');
    setSelectedType('All');
    setShowBookmarkedOnly(false);
    setSearch('');
  };

  /** Real upload handler: Storage + DB insert */
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      alert('Please select a file.');
      return;
    }

    setIsUploading(true);
    try {
      // 1. Determine file format
      const ext = (uploadFile.name.split('.').pop() ?? 'PDF').toUpperCase();
      const fileFormat: AcademicResource['file_format'] =
        ext === 'DOCX' ? 'DOCX' : ext === 'PDF' ? 'PDF' : 'PDF';

      // 2. Upload to Supabase Storage
      const filePath = `${Date.now()}-${uploadFile.name.replace(/\s+/g, '_')}`;
      console.log('[Upload] Uploading to storage:', filePath);

      const { error: uploadError } = await supabase.storage
        .from('resource-files')
        .upload(filePath, uploadFile, { upsert: false });

      if (uploadError) throw uploadError;

      // 3. Get public URL
      const { data: urlData } = supabase.storage
        .from('resource-files')
        .getPublicUrl(filePath);

      const fileUrl = urlData.publicUrl;
      console.log('[Upload] File uploaded. Public URL:', fileUrl);

      // 4. Insert metadata row into resources table
      const { data: inserted, error: dbError } = await supabase
        .from('resources')
        .insert([
          {
            title: uploadForm.title,
            subject: uploadForm.subject,
            department: uploadForm.department,
            semester: uploadForm.semester,
            resource_type: uploadForm.resource_type,
            file_format: fileFormat,
            file_size: `${(uploadFile.size / 1024 / 1024).toFixed(1)} MB`,
            author: user?.userName ?? 'Anonymous',
            time_ago: 'Just now',
            upvotes: 0,
            download_count: 0,
            file_url: fileUrl,
            description: '',
          },
        ])
        .select()
        .single();

      if (dbError) throw dbError;

      console.log('[Upload] DB row inserted:', inserted);

      // 5. Prepend to state for instant UI update
      setResources((prev) => [inserted as AcademicResource, ...prev]);

      // 6. Reset & close
      setUploadForm({
        title: '',
        subject: '',
        department: 'CSE',
        semester: 1,
        resource_type: 'Notes',
      });
      setUploadFile(null);
      setIsUploadOpen(false);
      alert('Resource uploaded successfully!');
    } catch (err: any) {
      console.error('=== UPLOAD FAILED ===');
      console.error('Raw error:', err);
      console.error('Message:', err?.message);
      console.error('Code:', err?.code);
      console.error('Status:', err?.status || err?.statusCode);
      console.error('Details:', err?.details);
      console.error('Hint:', err?.hint);
      console.error('======================');
      alert(`Upload failed: ${err?.message ?? err?.error_description ?? JSON.stringify(err)}`);
    } finally {
      setIsUploading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Derived state
  // ---------------------------------------------------------------------------

  const filteredResources = useMemo(() => {
    return resources
      .filter((item) => {
        const matchSearch =
          !search ||
          item.title.toLowerCase().includes(search.toLowerCase()) ||
          item.subject.toLowerCase().includes(search.toLowerCase()) ||
          item.author.toLowerCase().includes(search.toLowerCase());
        const matchDept = selectedDepartment === 'All' || item.department === selectedDepartment;
        const matchSem = selectedSemester === 'All' || item.semester.toString() === selectedSemester;
        const matchType = selectedType === 'All' || item.resource_type === selectedType;
        const matchBookmark = !showBookmarkedOnly || bookmarkedIds.includes(item.id);
        return matchSearch && matchDept && matchSem && matchType && matchBookmark;
      })
      .sort((a, b) => {
        if (sortBy === 'popular') return b.upvotes - a.upvotes;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [resources, search, selectedDepartment, selectedSemester, selectedType, showBookmarkedOnly, bookmarkedIds, sortBy]);

  const isFiltered =
    selectedDepartment !== 'All' ||
    selectedSemester !== 'All' ||
    selectedType !== 'All' ||
    showBookmarkedOnly ||
    search !== '';

  const getDepartmentChip = (dept: string) => {
    switch (dept) {
      case 'CSE': case 'ECE': case 'EEE': case 'MECH': case 'CIVIL':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-slate-800 flex flex-col font-sans">

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 h-16 px-4 sm:px-8 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-3">
          <button onClick={() => router.push('/')} className="flex items-center space-x-2 hover:opacity-80 transition">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-4 h-4 text-white" strokeWidth={1.5} />
            </div>
            <span className="font-semibold text-sm tracking-tight text-slate-800">CampusHub</span>
          </button>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
            v2.0
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="md:hidden flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition"
          >
            <Filter className="w-3.5 h-3.5 text-slate-500" strokeWidth={1.5} />
            <span>Filters</span>
          </button>

          <button
            id="upload-resource-btn"
            onClick={handleUploadClick}
            className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-4 py-2 rounded-lg shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" strokeWidth={1.5} />
            <span>Upload Resource</span>
          </button>

          {isLoggedIn && user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                id="avatar-btn"
                onClick={() => setIsAvatarDropdownOpen((o) => !o)}
                className="rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 hover:opacity-90 transition"
                aria-label="Account menu"
              >
                <AvatarInitials name={user.userName} />
              </button>

              {isAvatarDropdownOpen && (
                <div className="absolute right-0 top-10 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-800 truncate">
                      {user.userName}
                    </p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {user.userEmail}
                    </p>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => { setShowBookmarkedOnly(true); setIsAvatarDropdownOpen(false); }}
                      className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition text-left"
                    >
                      <Star className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.5} />
                      <span>My Favorites</span>
                      <span className="ml-auto text-xs text-slate-400">{bookmarkedIds.length}</span>
                    </button>
                    <button
                      onClick={() => { handleUploadClick(); setIsAvatarDropdownOpen(false); }}
                      className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition text-left"
                    >
                      <Upload className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.5} />
                      <span>My Uploads</span>
                    </button>
                    <button
                      onClick={handleSwitchAccount}
                      className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition text-left"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.5} />
                      <span>Switch Account</span>
                    </button>
                  </div>

                  <div className="border-t border-slate-100 py-1">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center space-x-1.5 text-xs font-medium text-slate-700 border border-slate-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition"
            >
              <User className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="flex-1 flex max-w-full">

        <aside
          className={`${
            isMobileSidebarOpen ? 'fixed inset-y-16 left-0 z-30 shadow-lg' : 'hidden'
          } md:flex flex-col w-64 shrink-0 bg-white border-r border-slate-200 p-5 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto`}
        >
          <div className="space-y-6">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 px-1">
                Library
              </div>
              <button
                id="header-bookmarks-toggle"
                onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                  showBookmarkedOnly
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Star
                    className={`w-4 h-4 ${showBookmarkedOnly ? 'fill-blue-600 text-blue-600' : 'text-slate-400'}`}
                    strokeWidth={1.5}
                  />
                  <span>My Favorites</span>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {bookmarkedIds.length}
                </span>
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Department
                </span>
                {selectedDepartment !== 'All' && (
                  <button
                    onClick={() => setSelectedDepartment('All')}
                    className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedDepartment('All')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer flex items-center justify-between ${
                    selectedDepartment === 'All'
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>All Departments</span>
                  <span className="text-xs text-slate-400">{resources.length}</span>
                </button>
                {DEPARTMENTS.map((dept) => {
                  const count = resources.filter((r) => r.department === dept).length;
                  const isSelected = selectedDepartment === dept;
                  return (
                    <button
                      key={dept}
                      onClick={() => setSelectedDepartment(dept)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-50 text-blue-700 font-semibold'
                          : 'text-slate-600 hover:bg-slate-50 font-normal'
                      }`}
                    >
                      <span className="flex items-center space-x-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-blue-600' : 'bg-slate-300'}`} />
                        <span>{dept}</span>
                      </span>
                      <span className="text-xs text-slate-400">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 px-1">
                Semester
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                <button
                  onClick={() => setSelectedSemester('All')}
                  className={`py-1.5 px-2 text-xs rounded-lg border text-center transition cursor-pointer ${
                    selectedSemester === 'All'
                      ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  All
                </button>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <button
                    key={sem}
                    onClick={() => setSelectedSemester(sem.toString())}
                    className={`py-1.5 px-2 text-xs rounded-lg border text-center transition cursor-pointer ${
                      selectedSemester === sem.toString()
                        ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    S{sem}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 px-1">
                Resource Type
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedType('All')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer flex items-center justify-between ${
                    selectedType === 'All'
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>All Types</span>
                  <span className="text-xs text-slate-400">{resources.length}</span>
                </button>
                {RESOURCE_TYPES.map((t) => {
                  const count = resources.filter((r) => r.resource_type === t).length;
                  const isSelected = selectedType === t;
                  return (
                    <button
                      key={t}
                      onClick={() => setSelectedType(t)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-50 text-blue-700 font-semibold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{t}</span>
                      <span className="text-xs text-slate-400">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {isFiltered && (
              <div className="pt-2 border-t border-slate-200">
                <button
                  onClick={resetFilters}
                  className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" strokeWidth={1.5} />
                  <span>Reset All Filters</span>
                </button>
              </div>
            )}
          </div>
        </aside>

        <main className="flex-1 p-6 sm:p-8 max-w-7xl">
          <div className="sticky top-16 z-20 bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" strokeWidth={1.5} />
              <input
                id="search-resources-input"
                type="text"
                placeholder="Search resources, topics, authors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-9 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition shadow-2xs"
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

            <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
              <span className="text-xs text-slate-500 whitespace-nowrap">
                Showing <strong className="text-slate-800 font-semibold">{filteredResources.length}</strong> resources
              </span>
              <div className="flex items-center space-x-2">
                <label htmlFor="filter-sort" className="text-xs text-slate-500 hidden xs:inline">
                  Sort:
                </label>
                <select
                  id="filter-sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'newest' | 'popular')}
                  className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
                >
                  <option value="newest">Newest</option>
                  <option value="popular">Top Voted</option>
                </select>
              </div>
            </div>
          </div>

          {isFiltered && (
            <div className="flex flex-wrap items-center gap-2 mb-5 text-xs text-slate-600">
              <span className="text-xs text-slate-400 font-medium">Active filters:</span>
              {selectedDepartment !== 'All' && (
                <span className="inline-flex items-center space-x-1.5 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full text-xs text-blue-700 shadow-2xs">
                  <span>Dept: {selectedDepartment}</span>
                  <button onClick={() => setSelectedDepartment('All')} className="hover:text-blue-900">×</button>
                </span>
              )}
              {selectedSemester !== 'All' && (
                <span className="inline-flex items-center space-x-1.5 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full text-xs text-blue-700 shadow-2xs">
                  <span>Sem {selectedSemester}</span>
                  <button onClick={() => setSelectedSemester('All')} className="hover:text-blue-900">×</button>
                </span>
              )}
              {selectedType !== 'All' && (
                <span className="inline-flex items-center space-x-1.5 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full text-xs text-blue-700 shadow-2xs">
                  <span>Type: {selectedType}</span>
                  <button onClick={() => setSelectedType('All')} className="hover:text-blue-900">×</button>
                </span>
              )}
              {showBookmarkedOnly && (
                <span className="inline-flex items-center space-x-1.5 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full text-xs text-blue-700 shadow-2xs">
                  <span>Favorites</span>
                  <button onClick={() => setShowBookmarkedOnly(false)} className="hover:text-blue-900">×</button>
                </span>
              )}
              {search && (
                <span className="inline-flex items-center space-x-1.5 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full text-xs text-slate-700 shadow-2xs">
                  <span>&quot;{search}&quot;</span>
                  <button onClick={() => setSearch('')} className="hover:text-slate-900">×</button>
                </span>
              )}
              <button
                onClick={resetFilters}
                className="text-xs text-blue-600 hover:text-blue-700 hover:underline ml-1 font-medium"
              >
                Clear all
              </button>
            </div>
          )}

          {isLoadingResources ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-14 text-center shadow-xs">
              <RefreshCw className="w-10 h-10 text-blue-400 mx-auto mb-3 animate-spin" strokeWidth={1.5} />
              <h3 className="text-base font-semibold text-slate-800">Loading resources…</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                Fetching the latest study materials from the cooperative hub.
              </p>
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-14 text-center shadow-xs">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" strokeWidth={1.5} />
              <h3 className="text-base font-semibold text-slate-800">No matching resources found</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                Try adjusting your search criteria or clearing active filters to browse other materials.
              </p>
              <button
                onClick={resetFilters}
                className="mt-5 px-4 py-2 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((item) => {
                const isBookmarked = bookmarkedIds.includes(item.id);
                const vote = userVotes[item.id];
                const isPDF = item.file_format === 'PDF';

                return (
                  <div
                    key={item.id}
                    id={`resource-card-${item.id}`}
                    className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-md border ${getDepartmentChip(item.department)}`}>
                            {item.department}
                          </span>
                          <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                            Sem {item.semester}
                          </span>
                          <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                            {item.file_format}
                          </span>
                        </div>
                        <button
                          onClick={() => toggleBookmark(item.id)}
                          className={`p-1.5 rounded-lg hover:bg-blue-50 transition cursor-pointer ${
                            isBookmarked ? 'text-blue-600' : 'text-slate-300 hover:text-slate-500'
                          }`}
                          title={isBookmarked ? 'Remove bookmark' : 'Bookmark resource'}
                          aria-label="Bookmark resource"
                        >
                          <Star
                            className={`w-4 h-4 ${isBookmarked ? 'fill-blue-600 text-blue-600' : ''}`}
                            strokeWidth={1.5}
                          />
                        </button>
                      </div>

                      <div>
                        <h3
                          className="text-base font-semibold text-slate-800 leading-snug line-clamp-2 hover:text-blue-600 transition-colors"
                          title={item.title}
                        >
                          {item.title}
                        </h3>
                        <p className="text-xs font-medium text-slate-500 mt-1">{item.subject}</p>
                      </div>

                      {item.description && (
                        <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <div className="text-xs text-slate-500 flex items-center flex-wrap gap-x-2">
                        <span className="truncate max-w-[130px] font-medium text-slate-700" title={item.author}>
                          {item.author}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span>{item.time_ago}</span>
                        <span className="text-slate-300">•</span>
                        <span>{item.file_size}</span>
                      </div>

                      <div className="flex justify-between items-center pt-1">
                        <div className="inline-flex items-center bg-slate-50 border border-slate-200 rounded-lg px-1.5 py-1 space-x-1 shadow-2xs">
                          <button
                            onClick={() => handleVote(item.id, 'up')}
                            className={`p-0.5 rounded hover:bg-slate-200/60 transition cursor-pointer ${
                              vote === 'up' ? 'text-blue-600 font-semibold' : 'text-slate-400 hover:text-blue-600'
                            }`}
                            title="Upvote"
                            aria-label="Upvote"
                          >
                            <ChevronUp className="w-4 h-4" strokeWidth={1.5} />
                          </button>
                          <span className="text-xs font-semibold text-slate-800 px-1 min-w-[20px] text-center">
                            {item.upvotes}
                          </span>
                          <button
                            onClick={() => handleVote(item.id, 'down')}
                            className={`p-0.5 rounded hover:bg-slate-200/60 transition cursor-pointer ${
                              vote === 'down' ? 'text-slate-700 font-semibold' : 'text-slate-400 hover:text-slate-600'
                            }`}
                            title="Downvote"
                            aria-label="Downvote"
                          >
                            <ChevronDown className="w-4 h-4" strokeWidth={1.5} />
                          </button>
                        </div>

                        <div className="flex items-center space-x-2">
                          {isPDF && (
                            <button
                              type="button"
                              className="inline-flex items-center space-x-1.5 text-xs font-medium text-blue-700 hover:text-blue-800 bg-blue-50/60 hover:bg-blue-100/70 border border-blue-200 hover:border-blue-300 px-3 py-1.5 rounded-lg transition shadow-2xs cursor-pointer"
                              title="AI Summarize, Flashcards & Practice Problems"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-blue-600" strokeWidth={1.5} />
                              <span>AI Study Tools</span>
                            </button>
                          )}
                          <a
                            href={item.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center space-x-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 rounded-lg transition shadow-xs cursor-pointer"
                            title="Open or download resource"
                          >
                            {item.file_format === 'LINK' ? (
                              <ExternalLink className="w-3.5 h-3.5 text-white" strokeWidth={1.5} />
                            ) : (
                              <Download className="w-3.5 h-3.5 text-white" strokeWidth={1.5} />
                            )}
                            <span>Open</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* UPLOAD MODAL */}
      {isUploadOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md p-6 shadow-xl relative">
            <button
              onClick={() => setIsUploadOpen(false)}
              disabled={isUploading}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition disabled:opacity-50"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
            </button>

            <div className="flex items-center space-x-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Plus className="w-4 h-4" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-800">Upload Academic Resource</h3>
                <p className="text-xs text-slate-500">Share study notes, past papers, or lab manuals.</p>
              </div>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Title</label>
                <input
                  required
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  placeholder="e.g., Computer Networks Midterm Review"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Subject</label>
                <input
                  required
                  type="text"
                  value={uploadForm.subject}
                  onChange={(e) => setUploadForm({ ...uploadForm, subject: e.target.value })}
                  placeholder="e.g., Computer Networks (CS401)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">Department</label>
                  <select
                    value={uploadForm.department}
                    onChange={(e) => setUploadForm({ ...uploadForm, department: e.target.value as Department })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 cursor-pointer"
                  >
                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-800 mb-1">Semester</label>
                  <select
                    value={uploadForm.semester}
                    onChange={(e) => setUploadForm({ ...uploadForm, semester: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">Type</label>
                <select
                  value={uploadForm.resource_type}
                  onChange={(e) =>
                    setUploadForm({
                      ...uploadForm,
                      resource_type: e.target.value as AcademicResource['resource_type'],
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 cursor-pointer"
                >
                  {RESOURCE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-800 mb-1">File Attachment</label>
                <input
                  required
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.zip"
                  onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                />
                <p className="text-[10px] text-slate-400 mt-1">Accepted: PDF, DOC, DOCX, TXT, PPT, PPTX, ZIP</p>
              </div>
              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  disabled={isUploading}
                  className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 border border-slate-200 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-2 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? 'Uploading…' : 'Upload File'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultTab="login"
      />
    </div>
  );
}