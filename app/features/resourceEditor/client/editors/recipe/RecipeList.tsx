import { memo, useCallback, useMemo } from 'react';

import { COOKER_TYPE_NAMES } from '@/domain/data/cookerTypes';
import { FOOD_NAMES } from '@/domain/data/foods';
import type { Recipe } from '@/domain/resourcePack/contracts/items';

import { SectionDeleteButton } from '@/features/resourceEditor/client/components/actions/SectionDeleteButton';
import {
	EditorCollectionItem,
	EditorCollectionItemMeta,
	EditorCollectionItemTitle,
} from '@/features/resourceEditor/client/components/layout/EditorCollectionItem';
import { EditorCollectionPanel } from '@/features/resourceEditor/client/components/layout/EditorCollectionPanel';
import { ErrorBadge } from '@/features/resourceEditor/client/components/status/ErrorBadge';
import { FoodPreviewPopover } from '@/features/resourceEditor/client/editors/food/FoodPreviewPopover';

interface RecipeListProps {
	recipes: Recipe[];
	customIngredients: Array<{ id: number; name: string }>;
	customFoods: Array<{ id: number; name: string }>;
	selectedIndex: number | null;
	onSelect: (index: number) => void;
	onAdd: () => void;
	onRemove: (index: number) => void;
}

export const RecipeList = memo<RecipeListProps>(function RecipeList({
	recipes,
	customFoods,
	selectedIndex,
	onSelect,
	onAdd,
	onRemove,
}) {
	const isIdDuplicate = useCallback(
		(id: number, index: number) =>
			recipes.some(
				(item, itemIndex) => itemIndex !== index && item.id === id
			),
		[recipes]
	);

	const allFoods = useMemo(
		() => [...FOOD_NAMES, ...customFoods],
		[customFoods]
	);

	const getFoodName = useCallback(
		(foodId: number) => {
			const food = allFoods.find((item) => item.id === foodId);
			return food?.name || `未知料理（${foodId}）`;
		},
		[allFoods]
	);

	return (
		<EditorCollectionPanel
			title="食谱列表"
			addLabel="新建食谱"
			emptyTitle="暂无食谱"
			hasItems={recipes.length > 0}
			onAdd={onAdd}
		>
			{recipes.map((recipe, index) => {
				const isDuplicate = isIdDuplicate(recipe.id, index);

				return (
					<EditorCollectionItem
						key={index}
						isInvalid={isDuplicate}
						isSelected={selectedIndex === index}
						onSelect={() => onSelect(index)}
						actions={
							<>
								<FoodPreviewPopover foodId={recipe.foodId} />
								<SectionDeleteButton
									iconOnly
									confirmTitle="确定要删除这个食谱吗？"
									onPress={() => onRemove(index)}
								>
									删除食谱
								</SectionDeleteButton>
							</>
						}
					>
						<EditorCollectionItemTitle>
							<span className="min-w-0 break-words">
								{getFoodName(recipe.foodId)}
							</span>
							{isDuplicate && <ErrorBadge>ID重复</ErrorBadge>}
						</EditorCollectionItemTitle>
						<EditorCollectionItemMeta>
							ID：{recipe.id} · 厨具：
							{COOKER_TYPE_NAMES[recipe.cookerType]}
						</EditorCollectionItemMeta>
					</EditorCollectionItem>
				);
			})}
		</EditorCollectionPanel>
	);
});
