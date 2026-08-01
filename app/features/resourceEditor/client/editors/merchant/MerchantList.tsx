import { memo, useCallback } from 'react';

import type { Character } from '@/domain/resourcePack/contracts/character';
import type { MerchantConfig } from '@/domain/resourcePack/contracts/merchant';

import { SectionDeleteButton } from '@/features/resourceEditor/client/components/actions/SectionDeleteButton';
import {
	EditorCollectionItem,
	EditorCollectionItemMeta,
	EditorCollectionItemTitle,
} from '@/features/resourceEditor/client/components/layout/EditorCollectionItem';
import { EditorCollectionPanel } from '@/features/resourceEditor/client/components/layout/EditorCollectionPanel';
import { ErrorBadge } from '@/features/resourceEditor/client/components/status/ErrorBadge';

interface MerchantListProps {
	merchants: MerchantConfig[];
	allCharacters: Character[];
	selectedIndex: number | null;
	onSelect: (index: number) => void;
	onAdd: () => void;
	onRemove: (index: number) => void;
}

export const MerchantList = memo<MerchantListProps>(function MerchantList({
	merchants,
	allCharacters,
	selectedIndex,
	onSelect,
	onAdd,
	onRemove,
}) {
	const isKeyDuplicate = useCallback(
		(key: string, index: number) =>
			merchants.some(
				(item, itemIndex) =>
					itemIndex !== index && item.key === key && key.length > 0
			),
		[merchants]
	);

	const getCharacterName = useCallback(
		(label: string) => {
			const character = allCharacters.find(
				(item) => item.label === label
			);
			return character
				? `${character.name}（${label}）`
				: label || '未选择角色';
		},
		[allCharacters]
	);

	return (
		<EditorCollectionPanel
			title="商人列表"
			addLabel="新建商人"
			emptyTitle="暂无商人"
			hasItems={merchants.length > 0}
			onAdd={onAdd}
		>
			{merchants.map((merchant, index) => {
				const isDuplicate = isKeyDuplicate(merchant.key, index);

				return (
					<EditorCollectionItem
						key={index}
						isInvalid={isDuplicate}
						isSelected={selectedIndex === index}
						onSelect={() => onSelect(index)}
						actions={
							<SectionDeleteButton
								iconOnly
								confirmTitle="确定要删除这个商人吗？"
								onPress={() => onRemove(index)}
							>
								删除商人
							</SectionDeleteButton>
						}
					>
						<EditorCollectionItemTitle>
							<span className="min-w-0 break-words">
								{getCharacterName(merchant.key)}
							</span>
							{isDuplicate && <ErrorBadge>Key重复</ErrorBadge>}
						</EditorCollectionItemTitle>
						<EditorCollectionItemMeta>
							商品数：{merchant.merchandise.length} · 价格倍率：
							{merchant.priceMultiplierMin.toFixed(2)}～
							{merchant.priceMultiplierMax.toFixed(2)}
						</EditorCollectionItemMeta>
					</EditorCollectionItem>
				);
			})}
		</EditorCollectionPanel>
	);
});
