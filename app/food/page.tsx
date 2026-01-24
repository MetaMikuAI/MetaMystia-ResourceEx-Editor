'use client';

import { useCallback, useMemo, useState } from 'react';

import { useData } from '@/components/DataContext';

import { FoodEditor } from '@/components/FoodEditor';
import { FoodList } from '@/components/FoodList';
import { Header } from '@/components/Header';

import type { Food } from '@/types/resource';

export default function FoodPage() {
	const { data, setData, setHasUnsavedChanges } = useData();
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

	const addFood = useCallback(() => {
		const newId = 11000 + (data.foods?.length || 0);
		const newFood: Food = {
			id: newId,
			name: `新料理${(data.foods?.length || 0) + 1}`,
			description: '',
			level: 1,
			baseValue: 1,
			tags: [],
			banTags: [],
			spritePath: `assets/Food/${newId}.png`,
		};
		const newFoods = [...(data.foods || []), newFood];
		setData({ ...data, foods: newFoods });
		setSelectedIndex(newFoods.length - 1);
		setHasUnsavedChanges(true);
	}, [data, setData, setHasUnsavedChanges]);

	const removeFood = useCallback(
		(index: number) => {
			const newFoods = (data.foods || []).filter((_, i) => i !== index);
			setData({ ...data, foods: newFoods });
			if (selectedIndex === index) {
				setSelectedIndex(newFoods.length > 0 ? 0 : null);
			} else if (selectedIndex !== null && selectedIndex > index) {
				setSelectedIndex(selectedIndex - 1);
			}
			setHasUnsavedChanges(true);
		},
		[data, selectedIndex, setData, setHasUnsavedChanges]
	);

	const updateFood = useCallback(
		(index: number | null, updates: Partial<Food>) => {
			if (index === null) {
				return;
			}
			const newFoods = [...(data.foods || [])];
			newFoods[index] = { ...newFoods[index], ...updates } as Food;
			setData({ ...data, foods: newFoods });
			setHasUnsavedChanges(true);
		},
		[data, setData, setHasUnsavedChanges]
	);

	const selectedFood = useMemo(
		() =>
			selectedIndex === null
				? null
				: ((data.foods || [])[selectedIndex] ?? null),
		[data, selectedIndex]
	);

	return (
		<main className="flex min-h-screen flex-col">
			<Header />

			<div className="container mx-auto w-full max-w-7xl px-6 py-8 3xl:max-w-screen-2xl 4xl:max-w-screen-3xl">
				<div className="relative grid grid-cols-1 gap-8 lg:grid-cols-3">
					<FoodList
						foods={data.foods || []}
						selectedIndex={selectedIndex}
						onAdd={addFood}
						onRemove={removeFood}
						onSelect={setSelectedIndex}
					/>

					<FoodEditor
						food={selectedFood}
						foodIndex={selectedIndex}
						onUpdate={(updates: Partial<Food>) => {
							updateFood(selectedIndex, updates);
						}}
					/>
				</div>
			</div>
		</main>
	);
}
