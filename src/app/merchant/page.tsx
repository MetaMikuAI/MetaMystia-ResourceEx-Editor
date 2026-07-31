'use client';

import { useCallback, useMemo, useState } from 'react';

import { MerchantEditor } from '@/components/merchant/MerchantEditor';
import { MerchantList } from '@/components/merchant/MerchantList';

import type { MerchantConfig } from '@/domain/resourcePack/contracts/merchant';

import { EditorWorkspace } from '@/features/resourceEditor/client/components/layout/EditorWorkspace';
import { useResourceEditor } from '@/features/resourceEditor/client/state/useResourceEditor';

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
	const { resourcePack: data, updateResourcePack } = useResourceEditor();
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

	const merchants = useMemo(() => data.merchants || [], [data.merchants]);

	const addMerchant = useCallback(() => {
		const newMerchants = [...merchants, { ...DEFAULT_MERCHANT }];
		updateResourcePack(() => ({ ...data, merchants: newMerchants }));
		setSelectedIndex(newMerchants.length - 1);
	}, [data, merchants, updateResourcePack]);

	const removeMerchant = useCallback(
		(index: number) => {
			const newMerchants = merchants.filter((_, i) => i !== index);
			updateResourcePack(() => ({ ...data, merchants: newMerchants }));
			if (selectedIndex === index) {
				setSelectedIndex(newMerchants.length > 0 ? 0 : null);
			} else if (selectedIndex !== null && selectedIndex > index) {
				setSelectedIndex(selectedIndex - 1);
			}
		},
		[data, merchants, selectedIndex, updateResourcePack]
	);

	const updateMerchant = useCallback(
		(index: number | null, updates: Partial<MerchantConfig>) => {
			if (index === null) return;
			const newMerchants = [...merchants];
			newMerchants[index] = {
				...newMerchants[index],
				...updates,
			} as MerchantConfig;
			updateResourcePack(() => ({ ...data, merchants: newMerchants }));
		},
		[data, merchants, updateResourcePack]
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
		<EditorWorkspace>
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
		</EditorWorkspace>
	);
}
