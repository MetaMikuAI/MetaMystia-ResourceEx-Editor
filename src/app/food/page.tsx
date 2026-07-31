'use client';

import { useCallback, useMemo, useState } from 'react';

import { FoodEditor } from '@/components/food/FoodEditor';
import { FoodList } from '@/components/food/FoodList';
import { FoodPreviewDialog } from '@/components/food/FoodPreviewDialog';

import type { Food } from '@/domain/resourcePack/contracts/items';

import { EditorWorkspace } from '@/features/resourceEditor/client/components/layout/EditorWorkspace';
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
		<EditorWorkspace>
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
		</EditorWorkspace>
	);
}
