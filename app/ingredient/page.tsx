'use client';

import { useCallback, useMemo, useState } from 'react';

import { useData } from '@/components/DataContext';

import { IngredientEditor } from '@/components/IngredientEditor';
import { IngredientList } from '@/components/IngredientList';
import { Header } from '@/components/Header';

import type { Ingredient } from '@/types/resource';

export default function IngredientPage() {
	const { data, setData, setHasUnsavedChanges } = useData();
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

	const addIngredient = useCallback(() => {
		const newId = 11000 + data.ingredients.length;
		const newIngredient: Ingredient = {
			id: newId,
			name: `新原料${data.ingredients.length + 1}`,
			description: '',
			level: 1,
			prefix: 0,
			isFish: false,
			isMeat: false,
			isVeg: false,
			baseValue: 1,
			tags: [],
			spritePath: `assets/Ingredient/${newId}.png`,
		};
		const newIngredients = [...data.ingredients, newIngredient];
		setData({ ...data, ingredients: newIngredients });
		setSelectedIndex(newIngredients.length - 1);
		setHasUnsavedChanges(true);
	}, [data, setData, setHasUnsavedChanges]);

	const removeIngredient = useCallback(
		(index: number) => {
			const newIngredients = data.ingredients.filter(
				(_, i) => i !== index
			);
			setData({ ...data, ingredients: newIngredients });
			if (selectedIndex === index) {
				setSelectedIndex(newIngredients.length > 0 ? 0 : null);
			} else if (selectedIndex !== null && selectedIndex > index) {
				setSelectedIndex(selectedIndex - 1);
			}
			setHasUnsavedChanges(true);
		},
		[data, selectedIndex, setData, setHasUnsavedChanges]
	);

	const updateIngredient = useCallback(
		(index: number | null, updates: Partial<Ingredient>) => {
			if (index === null) {
				return;
			}
			const newIngredients = [...data.ingredients];
			newIngredients[index] = {
				...newIngredients[index],
				...updates,
			} as Ingredient;
			setData({ ...data, ingredients: newIngredients });
			setHasUnsavedChanges(true);
		},
		[data, setData, setHasUnsavedChanges]
	);

	const selectedIngredient = useMemo(
		() =>
			selectedIndex === null
				? null
				: (data.ingredients[selectedIndex] ?? null),
		[data, selectedIndex]
	);

	return (
		<main className="flex min-h-screen flex-col">
			<Header />

			<div className="container mx-auto w-full max-w-7xl px-6 py-8 3xl:max-w-screen-2xl 4xl:max-w-screen-3xl">
				<div className="relative grid grid-cols-1 gap-8 lg:grid-cols-3">
					<IngredientList
						ingredients={data.ingredients}
						selectedIndex={selectedIndex}
						onAdd={addIngredient}
						onRemove={removeIngredient}
						onSelect={setSelectedIndex}
					/>

					<IngredientEditor
						ingredient={selectedIngredient}
						ingredientIndex={selectedIndex}
						onUpdate={(updates: Partial<Ingredient>) => {
							updateIngredient(selectedIndex, updates);
						}}
					/>
				</div>
			</div>
		</main>
	);
}
