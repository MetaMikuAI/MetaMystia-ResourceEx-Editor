'use client';

import { useCallback, useMemo } from 'react';

import type { Clothes } from '@/domain/resourcePack/contracts/items';

import {
	EditorWorkspace,
	useEditorSelection,
} from '@/features/resourceEditor/client/components/layout/EditorWorkspace';
import {
	findNextAvailableInteger,
	findNextAvailableSuffixedValue,
	getEntityIdAllocationStart,
} from '@/features/resourceEditor/client/editorValueAllocation';
import { useEditorEntityNavigationIntent } from '@/features/resourceEditor/client/navigation/editorNavigationIntent';
import { useResourceEditor } from '@/features/resourceEditor/client/state/useResourceEditor';

import { ClothesEditor } from './ClothesEditor';
import { ClothesList } from './ClothesList';

export function ClothesEditorScreen() {
	const { resourcePack: data, updateResourcePack } = useResourceEditor();
	const { detailKey, replaceSelection, selectedIndex, setSelectedIndex } =
		useEditorSelection();
	useEditorEntityNavigationIntent({
		entityKind: 'clothes',
		getStableKey: (clothes) => clothes.id,
		items: data.clothes ?? [],
		onSelect: setSelectedIndex,
	});

	const addClothes = useCallback(() => {
		const clothes = data.clothes ?? [];
		const newId = findNextAvailableInteger(
			clothes.map((item) => item.id),
			getEntityIdAllocationStart(data.packInfo.idRangeStart, 9000)
		);
		const newName = findNextAvailableSuffixedValue(
			clothes.map((item) => item.name),
			'新衣服'
		);
		const packLabel = data.packInfo.label || 'ResourceExample';
		const newClothes: Clothes = {
			id: newId,
			name: newName,
			description: '',
			spritePath: `assets/Clothes/${newId}/icon.png`,
			portraitPath: `assets/Clothes/${newId}/portrait.png`,
			pixelFullConfig: {
				name: `_${packLabel}_Clothes_${newId}_${newName}`,
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
		const newClothesList = [...clothes, newClothes];
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
				replaceSelection(newClothesList.length > 0 ? 0 : null);
			} else if (selectedIndex !== null && selectedIndex > index) {
				setSelectedIndex(selectedIndex - 1);
			}
		},
		[data, replaceSelection, selectedIndex, updateResourcePack]
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
		<EditorWorkspace detailKey={detailKey}>
			<ClothesList
				clothes={data.clothes || []}
				selectedIndex={selectedIndex}
				onAdd={addClothes}
				onRemove={removeClothes}
				onSelect={setSelectedIndex}
			/>

			<ClothesEditor
				key={detailKey ?? 'empty'}
				clothes={selectedClothes}
				clothesIndex={selectedIndex}
				onUpdate={(updates: Partial<Clothes>) => {
					updateClothes(selectedIndex, updates);
				}}
			/>
		</EditorWorkspace>
	);
}
