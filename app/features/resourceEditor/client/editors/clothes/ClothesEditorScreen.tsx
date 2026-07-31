'use client';

import { useCallback, useMemo, useState } from 'react';

import type { Clothes } from '@/domain/resourcePack/contracts/items';

import { EditorWorkspace } from '@/features/resourceEditor/client/components/layout/EditorWorkspace';
import { useResourceEditor } from '@/features/resourceEditor/client/state/useResourceEditor';

import { ClothesEditor } from './ClothesEditor';
import { ClothesList } from './ClothesList';

export function ClothesEditorScreen() {
	const { resourcePack: data, updateResourcePack } = useResourceEditor();
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

	const addClothes = useCallback(() => {
		const newId = 9000 + (data.clothes?.length || 0);
		const newClothes: Clothes = {
			id: newId,
			name: `新服装${(data.clothes?.length || 0) + 1}`,
			description: '',
			spritePath: `assets/Clothes/${newId}/icon.png`,
			portraitPath: `assets/Clothes/${newId}/portrait.png`,
			pixelFullConfig: {
				name: `_ResourceExample_Clothes_${newId}`,
				mainSprite: Array(12)
					.fill('')
					.map(
						(_, i) =>
							`assets/Clothes/${newId}/Sprite/Main_${Math.floor(i / 3)}, ${i % 3}.png`
					),
				eyeSprite: Array(24)
					.fill('')
					.map(
						(_, i) =>
							`assets/Clothes/${newId}/Sprite/Eyes_${Math.floor(i / 4)}, ${i % 4}.png`
					),
				hairSprite: Array(12)
					.fill('')
					.map(
						(_, i) =>
							`assets/Clothes/${newId}/Sprite/Hair_${Math.floor(i / 3)}, ${i % 3}.png`
					),
				backSprite: Array(12)
					.fill('')
					.map(
						(_, i) =>
							`assets/Clothes/${newId}/Sprite/Back_${Math.floor(i / 3)}, ${i % 3}.png`
					),
			},
		};
		const newClothesList = [...(data.clothes || []), newClothes];
		updateResourcePack(() => ({ ...data, clothes: newClothesList }));
		setSelectedIndex(newClothesList.length - 1);
	}, [data, updateResourcePack]);

	const removeClothes = useCallback(
		(index: number) => {
			const newClothesList = (data.clothes || []).filter(
				(_, i) => i !== index
			);
			updateResourcePack(() => ({ ...data, clothes: newClothesList }));
			if (selectedIndex === index) {
				setSelectedIndex(newClothesList.length > 0 ? 0 : null);
			} else if (selectedIndex !== null && selectedIndex > index) {
				setSelectedIndex(selectedIndex - 1);
			}
		},
		[data, selectedIndex, updateResourcePack]
	);

	const updateClothes = useCallback(
		(index: number | null, updates: Partial<Clothes>) => {
			if (index === null) {
				return;
			}
			const newClothesList = [...(data.clothes || [])];
			newClothesList[index] = {
				...newClothesList[index],
				...updates,
			} as Clothes;
			updateResourcePack(() => ({ ...data, clothes: newClothesList }));
		},
		[data, updateResourcePack]
	);

	const selectedClothes = useMemo(
		() =>
			selectedIndex === null
				? null
				: ((data.clothes || [])[selectedIndex] ?? null),
		[data, selectedIndex]
	);

	return (
		<EditorWorkspace>
			<ClothesList
				clothes={data.clothes || []}
				selectedIndex={selectedIndex}
				onAdd={addClothes}
				onRemove={removeClothes}
				onSelect={setSelectedIndex}
			/>

			<ClothesEditor
				clothes={selectedClothes}
				clothesIndex={selectedIndex}
				onUpdate={(updates: Partial<Clothes>) => {
					updateClothes(selectedIndex, updates);
				}}
			/>
		</EditorWorkspace>
	);
}
