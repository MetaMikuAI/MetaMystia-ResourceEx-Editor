'use client';

import { useCallback, useMemo, useState } from 'react';

import { useData } from '@/components/context/DataContext';

import { ClothesEditor } from '@/components/clothes/ClothesEditor';
import { ClothesList } from '@/components/clothes/ClothesList';
import { Header } from '@/components/common/Header';

import type { Clothes } from '@/types/resource';

export default function ClothesPage() {
	const { data, setData, setHasUnsavedChanges } = useData();
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
		setData({ ...data, clothes: newClothesList });
		setSelectedIndex(newClothesList.length - 1);
		setHasUnsavedChanges(true);
	}, [data, setData, setHasUnsavedChanges]);

	const removeClothes = useCallback(
		(index: number) => {
			const newClothesList = (data.clothes || []).filter(
				(_, i) => i !== index
			);
			setData({ ...data, clothes: newClothesList });
			if (selectedIndex === index) {
				setSelectedIndex(newClothesList.length > 0 ? 0 : null);
			} else if (selectedIndex !== null && selectedIndex > index) {
				setSelectedIndex(selectedIndex - 1);
			}
			setHasUnsavedChanges(true);
		},
		[data, selectedIndex, setData, setHasUnsavedChanges]
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
			setData({ ...data, clothes: newClothesList });
			setHasUnsavedChanges(true);
		},
		[data, setData, setHasUnsavedChanges]
	);

	const selectedClothes = useMemo(
		() =>
			selectedIndex === null
				? null
				: ((data.clothes || [])[selectedIndex] ?? null),
		[data, selectedIndex]
	);

	return (
		<main className="flex min-h-screen flex-col">
			<Header />

			<div className="container mx-auto w-full max-w-7xl px-6 py-8 3xl:max-w-screen-2xl 4xl:max-w-screen-3xl">
				<div className="relative grid grid-cols-1 gap-8 lg:grid-cols-3">
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
				</div>
			</div>
		</main>
	);
}
