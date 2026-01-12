import { useState, useEffect } from 'react';
import { useWorkspace } from './useWorkspace';
import {
  getCategories,
  getCategoriesByType,
  createCategory as createCategoryService,
  updateCategory as updateCategoryService,
  deleteCategory as deleteCategoryService,
} from '../services/category.service';
import { Category, TransactionType } from '../types';

export function useCategories(type?: TransactionType) {
  const { currentWorkspace } = useWorkspace();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      if (!currentWorkspace) {
        setCategories([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = type
          ? await getCategoriesByType(currentWorkspace.id, type)
          : await getCategories(currentWorkspace.id);
        setCategories(data);
        setError(null);
      } catch (err) {
        console.error('Error loading categories:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, [currentWorkspace, type]);

  const createCategory = async (category: Omit<Category, 'id'>) => {
    if (!currentWorkspace) throw new Error('No workspace selected');

    const categoryId = await createCategoryService(currentWorkspace.id, category);

    // Reload categories
    const data = type
      ? await getCategoriesByType(currentWorkspace.id, type)
      : await getCategories(currentWorkspace.id);
    setCategories(data);

    return categoryId;
  };

  const updateCategory = async (categoryId: string, data: Partial<Category>) => {
    await updateCategoryService(categoryId, data);

    // Reload categories
    if (currentWorkspace) {
      const updated = type
        ? await getCategoriesByType(currentWorkspace.id, type)
        : await getCategories(currentWorkspace.id);
      setCategories(updated);
    }
  };

  const deleteCategory = async (categoryId: string) => {
    await deleteCategoryService(categoryId);

    // Reload categories
    if (currentWorkspace) {
      const updated = type
        ? await getCategoriesByType(currentWorkspace.id, type)
        : await getCategories(currentWorkspace.id);
      setCategories(updated);
    }
  };

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
