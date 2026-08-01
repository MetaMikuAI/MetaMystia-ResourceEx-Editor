import { memo, useCallback } from 'react';

import type { Food } from '@/domain/resourcePack/contracts/items';

import { SectionDeleteButton } from '@/features/resourceEditor/client/components/actions/SectionDeleteButton';
import {
	EditorCollectionItem,
	EditorCollectionItemMeta,
	EditorCollectionItemTitle,
} from '@/features/resourceEditor/client/components/layout/EditorCollectionItem';
import { EditorCollectionPanel } from '@/features/resourceEditor/client/components/layout/EditorCollectionPanel';
import { ErrorBadge } from '@/features/resourceEditor/client/components/status/ErrorBadge';

import { FoodPreviewPopover } from './FoodPreviewPopover';

interface FoodListProps {
	foods: Food[];
	selectedIndex: number | null;
	onSelect: (index: number) => void;
	onAdd: () => void;
	onRemove: (index: number) => void;
}

export const FoodList = memo<FoodListProps>(function FoodList({
	foods,
	selectedIndex,
	onSelect,
	onAdd,
	onRemove,
}) {
	const isIdDuplicate = useCallback(
		(id: number, index: number) =>
			foods.some(
				(item, itemIndex) => itemIndex !== index && item.id === id
			),
		[foods]
	);

	return (
		<EditorCollectionPanel
			title="料理列表"
			addLabel="新建料理"
			emptyTitle="暂无料理"
			hasItems={foods.length > 0}
			onAdd={onAdd}
		>
			{foods.map((food, index) => {
				const isDuplicate = isIdDuplicate(food.id, index);

				return (
					<EditorCollectionItem
						key={index}
						isInvalid={isDuplicate}
						isSelected={selectedIndex === index}
						onSelect={() => onSelect(index)}
						actions={
							<>
								<FoodPreviewPopover foodId={food.id} />
								<SectionDeleteButton
									iconOnly
									confirmTitle="确定要删除这个料理吗？"
									onPress={() => onRemove(index)}
								>
									删除料理
								</SectionDeleteButton>
							</>
						}
					>
						<EditorCollectionItemTitle>
							<span className="min-w-0 break-words">
								{food.name}
							</span>
							{isDuplicate && <ErrorBadge>ID重复</ErrorBadge>}
						</EditorCollectionItemTitle>
						<EditorCollectionItemMeta>
							ID：{food.id} · 等级：{food.level}
						</EditorCollectionItemMeta>
					</EditorCollectionItem>
				);
			})}
		</EditorCollectionPanel>
	);
});
