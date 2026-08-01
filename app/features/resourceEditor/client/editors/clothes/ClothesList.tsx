import { memo, useCallback } from 'react';

import type { Clothes } from '@/domain/resourcePack/contracts/items';

import { SectionDeleteButton } from '@/features/resourceEditor/client/components/actions/SectionDeleteButton';
import {
	EditorCollectionItem,
	EditorCollectionItemMeta,
	EditorCollectionItemTitle,
} from '@/features/resourceEditor/client/components/layout/EditorCollectionItem';
import { EditorCollectionPanel } from '@/features/resourceEditor/client/components/layout/EditorCollectionPanel';
import { ErrorBadge } from '@/features/resourceEditor/client/components/status/ErrorBadge';

interface ClothesListProps {
	clothes: Clothes[];
	selectedIndex: number | null;
	onSelect: (index: number) => void;
	onAdd: () => void;
	onRemove: (index: number) => void;
}

export const ClothesList = memo<ClothesListProps>(function ClothesList({
	clothes,
	selectedIndex,
	onSelect,
	onAdd,
	onRemove,
}) {
	const isIdDuplicate = useCallback(
		(id: number, index: number) =>
			clothes.some(
				(item, itemIndex) => itemIndex !== index && item.id === id
			),
		[clothes]
	);

	return (
		<EditorCollectionPanel
			title="衣服列表"
			addLabel="新建衣服"
			emptyTitle="暂无衣服"
			hasItems={clothes.length > 0}
			onAdd={onAdd}
		>
			{clothes.map((item, index) => {
				const isDuplicate = isIdDuplicate(item.id, index);

				return (
					<EditorCollectionItem
						key={index}
						isInvalid={isDuplicate}
						isSelected={selectedIndex === index}
						onSelect={() => onSelect(index)}
						actions={
							<SectionDeleteButton
								iconOnly
								confirmTitle="删除这件衣服？"
								onPress={() => onRemove(index)}
							>
								删除衣服
							</SectionDeleteButton>
						}
					>
						<EditorCollectionItemTitle>
							<span className="min-w-0 break-words">
								{item.name || '未命名衣服'}
							</span>
							{isDuplicate && <ErrorBadge>ID重复</ErrorBadge>}
						</EditorCollectionItemTitle>
						<EditorCollectionItemMeta>
							ID：{item.id}
						</EditorCollectionItemMeta>
					</EditorCollectionItem>
				);
			})}
		</EditorCollectionPanel>
	);
});
