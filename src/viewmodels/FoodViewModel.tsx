import { useState, useEffect } from 'react';
import { Food } from '../models/Food';
import {
  fetchFoods,
  addFood,
  updateFood,
  deleteFood,
  uploadImage,
} from '../services/firebase';

export function useFoodViewModel() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [showForm, setShowForm] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);

  const loadFoods = async () => {
    setLoading(true);
    try {
      const data = await fetchFoods();
      setFoods(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFoods();
  }, []);

  const handleAddFood = async (foodData: Omit<Food, 'id' | 'createdAt'>, imageFile?: File) => {
    try {
      let imageUrl = foodData.imageUrl;
      if (imageFile) {
        const path = `food_images/${Date.now()}_${imageFile.name}`;
        imageUrl = await uploadImage(imageFile, path);
      }

      await addFood({
        ...foodData,
        imageUrl: imageUrl || '',
        createdAt: new Date(),
      });
      setShowForm(false);
      await loadFoods();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const handleUpdateFood = async (foodId: string, foodData: Partial<Food>, imageFile?: File) => {
    try {
      let imageUrl = foodData.imageUrl;
      if (imageFile) {
        const path = `food_images/${Date.now()}_${imageFile.name}`;
        imageUrl = await uploadImage(imageFile, path);
      }

      const updateData = { ...foodData };
      if (imageUrl) updateData.imageUrl = imageUrl;

      await updateFood(foodId, updateData);
      setShowForm(false);
      setEditingFood(null);
      await loadFoods();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const handleDeleteFood = async (foodId: string) => {
    try {
      await deleteFood(foodId);
      await loadFoods();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const openCreate = () => {
    setEditingFood(null);
    setShowForm(true);
  };

  const openEdit = (food: Food) => {
    setEditingFood(food);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingFood(null);
  };

  return {
    foods,
    loading,
    error,
    showForm,
    editingFood,
    refreshFoods: loadFoods,
    addFood: handleAddFood,
    updateFood: handleUpdateFood,
    deleteFood: handleDeleteFood,
    openCreate,
    openEdit,
    closeForm,
  };
}
