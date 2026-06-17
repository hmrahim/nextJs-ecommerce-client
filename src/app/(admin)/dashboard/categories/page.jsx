// 📁 PATH: src/app/(admin)/dashboard/categories/page.jsx

'use client';
import { useState } from 'react';
import { categoryService } from '@/services/categoryService';
import CategoryTree from '@/components/admin/categories/CategoryTree';
import CategoryFormModal from '@/components/admin/categories/CategoryFormModal';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

// ── Flatten tree → flat list ───────────────────────────────────────────────────
function flattenTree(nodes, depth = 0) {
  return nodes.flatMap(n => [{ ...n, depth }, ...flattenTree(n.children || [], depth + 1)]);
}

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [parentFor, setParentFor] = useState(null);

  // ── useQuery by real data fetch ─────────────────────────────────────────
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-categories'],
    queryFn:  categoryService.adminGetTree,
    retry: 1,
     refetchOnWindowFocus: true,
  });
 

const raw  = data?.data?.data ?? [];
const tree = Array.isArray(raw) ? raw : [];
  const refetch = () => queryClient.invalidateQueries({ queryKey: ['admin-categories'] });

  // ── CRUD handlers ──────────────────────────────────────────────────────────
  const handleSave = async (formData) => {
    try {
      if (editing) {
        await categoryService.adminUpdate(editing._id, formData);
      } else {
        await categoryService.adminCreate(formData);
      }
      refetch();
    } catch (err) {
      console.error('[handleSave]', err);
    } finally {
      setModalOpen(false);
      setEditing(null);
      setParentFor(null);
    }
  };
const deleteMutation = useMutation({
  mutationFn:(id)=> categoryService.adminDelete(id),
  onSuccess: () => {
     toast.success('Category deleted successfully!')
     refetch();
  }
})
const toggleMutation = useMutation({
  mutationFn:(id)=> categoryService.adminToggle(id),
  onSuccess: (res) => {
 res?.data?.data?.isActive ? toast.success("Category activated!") : toast.error("Category deactivated!")
     
     
     refetch();
  }
})


  const handleDelete = async (id) => {
    try {
     deleteMutation.mutate(id);
    } catch (err) {
      console.error('[handleDelete]', err);
    }
  };

  const handleToggle = async (id) => {
    try {
      toggleMutation.mutate(id);
    } catch (err) {
      console.error('[handleToggle]', err);
    }
  };

  const openCreate = (parent = null) => { setEditing(null); setParentFor(parent); setModalOpen(true); };
  const openEdit   = (cat)           => { setEditing(cat);  setParentFor(null);   setModalOpen(true); };

  // ── Stats ──────────────────────────────────────────────────────────────────
  const flat          = flattenTree(tree);
  const totalActive   = flat.filter(c =>  c.isActive).length;
  const totalInactive = flat.filter(c => !c.isActive).length;

  // ── Error UI ───────────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
        <span className="text-4xl">⚠️</span>
        <p className="text-slate-300 font-medium">Categories load could not be done।</p>
        <button
          onClick={refetch}
          className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Categories</h1>
          <p className="text-sm text-slate-400 mt-0.5">Organize your product catalog with a hierarchical tree.</p>
        </div>
        <button
          onClick={() => openCreate()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold transition-colors shadow-lg shadow-amber-900/30"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Category
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Categories', value: flat.length,    icon: '🗂️', color: 'from-amber-500/20 to-amber-500/5',   border: 'border-amber-500/20',   text: 'text-amber-400'   },
          { label: 'Root Categories',  value: tree.length,    icon: '📁', color: 'from-violet-500/20 to-violet-500/5', border: 'border-violet-500/20',  text: 'text-violet-400'  },
          { label: 'Active',           value: totalActive,    icon: '✅', color: 'from-emerald-500/20 to-emerald-500/5',border: 'border-emerald-500/20', text: 'text-emerald-400' },
          { label: 'Inactive',         value: totalInactive,  icon: '⏸️', color: 'from-slate-500/20 to-slate-500/5',   border: 'border-slate-500/20',   text: 'text-slate-400'   },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border ${s.border} bg-gradient-to-br ${s.color} p-4`}>
            <div className="text-lg mb-1">{s.icon}</div>
            <p className={`text-2xl font-bold ${s.text}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tree */}
      <CategoryTree
        tree={tree}
        loading={isLoading}
        onEdit={openEdit}
        onDelete={handleDelete}
        onToggle={handleToggle}
        onAddChild={(cat) => openCreate(cat)}
      />

      {/* Modal */}
      {modalOpen && (
        <CategoryFormModal
          editing={editing}
          parentFor={parentFor}
          allCategories={flat}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditing(null); setParentFor(null); }}
        />
      )}
    </div>
  );
}