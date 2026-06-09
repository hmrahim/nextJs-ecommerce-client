// 📁 PATH: src/app/(admin)/dashboard/categories/page.jsx
// ⚠️  পুরোনো page.jsx এর জায়গায় REPLACE করো

'use client';
import { useState, useEffect, useCallback } from 'react';
import { categoryService } from '@/services/categoryService';
import CategoryTree from '@/components/admin/categories/CategoryTree';
import CategoryFormModal from '@/components/admin/categories/CategoryFormModal';

// ── Dummy hierarchical categories ─────────────────────────────────────────────
const DUMMY_CATEGORIES = [
  { _id: 'cat_01', name: 'Electronics',       slug: 'electronics',        parentId: null,     imageUrl: '', sortOrder: 1, isActive: true,  productCount: 124, children: [
    { _id: 'cat_011', name: 'Mobile & Tablets',  slug: 'mobile-tablets',     parentId: 'cat_01', imageUrl: '', sortOrder: 1, isActive: true,  productCount: 58,  children: [
      { _id: 'cat_0111', name: 'Smartphones',      slug: 'smartphones',        parentId: 'cat_011',imageUrl: '', sortOrder: 1, isActive: true,  productCount: 40,  children: [] },
      { _id: 'cat_0112', name: 'Tablets',          slug: 'tablets',            parentId: 'cat_011',imageUrl: '', sortOrder: 2, isActive: true,  productCount: 18,  children: [] },
    ]},
    { _id: 'cat_012', name: 'Audio & Headphones',slug: 'audio-headphones',   parentId: 'cat_01', imageUrl: '', sortOrder: 2, isActive: true,  productCount: 33,  children: [] },
    { _id: 'cat_013', name: 'Computers',          slug: 'computers',          parentId: 'cat_01', imageUrl: '', sortOrder: 3, isActive: false, productCount: 33,  children: [
      { _id: 'cat_0131', name: 'Laptops',           slug: 'laptops',            parentId: 'cat_013',imageUrl: '', sortOrder: 1, isActive: true,  productCount: 20,  children: [] },
      { _id: 'cat_0132', name: 'Keyboards & Mice',  slug: 'keyboards-mice',     parentId: 'cat_013',imageUrl: '', sortOrder: 2, isActive: true,  productCount: 13,  children: [] },
    ]},
  ]},
  { _id: 'cat_02', name: 'Fashion',            slug: 'fashion',            parentId: null,     imageUrl: '', sortOrder: 2, isActive: true,  productCount: 310, children: [
    { _id: 'cat_021', name: "Men's Clothing",    slug: 'mens-clothing',      parentId: 'cat_02', imageUrl: '', sortOrder: 1, isActive: true,  productCount: 140, children: [] },
    { _id: 'cat_022', name: "Women's Clothing",  slug: 'womens-clothing',    parentId: 'cat_02', imageUrl: '', sortOrder: 2, isActive: true,  productCount: 170, children: [] },
  ]},
  { _id: 'cat_03', name: 'Home & Kitchen',     slug: 'home-kitchen',       parentId: null,     imageUrl: '', sortOrder: 3, isActive: true,  productCount: 87,  children: [
    { _id: 'cat_031', name: 'Cookware',          slug: 'cookware',           parentId: 'cat_03', imageUrl: '', sortOrder: 1, isActive: true,  productCount: 45,  children: [] },
    { _id: 'cat_032', name: 'Home Decor',         slug: 'home-decor',         parentId: 'cat_03', imageUrl: '', sortOrder: 2, isActive: true,  productCount: 42,  children: [] },
  ]},
  { _id: 'cat_04', name: 'Sports & Outdoors',  slug: 'sports-outdoors',    parentId: null,     imageUrl: '', sortOrder: 4, isActive: true,  productCount: 65,  children: [] },
  { _id: 'cat_05', name: 'Food & Grocery',     slug: 'food-grocery',       parentId: null,     imageUrl: '', sortOrder: 5, isActive: false, productCount: 22,  children: [] },
];

// Flatten tree → flat list (for selects, counts etc.)
function flattenTree(nodes, depth = 0) {
  return nodes.flatMap(n => [{ ...n, depth }, ...flattenTree(n.children || [], depth + 1)]);
}

export default function CategoriesPage() {
  const [tree, setTree]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [usingDummy, setUsingDummy] = useState(false);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editing, setEditing]       = useState(null);   // null = create, obj = edit
  const [parentFor, setParentFor]   = useState(null);   // pre-fill parent when adding child

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await categoryService.adminGetTree();
      setTree(res.data?.categories || res.data || []);
      setUsingDummy(false);
    } catch {
      setTree(DUMMY_CATEGORIES);
      setUsingDummy(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCategories(); }, [loadCategories]);

  // ── CRUD helpers (dummy-aware) ──────────────────────────────────────────────
  const handleSave = async (formData) => {
    if (usingDummy) {
      if (editing) {
        setTree(prev => updateNode(prev, editing._id, formData));
      } else {
        const newCat = {
          ...formData,
          _id: 'cat_' + Date.now(),
          productCount: 0,
          children: [],
          isActive: formData.isActive !== false,
        };
        if (formData.parentId) {
          setTree(prev => insertChild(prev, formData.parentId, newCat));
        } else {
          setTree(prev => [...prev, { ...newCat, sortOrder: prev.length + 1 }]);
        }
      }
    } else {
      if (editing) {
        await categoryService.adminUpdate(editing._id, formData);
      } else {
        await categoryService.adminCreate(formData);
      }
      loadCategories();
    }
    setModalOpen(false);
    setEditing(null);
    setParentFor(null);
  };

  const handleDelete = async (id) => {
    if (usingDummy) {
      setTree(prev => removeNode(prev, id));
      return;
    }
    await categoryService.adminDelete(id);
    loadCategories();
  };

  const handleToggle = async (id) => {
    if (usingDummy) {
      setTree(prev => toggleNode(prev, id));
      return;
    }
    await categoryService.adminToggle(id);
    loadCategories();
  };

  const openCreate = (parent = null) => { setEditing(null); setParentFor(parent); setModalOpen(true); };
  const openEdit   = (cat)           => { setEditing(cat); setParentFor(null); setModalOpen(true); };

  const flat = flattenTree(tree);
  const totalActive   = flat.filter(c => c.isActive).length;
  const totalInactive = flat.filter(c => !c.isActive).length;
  const totalProducts = flat.filter(c => !c.parentId || c.depth === 0).reduce((s, c) => s + (c.productCount || 0), 0);

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

      {/* Dummy notice */}
      {usingDummy && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Demo mode — backend connected হলে real categories দেখাবে।
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Categories', value: flat.length,      icon: '🗂️', color: 'from-amber-500/20 to-amber-500/5', border: 'border-amber-500/20', text: 'text-amber-400' },
          { label: 'Root Categories',  value: tree.length,      icon: '📁', color: 'from-violet-500/20 to-violet-500/5', border: 'border-violet-500/20', text: 'text-violet-400' },
          { label: 'Active',           value: totalActive,      icon: '✅', color: 'from-emerald-500/20 to-emerald-500/5', border: 'border-emerald-500/20', text: 'text-emerald-400' },
          { label: 'Inactive',         value: totalInactive,    icon: '⏸️', color: 'from-slate-500/20 to-slate-500/5', border: 'border-slate-500/20', text: 'text-slate-400' },
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
        loading={loading}
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

// ── Pure tree helpers ──────────────────────────────────────────────────────────
function updateNode(nodes, id, data) {
  return nodes.map(n => n._id === id
    ? { ...n, ...data }
    : { ...n, children: updateNode(n.children || [], id, data) }
  );
}
function removeNode(nodes, id) {
  return nodes.filter(n => n._id !== id).map(n => ({ ...n, children: removeNode(n.children || [], id) }));
}
function toggleNode(nodes, id) {
  return nodes.map(n => n._id === id
    ? { ...n, isActive: !n.isActive }
    : { ...n, children: toggleNode(n.children || [], id) }
  );
}
function insertChild(nodes, parentId, newNode) {
  return nodes.map(n => n._id === parentId
    ? { ...n, children: [...(n.children || []), newNode] }
    : { ...n, children: insertChild(n.children || [], parentId, newNode) }
  );
}
