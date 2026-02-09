'use client';

import { useCallback, useMemo, useState } from 'react';

import { useData } from '@/components/context/DataContext';

import { MerchantEditor } from '@/components/merchant/MerchantEditor';
import { MerchantList } from '@/components/merchant/MerchantList';
import { Header } from '@/components/common/Header';

import type { MerchantConfig } from '@/types/resource';

const DEFAULT_MERCHANT: MerchantConfig = {
	key: '',
	welcomeDialogPackageNames: [],
	nullDialogPackageNames: [],
	priceMultiplierMin: 1,
	priceMultiplierMax: 1,
	leastSellNum: 1,
	merchandise: [],
};

export default function MerchantPage() {
	const { data, setData, setHasUnsavedChanges } = useData();
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

	const merchants = useMemo(() => data.merchants || [], [data.merchants]);

	const addMerchant = useCallback(() => {
		const newMerchants = [...merchants, { ...DEFAULT_MERCHANT }];
		setData({ ...data, merchants: newMerchants });
		setSelectedIndex(newMerchants.length - 1);
		setHasUnsavedChanges(true);
	}, [data, merchants, setData, setHasUnsavedChanges]);

	const removeMerchant = useCallback(
		(index: number) => {
			const newMerchants = merchants.filter((_, i) => i !== index);
			setData({ ...data, merchants: newMerchants });
			if (selectedIndex === index) {
				setSelectedIndex(newMerchants.length > 0 ? 0 : null);
			} else if (selectedIndex !== null && selectedIndex > index) {
				setSelectedIndex(selectedIndex - 1);
			}
			setHasUnsavedChanges(true);
		},
		[data, merchants, selectedIndex, setData, setHasUnsavedChanges]
	);

	const updateMerchant = useCallback(
		(index: number | null, updates: Partial<MerchantConfig>) => {
			if (index === null) return;
			const newMerchants = [...merchants];
			newMerchants[index] = {
				...newMerchants[index],
				...updates,
			} as MerchantConfig;
			setData({ ...data, merchants: newMerchants });
			setHasUnsavedChanges(true);
		},
		[data, merchants, setData, setHasUnsavedChanges]
	);

	const selectedMerchant = useMemo(
		() =>
			selectedIndex === null ? null : (merchants[selectedIndex] ?? null),
		[merchants, selectedIndex]
	);

	const extFoods = useMemo(() => data.foods || [], [data.foods]);
	const extIngredients = useMemo(
		() => data.ingredients || [],
		[data.ingredients]
	);
	const extBeverages = useMemo(() => data.beverages || [], [data.beverages]);
	const extRecipes = useMemo(() => data.recipes || [], [data.recipes]);

	return (
		<main className="flex min-h-screen flex-col">
			<Header />

			<div className="container mx-auto w-full max-w-7xl px-6 py-8 3xl:max-w-screen-2xl 4xl:max-w-screen-3xl">
				<div className="relative grid grid-cols-1 gap-8 lg:grid-cols-3">
					<MerchantList
						merchants={merchants}
						allCharacters={data.characters}
						selectedIndex={selectedIndex}
						onAdd={addMerchant}
						onRemove={removeMerchant}
						onSelect={setSelectedIndex}
					/>

					<MerchantEditor
						merchant={selectedMerchant}
						allCharacters={data.characters}
						allDialogPackages={data.dialogPackages}
						extFoods={extFoods}
						extIngredients={extIngredients}
						extBeverages={extBeverages}
						extRecipes={extRecipes}
						onUpdate={(updates: Partial<MerchantConfig>) => {
							updateMerchant(selectedIndex, updates);
						}}
					/>
				</div>
			</div>
		</main>
	);
}
