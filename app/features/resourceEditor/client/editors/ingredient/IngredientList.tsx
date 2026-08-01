import { memo, useCallback } from 'react';

import type { Ingredient } from '@/domain/resourcePack/contracts/items';

import { SectionDeleteButton } from '@/features/resourceEditor/client/components/actions/SectionDeleteButton';
import {
	EditorCollectionItem,
	EditorCollectionItemMeta,
	EditorCollectionItemTitle,
} from '@/features/resourceEditor/client/components/layout/EditorCollectionItem';
import { EditorCollectionPanel } from '@/features/resourceEditor/client/components/layout/EditorCollectionPanel';
import { ErrorBadge } from '@/features/resourceEditor/client/components/status/ErrorBadge';

import { IngredientPreviewPopover } from './IngredientPreviewPopover';

interface IngredientListProps {
	ingredients: Ingredient[];
	selectedIndex: number | null;
	onSelect: (index: number) => void;
	onAdd: () => void;
	onRemove: (index: number) => void;
}

export const IngredientList = memo<IngredientListProps>(
	function IngredientList({
		ingredients,
		selectedIndex,
		onSelect,
		onAdd,
		onRemove,
	}) {
		const isIdDuplicate = useCallback(
			(id: number, index: number) =>
				ingredients.some(
					(item, itemIndex) => itemIndex !== index && item.id === id
				),
			[ingredients]
		);

		return (
			<EditorCollectionPanel
				title="食材列表"
				addLabel="新建食材"
				emptyTitle="暂无食材"
				hasItems={ingredients.length > 0}
				onAdd={onAdd}
			>
				{ingredients.map((ingredient, index) => {
					const isDuplicate = isIdDuplicate(ingredient.id, index);

					return (
						<EditorCollectionItem
							key={index}
							isInvalid={isDuplicate}
							isSelected={selectedIndex === index}
							onSelect={() => onSelect(index)}
							actions={
								<>
									<IngredientPreviewPopover
										ingredient={ingredient}
									/>
									<SectionDeleteButton
										iconOnly
										confirmTitle="确定要删除这个食材吗？"
										onPress={() => onRemove(index)}
									>
										删除食材
									</SectionDeleteButton>
								</>
							}
						>
							<EditorCollectionItemTitle>
								<span className="min-w-0 break-words">
									{ingredient.name}
								</span>
								{isDuplicate && <ErrorBadge>ID重复</ErrorBadge>}
							</EditorCollectionItemTitle>
							<EditorCollectionItemMeta>
								ID：{ingredient.id} · 等级：{ingredient.level}
							</EditorCollectionItemMeta>
						</EditorCollectionItem>
					);
				})}
			</EditorCollectionPanel>
		);
	}
);
