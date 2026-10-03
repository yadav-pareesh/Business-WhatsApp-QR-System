import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Layers, ArrowUp, ArrowDown } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Category } from '../../types';
import { api } from '../../utils/api';
import { Modal } from '../../components/common/Modal';

export const CategoriesPage: React.FC = () => {
  const { currentBusiness } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadCategories = async () => {
    if (!currentBusiness) return;
    setIsLoading(true);
    try {
      const data = await api.get<Category[]>(`/catalog/${currentBusiness.id}/categories`);
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [currentBusiness]);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormName('');
    setFormDescription('');
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Category) => {
    setEditingCategory(c);
    setFormName(c.name);
    setFormDescription(c.description || '');
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (c: Category) => {
    if (!currentBusiness) return;
    if (!confirm(`Are you sure you want to delete category "${c.name}"? Products inside will also be removed.`)) return;
    try {
      await api.delete(`/catalog/${currentBusiness.id}/categories/${c.id}`);
      setCategories(categories.filter((cat) => cat.id !== c.id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete category');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBusiness) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      if (editingCategory) {
        await api.put(`/catalog/${currentBusiness.id}/categories/${editingCategory.id}`, {
          name: formName.trim(),
          description: formDescription.trim() || undefined,
          sortOrder: editingCategory.sortOrder,
          isActive: true,
        });
      } else {
        await api.post(`/catalog/${currentBusiness.id}/categories`, {
          name: formName.trim(),
          description: formDescription.trim() || undefined,
          sortOrder: categories.length + 1,
          isActive: true,
        });
      }
      setIsModalOpen(false);
      await loadCategories();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (!currentBusiness) return;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= categories.length) return;

    const list = [...categories];
    const [moved] = list.splice(index, 1);
    list.splice(newIndex, 0, moved);
    setCategories(list);

    try {
      await api.put(`/catalog/${currentBusiness.id}/categories-reorder`, {
        orderedIds: list.map((c) => c.id),
      });
    } catch (err) {
      console.error(err);
      loadCategories();
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Menu Categories
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Group your items into sections like Starters, Mains, Drinks, Sweets.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-sm flex items-center justify-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">No categories created yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Categories make it simple for hungry customers to find what they want quickly.
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-2 bg-brand-600 hover:bg-brand-700 text-white font-bold px-4 py-2 rounded-xl text-xs"
          >
            Create First Category
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
          {categories.map((c, idx) => (
            <div
              key={c.id}
              className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <button
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, 'up')}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={idx === categories.length - 1}
                    onClick={() => handleMove(idx, 'down')}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <div className="font-extrabold text-sm text-slate-900">{c.name}</div>
                  {c.description && <div className="text-xs text-slate-500 mt-0.5">{c.description}</div>}
                  <div className="text-[11px] font-semibold text-slate-400 mt-1">
                    {c._count?.products || 0} products listed
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEdit(c)}
                  className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Edit category"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(c)}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Delete category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create New Category'}
        description="Categories appear as navigation tabs on your customer QR menu."
      >
        <form onSubmit={handleSave} className="space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Pizzas, Cold Drinks, South Indian"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Short Description (Optional)
            </label>
            <input
              type="text"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="e.g. Freshly made with farm ingredients"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm"
            >
              {isSubmitting ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
