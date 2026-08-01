import { memo, useCallback } from 'react';

import type { Beverage } from '@/domain/resourcePack/contracts/items';

import { SectionDeleteButton } from '@/features/resourceEditor/client/components/actions/SectionDeleteButton';
import {
	EditorCollectionItem,
	EditorCollectionItemMeta,
	EditorCollectionItemTitle,
} from '@/features/resourceEditor/client/components/layout/EditorCollectionItem';
import { EditorCollectionPanel } from '@/features/resourceEditor/client/components/layout/EditorCollectionPanel';
import { ErrorBadge } from '@/features/resourceEditor/client/components/status/ErrorBadge';

import { BeveragePreviewPopover } from './BeveragePreviewPopover';

interface BeverageListProps {
	beverages: Beverage[];
	selectedIndex: number | null;
	onSelect: (index: number) => void;
	onAdd: () => void;
	onRemove: (index: number) => void;
}

export const BeverageList = memo<BeverageListProps>(function BeverageList({
	beverages,
	selectedIndex,
	onSelect,
	onAdd,
	onRemove,
}) {
	const isIdDuplicate = useCallback(
		(id: number, index: number) => {
			return beverages.some((bev, i) => i !== index && bev.id === id);
		},
		[beverages]
	);

	return (
		<EditorCollectionPanel
			title="酒水列表"
			addLabel="新建酒水"
			emptyTitle="暂无酒水"
			hasItems={beverages.length > 0}
			onAdd={onAdd}
		>
			{beverages.map((beverage, index) => {
				const isDuplicate = isIdDuplicate(beverage.id, index);

				return (
					<EditorCollectionItem
						key={index}
						isInvalid={isDuplicate}
						isSelected={selectedIndex === index}
						onSelect={() => onSelect(index)}
						actions={
							<>
								<BeveragePreviewPopover beverage={beverage} />
								<SectionDeleteButton
									iconOnly
									confirmTitle="删除这个酒水？"
									onPress={() => onRemove(index)}
								>
									删除酒水
								</SectionDeleteButton>
							</>
						}
					>
						<EditorCollectionItemTitle>
							<span className="min-w-0 break-words">
								{beverage.name}
							</span>
							{isDuplicate && <ErrorBadge>ID重复</ErrorBadge>}
						</EditorCollectionItemTitle>
						<EditorCollectionItemMeta>
							ID：{beverage.id} · 等级：{beverage.level}
						</EditorCollectionItemMeta>
					</EditorCollectionItem>
				);
			})}
		</EditorCollectionPanel>
	);
});
