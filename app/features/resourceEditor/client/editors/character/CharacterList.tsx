import { memo, useCallback } from 'react';

import type { Character } from '@/domain/resourcePack/contracts/character';

import {
	EditorCollectionItem,
	EditorCollectionItemMeta,
	EditorCollectionItemTitle,
} from '@/features/resourceEditor/client/components/layout/EditorCollectionItem';
import { EditorCollectionPanel } from '@/features/resourceEditor/client/components/layout/EditorCollectionPanel';
import { ErrorBadge } from '@/features/resourceEditor/client/components/status/ErrorBadge';
import { WarningBadge } from '@/features/resourceEditor/client/components/status/WarningBadge';
import { usePackLabelPrefix } from '@/features/resourceEditor/client/hooks/useLabelPrefixValidation';

interface CharacterListProps {
	characters: Character[];
	selectedIndex: number | null;
	onAdd: () => void;
	onSelect: (index: number) => void;
}

export const CharacterList = memo<CharacterListProps>(function CharacterList({
	characters,
	selectedIndex,
	onAdd,
	onSelect,
}) {
	const isIdDuplicate = useCallback(
		(id: number, index: number) => {
			return characters.some((c, i) => i !== index && c.id === id);
		},
		[characters]
	);

	const packLabelPrefix = usePackLabelPrefix();
	return (
		<EditorCollectionPanel
			title="角色列表"
			addLabel="新建角色"
			emptyTitle="暂无角色"
			hasItems={characters.length > 0}
			onAdd={onAdd}
		>
			{characters.map((char, index) => {
				const isDuplicate = isIdDuplicate(char.id, index);
				const hasPrefixWarning =
					packLabelPrefix &&
					packLabelPrefix !== '_' &&
					char.label &&
					!char.label.startsWith(packLabelPrefix);

				return (
					<EditorCollectionItem
						key={index}
						isInvalid={isDuplicate}
						isSelected={selectedIndex === index}
						onSelect={() => onSelect(index)}
					>
						<EditorCollectionItemTitle>
							<span className="min-w-0 break-words">
								{char.name || '未命名角色'}
							</span>
							{isDuplicate && <ErrorBadge>ID重复</ErrorBadge>}
							{hasPrefixWarning && (
								<WarningBadge>前缀不规范</WarningBadge>
							)}
						</EditorCollectionItemTitle>
						<EditorCollectionItemMeta>
							ID：{char.id} · {char.type}
						</EditorCollectionItemMeta>
					</EditorCollectionItem>
				);
			})}
		</EditorCollectionPanel>
	);
});
