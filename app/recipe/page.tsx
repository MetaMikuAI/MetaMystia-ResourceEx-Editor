'use client';

import { useCallback, useMemo, useState } from 'react';

import { useData } from '@/components/DataContext';

import { RecipeEditor } from '@/components/RecipeEditor';
import { RecipeList } from '@/components/RecipeList';
import { Header } from '@/components/Header';

import type { Recipe } from '@/types/resource';

export default function RecipePage() {
	const { data, setData, setHasUnsavedChanges } = useData();
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

	const customIngredients = useMemo(
		() => data.ingredients.map((ing) => ({ id: ing.id, name: ing.name })),
		[data.ingredients]
	);

	const customFoods = useMemo(
		() =>
			(data.foods || []).map((food) => ({
				id: food.id,
				name: food.name,
			})),
		[data.foods]
	);

	const addRecipe = useCallback(() => {
		const newRecipe: Recipe = {
			id: 11000 + (data.recipes?.length || 0),
			foodId: -1,
			ingredients: [],
			cookTime: 1,
			cookerType: 'Pot',
		};
		const newRecipes = [...(data.recipes || []), newRecipe];
		setData({ ...data, recipes: newRecipes });
		setSelectedIndex(newRecipes.length - 1);
		setHasUnsavedChanges(true);
	}, [data, setData, setHasUnsavedChanges]);

	const removeRecipe = useCallback(
		(index: number) => {
			const newRecipes = (data.recipes || []).filter(
				(_, i) => i !== index
			);
			setData({ ...data, recipes: newRecipes });
			if (selectedIndex === index) {
				setSelectedIndex(newRecipes.length > 0 ? 0 : null);
			} else if (selectedIndex !== null && selectedIndex > index) {
				setSelectedIndex(selectedIndex - 1);
			}
			setHasUnsavedChanges(true);
		},
		[data, selectedIndex, setData, setHasUnsavedChanges]
	);

	const updateRecipe = useCallback(
		(index: number | null, updates: Partial<Recipe>) => {
			if (index === null) {
				return;
			}
			const newRecipes = [...(data.recipes || [])];
			newRecipes[index] = { ...newRecipes[index], ...updates } as Recipe;
			setData({ ...data, recipes: newRecipes });
			setHasUnsavedChanges(true);
		},
		[data, setData, setHasUnsavedChanges]
	);

	const selectedRecipe = useMemo(
		() =>
			selectedIndex === null
				? null
				: ((data.recipes || [])[selectedIndex] ?? null),
		[data, selectedIndex]
	);

	return (
		<main className="flex min-h-screen flex-col">
			<Header />

			<div className="container mx-auto w-full max-w-7xl px-6 py-8 3xl:max-w-screen-2xl 4xl:max-w-screen-3xl">
				<div className="relative grid grid-cols-1 gap-8 lg:grid-cols-3">
					<RecipeList
						recipes={data.recipes || []}
						customIngredients={customIngredients}
						customFoods={customFoods}
						selectedIndex={selectedIndex}
						onAdd={addRecipe}
						onRemove={removeRecipe}
						onSelect={setSelectedIndex}
					/>

					<RecipeEditor
						recipe={selectedRecipe}
						recipeIndex={selectedIndex}
						customIngredients={customIngredients}
						customFoods={customFoods}
						onUpdate={(updates: Partial<Recipe>) => {
							updateRecipe(selectedIndex, updates);
						}}
					/>
				</div>
			</div>
		</main>
	);
}
