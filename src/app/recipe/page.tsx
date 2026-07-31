'use client';

import { useCallback, useMemo, useState } from 'react';

import { FoodPreviewDialog } from '@/components/food/FoodPreviewDialog';
import { RecipeEditor } from '@/components/recipe/RecipeEditor';
import { RecipeList } from '@/components/recipe/RecipeList';

import type { Recipe } from '@/domain/resourcePack/contracts/items';

import { EditorWorkspace } from '@/features/resourceEditor/client/components/layout/EditorWorkspace';
import { useResourceEditor } from '@/features/resourceEditor/client/state/useResourceEditor';

export default function RecipePage() {
	const { resourcePack: data, updateResourcePack } = useResourceEditor();
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
	const [previewFoodId, setPreviewFoodId] = useState<number | null>(null);

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
		updateResourcePack(() => ({ ...data, recipes: newRecipes }));
		setSelectedIndex(newRecipes.length - 1);
	}, [data, updateResourcePack]);

	const removeRecipe = useCallback(
		(index: number) => {
			const newRecipes = (data.recipes || []).filter(
				(_, i) => i !== index
			);
			updateResourcePack(() => ({ ...data, recipes: newRecipes }));
			if (selectedIndex === index) {
				setSelectedIndex(newRecipes.length > 0 ? 0 : null);
			} else if (selectedIndex !== null && selectedIndex > index) {
				setSelectedIndex(selectedIndex - 1);
			}
		},
		[data, selectedIndex, updateResourcePack]
	);

	const updateRecipe = useCallback(
		(index: number | null, updates: Partial<Recipe>) => {
			if (index === null) {
				return;
			}
			const newRecipes = [...(data.recipes || [])];
			newRecipes[index] = { ...newRecipes[index], ...updates } as Recipe;
			updateResourcePack(() => ({ ...data, recipes: newRecipes }));
		},
		[data, updateResourcePack]
	);

	const selectedRecipe = useMemo(
		() =>
			selectedIndex === null
				? null
				: ((data.recipes || [])[selectedIndex] ?? null),
		[data, selectedIndex]
	);

	return (
		<EditorWorkspace>
			<RecipeList
				recipes={data.recipes || []}
				customIngredients={customIngredients}
				customFoods={customFoods}
				selectedIndex={selectedIndex}
				onAdd={addRecipe}
				onRemove={removeRecipe}
				onPreview={setPreviewFoodId}
				onSelect={setSelectedIndex}
			/>
			<FoodPreviewDialog
				foodId={previewFoodId}
				isOpen={previewFoodId !== null}
				onClose={() => setPreviewFoodId(null)}
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
		</EditorWorkspace>
	);
}
