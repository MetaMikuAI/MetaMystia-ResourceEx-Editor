'use client';

import { useCallback, useMemo, useState } from 'react';

import type { Beverage } from '@/domain/resourcePack/contracts/items';

import { EditorWorkspace } from '@/features/resourceEditor/client/components/layout/EditorWorkspace';
import {
	findNextAvailableInteger,
	findNextAvailableSuffixedValue,
} from '@/features/resourceEditor/client/editorValueAllocation';
import { useResourceEditor } from '@/features/resourceEditor/client/state/useResourceEditor';

import { BeverageEditor } from './BeverageEditor';
import { BeverageList } from './BeverageList';

export function BeverageEditorScreen() {
	const { resourcePack: data, updateResourcePack } = useResourceEditor();
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

	const addBeverage = useCallback(() => {
		const beverages = data.beverages ?? [];
		const newId = findNextAvailableInteger(
			beverages.map((beverage) => beverage.id),
			11000
		);
		const newBeverage: Beverage = {
			id: newId,
			name: findNextAvailableSuffixedValue(
				beverages.map((beverage) => beverage.name),
				'新酒水'
			),
			description: '',
			level: 1,
			baseValue: 1,
			tags: [],
			spritePath: `assets/Beverage/${newId}.png`,
		};
		const newBeverages = [...beverages, newBeverage];
		updateResourcePack(() => ({ ...data, beverages: newBeverages }));
		setSelectedIndex(newBeverages.length - 1);
	}, [data, updateResourcePack]);

	const removeBeverage = useCallback(
		(index: number) => {
			const newBeverages = (data.beverages || []).filter(
				(_, i) => i !== index
			);
			updateResourcePack(() => ({ ...data, beverages: newBeverages }));
			if (selectedIndex === index) {
				setSelectedIndex(newBeverages.length > 0 ? 0 : null);
			} else if (selectedIndex !== null && selectedIndex > index) {
				setSelectedIndex(selectedIndex - 1);
			}
		},
		[data, selectedIndex, updateResourcePack]
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
			updateResourcePack(() => ({ ...data, beverages: newBeverages }));
		},
		[data, updateResourcePack]
	);

	const selectedBeverage = useMemo(
		() =>
			selectedIndex === null
				? null
				: ((data.beverages || [])[selectedIndex] ?? null),
		[data, selectedIndex]
	);

	return (
		<EditorWorkspace>
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
		</EditorWorkspace>
	);
}
