'use client';

import { useCallback, useMemo, useState } from 'react';

import { IngredientEditor } from '@/components/ingredient/IngredientEditor';
import { IngredientList } from '@/components/ingredient/IngredientList';

import type { Ingredient } from '@/domain/resourcePack/contracts/items';

import { EditorWorkspace } from '@/features/resourceEditor/client/components/layout/EditorWorkspace';
import { useResourceEditor } from '@/features/resourceEditor/client/state/useResourceEditor';

export default function IngredientPage() {
	const { resourcePack: data, updateResourcePack } = useResourceEditor();
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

	const addIngredient = useCallback(() => {
		const newId = 11000 + data.ingredients.length;
		const newIngredient: Ingredient = {
			id: newId,
			name: `新原料${data.ingredients.length + 1}`,
			description: '',
			level: 1,
			prefix: -1,
			isFish: false,
			isMeat: false,
			isVeg: false,
			baseValue: 1,
			tags: [],
			spritePath: `assets/Ingredient/${newId}.png`,
		};
		const newIngredients = [...data.ingredients, newIngredient];
		updateResourcePack(() => ({ ...data, ingredients: newIngredients }));
		setSelectedIndex(newIngredients.length - 1);
	}, [data, updateResourcePack]);

	const removeIngredient = useCallback(
		(index: number) => {
			const newIngredients = data.ingredients.filter(
				(_, i) => i !== index
			);
			updateResourcePack(() => ({
				...data,
				ingredients: newIngredients,
			}));
			if (selectedIndex === index) {
				setSelectedIndex(newIngredients.length > 0 ? 0 : null);
			} else if (selectedIndex !== null && selectedIndex > index) {
				setSelectedIndex(selectedIndex - 1);
			}
		},
		[data, selectedIndex, updateResourcePack]
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
			updateResourcePack(() => ({
				...data,
				ingredients: newIngredients,
			}));
		},
		[data, updateResourcePack]
	);

	const selectedIngredient = useMemo(
		() =>
			selectedIndex === null
				? null
				: (data.ingredients[selectedIndex] ?? null),
		[data, selectedIndex]
	);

	return (
		<EditorWorkspace>
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
		</EditorWorkspace>
	);
}
