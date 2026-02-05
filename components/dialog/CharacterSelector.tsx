import { memo, useId } from 'react';

import { SPECIAL_GUESTS } from '@/data/specialGuest';
import type { Character, CharacterType } from '@/types/resource';
import { Label } from '@/components/common/Label';

interface CharacterSelectorProps {
	characterType: CharacterType;
	customCharacters: Character[];
	value: number;
	onChange: (id: number, type: CharacterType) => void;
}

export const CharacterSelector = memo<CharacterSelectorProps>(
	function CharacterSelector({
		characterType,
		customCharacters,
		value,
		onChange,
	}: CharacterSelectorProps) {
		const id = useId();

		return (
			<div className="flex flex-col gap-1">
				<Label htmlFor={id}>角色</Label>
				<select
					id={id}
					value={`${characterType}:${value}`}
					onChange={(e) => {
						const [type, id] = e.target.value.split(':');
						if (type && id) {
							onChange(parseInt(id), type as CharacterType);
						}
					}}
					className="h-9 w-full rounded-lg border border-black/10 bg-white/40 px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-black/30 focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-black/10 dark:focus:border-white/10 dark:focus:ring-white/10"
				>
					<optgroup label="游戏角色" className="text-black">
						{SPECIAL_GUESTS.map(({ id, name }) => (
							<option
								key={`Special:${id}`}
								value={`Special:${id}`}
								className="text-black"
							>
								({id}) {name}
							</option>
						))}
					</optgroup>
					{customCharacters.length > 0 && (
						<optgroup label="自定义角色" className="text-black">
							{customCharacters.map(({ id, name, type }) => (
								<option
									key={`${type}:${id}`}
									value={`${type}:${id}`}
									className="text-black"
								>
									({id}) {name} [{type}]
								</option>
							))}
						</optgroup>
					)}
				</select>
			</div>
		);
	}
);
