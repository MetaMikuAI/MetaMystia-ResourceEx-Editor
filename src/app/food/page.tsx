'use client';

import { useCallback, useMemo, useState } from 'react';

import { FoodEditor } from '@/components/food/FoodEditor';
import { FoodList } from '@/components/food/FoodList';
import { FoodPreviewDialog } from '@/components/food/FoodPreviewDialog';

import type { Food } from '@/domain/resourcePack/contracts/items';

import { useResourceEditor } from '@/features/resourceEditor/client/state/useResourceEditor';

export default function FoodPage() {
	const { resourcePack: data, updateResourcePack } = useResourceEditor();
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
	const [previewFoodId, setPreviewFoodId] = useState<number | null>(null);

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
		updateResourcePack(() => ({ ...data, foods: newFoods }));
		setSelectedIndex(newFoods.length - 1);
	}, [data, updateResourcePack]);

	const removeFood = useCallback(
		(index: number) => {
			const newFoods = (data.foods || []).filter((_, i) => i !== index);
			updateResourcePack(() => ({ ...data, foods: newFoods }));
			if (selectedIndex === index) {
				setSelectedIndex(newFoods.length > 0 ? 0 : null);
			} else if (selectedIndex !== null && selectedIndex > index) {
				setSelectedIndex(selectedIndex - 1);
			}
		},
		[data, selectedIndex, updateResourcePack]
	);

	const updateFood = useCallback(
		(index: number | null, updates: Partial<Food>) => {
			if (index === null) {
				return;
			}
			const newFoods = [...(data.foods || [])];
			newFoods[index] = { ...newFoods[index], ...updates } as Food;
			updateResourcePack(() => ({ ...data, foods: newFoods }));
		},
		[data, updateResourcePack]
	);

	const selectedFood = useMemo(
		() =>
			selectedIndex === null
				? null
				: ((data.foods || [])[selectedIndex] ?? null),
		[data, selectedIndex]
	);

	return (
		<div className="flex flex-col">
			<div className="container mx-auto w-full max-w-7xl px-6 py-8 3xl:max-w-screen-2xl 4xl:max-w-screen-3xl">
				<div className="relative grid grid-cols-1 gap-8 lg:grid-cols-3">
					<FoodList
						foods={data.foods || []}
						selectedIndex={selectedIndex}
						onAdd={addFood}
						onRemove={removeFood}
						onPreview={setPreviewFoodId}
						onSelect={setSelectedIndex}
					/>
					<FoodPreviewDialog
						foodId={previewFoodId}
						isOpen={previewFoodId !== null}
						onClose={() => setPreviewFoodId(null)}
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
		</div>
	);
}
