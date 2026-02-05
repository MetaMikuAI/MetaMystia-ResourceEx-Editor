'use client';

import { useCallback, useMemo, useState } from 'react';

import { useData } from '@/components/context/DataContext';

import { BeverageEditor } from '@/components/beverage/BeverageEditor';
import { BeverageList } from '@/components/beverage/BeverageList';
import { Header } from '@/components/common/Header';

import type { Beverage } from '@/types/resource';

export default function BeveragePage() {
	const { data, setData, setHasUnsavedChanges } = useData();
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

	const addBeverage = useCallback(() => {
		const newId = 11000 + (data.beverages?.length || 0);
		const newBeverage: Beverage = {
			id: newId,
			name: `新酒水${(data.beverages?.length || 0) + 1}`,
			description: '',
			level: 1,
			baseValue: 1,
			tags: [],
			spritePath: `assets/Beverage/${newId}.png`,
		};
		const newBeverages = [...(data.beverages || []), newBeverage];
		setData({ ...data, beverages: newBeverages });
		setSelectedIndex(newBeverages.length - 1);
		setHasUnsavedChanges(true);
	}, [data, setData, setHasUnsavedChanges]);

	const removeBeverage = useCallback(
		(index: number) => {
			const newBeverages = (data.beverages || []).filter(
				(_, i) => i !== index
			);
			setData({ ...data, beverages: newBeverages });
			if (selectedIndex === index) {
				setSelectedIndex(newBeverages.length > 0 ? 0 : null);
			} else if (selectedIndex !== null && selectedIndex > index) {
				setSelectedIndex(selectedIndex - 1);
			}
			setHasUnsavedChanges(true);
		},
		[data, selectedIndex, setData, setHasUnsavedChanges]
	);

	const updateBeverage = useCallback(
		(index: number | null, updates: Partial<Beverage>) => {
			if (index === null) {
				return;
			}
			const newBeverages = [...(data.beverages || [])];
			newBeverages[index] = {
				...newBeverages[index],
				...updates,
			} as Beverage;
			setData({ ...data, beverages: newBeverages });
			setHasUnsavedChanges(true);
		},
		[data, setData, setHasUnsavedChanges]
	);

	const selectedBeverage = useMemo(
		() =>
			selectedIndex === null
				? null
				: ((data.beverages || [])[selectedIndex] ?? null),
		[data, selectedIndex]
	);

	return (
		<main className="flex min-h-screen flex-col">
			<Header />

			<div className="container mx-auto w-full max-w-7xl px-6 py-8 3xl:max-w-screen-2xl 4xl:max-w-screen-3xl">
				<div className="relative grid grid-cols-1 gap-8 lg:grid-cols-3">
					<BeverageList
						beverages={data.beverages || []}
						selectedIndex={selectedIndex}
						onAdd={addBeverage}
						onRemove={removeBeverage}
						onSelect={setSelectedIndex}
					/>

					<BeverageEditor
						beverage={selectedBeverage}
						beverageIndex={selectedIndex}
						onUpdate={(updates: Partial<Beverage>) => {
							updateBeverage(selectedIndex, updates);
						}}
					/>
				</div>
			</div>
		</main>
	);
}
