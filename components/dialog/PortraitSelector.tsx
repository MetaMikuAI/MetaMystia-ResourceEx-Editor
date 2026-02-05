import { memo, useId, useMemo } from 'react';

import { SPECIAL_PORTRAITS } from '@/data/specialPortraits';
import type { Character, CharacterType } from '@/types/resource';
import { Label } from '@/components/common/Label';

interface PortraitSelectorProps {
	characterId: number;
	characterType: CharacterType;
	value: number;
	onChange: (pid: number) => void;
	customCharacters: Character[];
}

export const PortraitSelector = memo<PortraitSelectorProps>(
	function PortraitSelector({
		characterId,
		characterType,
		customCharacters,
		value,
		onChange,
	}) {
		const id = useId();

		const portraits = useMemo(() => {
			const customChar = customCharacters.find(
				({ id, type }) => id === characterId && type === characterType
			);

			if (customChar) {
				return (customChar.portraits ?? []).map(({ label, pid }) => ({
					pid,
					name: label || `立绘${pid}`,
				}));
			}
			if (characterType === 'Special') {
				return SPECIAL_PORTRAITS.filter(
					(p) => p.characterId === characterId
				).map(({ name, pid }) => ({ name, pid }));
			}

			return [];
		}, [characterId, characterType, customCharacters]);

		return (
			<div className="flex flex-col gap-1">
				<Label htmlFor={id}>表情/立绘</Label>
				<select
					id={id}
					value={value}
					onChange={(e) => {
						onChange(parseInt(e.target.value));
					}}
					className="h-9 w-full rounded-lg border border-black/10 bg-white/40 px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-black/30 focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-black/10 dark:focus:border-white/10 dark:focus:ring-white/10"
				>
					{portraits.length > 0 ? (
						portraits.map(({ name, pid }, index) => (
							<option
								key={index}
								value={pid}
								className="text-black"
							>
								({pid}) {name}
							</option>
						))
					) : (
						<option value={0} className="text-black">
							无可用立绘
						</option>
					)}
				</select>
			</div>
		);
	}
);
