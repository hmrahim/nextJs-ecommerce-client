
'use client';
import { useState } from 'react';

function ConfirmModal({ category, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-[#16161f] border border-[#1e1e2e] rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <h3 className="text-white font-semibold text-center mb-1">Delete Category?</h3>
        <p className="text-slate-400 text-sm text-center mb-2">
          "<span className="text-white">{category?.name}</span>" এবং এর সব subcategory মুছে যাবে।
        </p>
        {category?.children?.length > 0 && (
          <p className="text-xs text-red-400 text-center mb-4 bg-red-500/5 border border-red-500/10 rounded-lg px-3 py-2">
            ⚠️ এই category তে {category.children.length}টা subcategory আছে — সেগুলোও delete হবে।
          </p>
        )}
        <div className="flex gap-3 mt-4">
          <button onClick={onCancel} className="flex-1 px-4 py-2 rounded-lg border border-[#1e1e2e] text-slate-400 text-sm hover:bg-white/5 transition-colors">Cancel</button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors">Delete</button>
        </div>
      </div>
    </div>
  );
}

function CategoryRow({ category, depth, onEdit, onDelete, onToggle, onAddChild }) {
  const [expanded, setExpanded] = useState(depth < 1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const hasChildren = category.children?.length > 0;

  const indentCls = depth === 0 ? '' : depth === 1 ? 'ml-6' : depth === 2 ? 'ml-12' : 'ml-16';
  const connectorCls = depth > 0 ? 'before:absolute before:left-[-18px] before:top-[50%] before:w-4 before:h-px before:bg-[#2a2a3a]' : '';

  return (
    <>
      <div className={`group relative flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors border-b border-[#1e1e2e] last:border-0 ${indentCls}`}>
        {/* Connector line for children */}
        {depth > 0 && (
          <span className="absolute left-[calc(1rem+8px)] top-0 bottom-0 w-px bg-[#2a2a3a]" style={{ left: `${depth * 24 + 16}px` }} />
        )}

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(e => !e)}
          className={`flex-shrink-0 w-5 h-5 flex items-center justify-center rounded text-slate-500 hover:text-slate-300 transition-colors ${!hasChildren ? 'opacity-0 pointer-events-none' : ''}`}
        >
          <svg className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Icon */}
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm ${
          depth === 0 ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
          : depth === 1 ? 'bg-violet-500/10 border border-violet-500/20 text-violet-400'
          : 'bg-slate-700/30 border border-slate-700/50 text-slate-400'
        }`}>
          {category.imageUrl
            ? <img src={category.imageUrl} alt="" className="w-full h-full object-cover rounded-lg" />
            : depth === 0 ? '📁' : depth === 1 ? '📂' : '📄'
          }
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-medium text-sm ${category.isActive ? 'text-white' : 'text-slate-500 line-through'}`}>
              {category.name}
            </span>
            {depth === 0 && (
              <span className="text-xs text-amber-500/70 bg-amber-500/5 border border-amber-500/10 px-1.5 py-0.5 rounded font-medium">ROOT</span>
            )}
            {!category.isActive && (
              <span className="text-xs text-slate-500 bg-slate-700/30 border border-slate-700/50 px-1.5 py-0.5 rounded">Inactive</span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-slate-600 font-mono">/{category.slug}</span>
            {category.productCount > 0 && (
              <span className="text-xs text-slate-500">{category.productCount} products</span>
            )}
            {hasChildren && (
              <span className="text-xs text-slate-600">{category.children.length} subcategories</span>
            )}
          </div>
        </div>

        {/* Sort order badge */}
        <span className="text-xs text-slate-700 tabular-nums w-6 text-center flex-shrink-0 hidden sm:block">
          #{category.sortOrder}
        </span>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          {/* Add child */}
          <button
            onClick={() => onAddChild(category)}
            title="Add subcategory"
            className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-slate-500 hover:text-emerald-400 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>

          {/* Toggle active */}
          <button
            onClick={() => onToggle(category._id)}
            title={category.isActive ? 'Deactivate' : 'Activate'}
            className="p-1.5 rounded-lg hover:bg-amber-500/10 text-slate-500 hover:text-amber-400 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {category.isActive
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
              }
            </svg>
          </button>

          {/* Edit */}
          <button
            onClick={() => onEdit(category)}
            title="Edit"
            className="p-1.5 rounded-lg hover:bg-violet-500/10 text-slate-500 hover:text-violet-400 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          {/* Delete */}
          <button
            onClick={() => setDeleteTarget(category)}
            title="Delete"
            className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Children */}
      {expanded && hasChildren && (
        <div className="border-l-2 border-[#1e1e2e] ml-6">
          {category.children.map(child => (
            <CategoryRow
              key={child._id}
              category={child}
              depth={depth + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggle={onToggle}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}

      {/* Confirm delete modal */}
      {deleteTarget && (
        <ConfirmModal
          category={deleteTarget}
          onConfirm={() => { onDelete(deleteTarget._id); setDeleteTarget(null); }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}

export default function CategoryTree({ tree, loading, onEdit, onDelete, onToggle, onAddChild }) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-[#1e1e2e] bg-[#111118] p-8 flex items-center justify-center gap-3 text-slate-500">
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Loading categories…
      </div>
    );
  }

  if (!tree.length) {
    return (
      <div className="rounded-2xl border border-[#1e1e2e] bg-[#111118] p-12 flex flex-col items-center gap-3 text-slate-500">
        <svg className="w-10 h-10 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
        <p>No categories yet. Create your first one!</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#1e1e2e] bg-[#111118] overflow-hidden">
      {/* Table header */}
      <div className="grid grid-cols-[1fr_auto] px-4 py-2.5 border-b border-[#1e1e2e] bg-[#0d0d14]">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</span>
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider pr-24">Order</span>
      </div>

      {/* Tree rows */}
      <div>
        {tree.map(cat => (
          <CategoryRow
            key={cat._id}
            category={cat}
            depth={0}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggle={onToggle}
            onAddChild={onAddChild}
          />
        ))}
      </div>
    </div>
  );
}
