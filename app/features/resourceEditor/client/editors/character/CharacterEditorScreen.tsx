'use client';

import { useCallback, useMemo, useState } from 'react';

import type {
	Character,
	CharacterType,
} from '@/domain/resourcePack/contracts/character';

import { EditorWorkspace } from '@/features/resourceEditor/client/components/layout/EditorWorkspace';
import { useResourceEditor } from '@/features/resourceEditor/client/state/useResourceEditor';

import { CharacterEditor } from './CharacterEditor';
import { CharacterList } from './CharacterList';

const DEFAULT_CHARACTER = {
	id: 0,
	name: '',
	descriptions: ['', '', ''],
	type: 'Special' as const,
	portraits: [],
};

export function CharacterEditorScreen() {
	const { resourcePack: data, updateResourcePack } = useResourceEditor();
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

	const sortCharacters = useCallback((chars: Character[]) => {
		const typeOrder: Record<CharacterType, number> = {
			Self: 0,
			Special: 1,
			Normal: 2,
			Unknown: 3,
		};

		return [...chars].sort((a, b) => {
			if (a.type !== b.type) {
				return typeOrder[a.type] - typeOrder[b.type];
			}
			return a.id - b.id;
		});
	}, []);

	const addCharacter = useCallback(() => {
		const newId =
			data.characters.length > 0
				? Math.max(...data.characters.map((c) => c.id)) + 1
				: 9000;
		const packLabel = data.packInfo.label;
		const labelPrefix = packLabel ? `_${packLabel}_` : '_';
		const newChar: Character = {
			...DEFAULT_CHARACTER,
			id: newId,
			label: labelPrefix,
		};
		const newCharacters = sortCharacters([...data.characters, newChar]);
		updateResourcePack(() => ({ ...data, characters: newCharacters }));
		const newIndex = newCharacters.indexOf(newChar);
		setSelectedIndex(newIndex);
	}, [data, sortCharacters, updateResourcePack]);

	const removeCharacter = useCallback(
		(index: number | null) => {
			if (index === null) {
				return;
			}
			const newCharacters = [...data.characters];
			newCharacters.splice(index, 1);
			updateResourcePack(() => ({ ...data, characters: newCharacters }));
			setSelectedIndex(null);
		},
		[data, updateResourcePack]
	);

	const updateCharacter = useCallback(
		(index: number | null, updates: Partial<Character>) => {
			if (index === null) {
				return;
			}

			const newCharacters = [...data.characters];
			const updatedChar = {
				...newCharacters[index],
				...updates,
			} as Character;
			newCharacters[index] = updatedChar;

			if ('id' in updates || 'type' in updates) {
				const sorted = sortCharacters(newCharacters);
				updateResourcePack(() => ({ ...data, characters: sorted }));
				const newIndex = sorted.indexOf(updatedChar);
				setSelectedIndex(newIndex);
			} else {
				updateResourcePack(() => ({
					...data,
					characters: newCharacters,
				}));
			}
		},
		[data, sortCharacters, updateResourcePack]
	);

	const selectedChar = useMemo(() => {
		if (selectedIndex === null) {
			return null;
		}

		const char = data.characters[selectedIndex];
		if (char === undefined) {
			throw new ReferenceError('Selected character not found');
		}

		return char;
	}, [data.characters, selectedIndex]);

	const isIdDuplicate = useCallback(
		(id: number, index: number | null) => {
			return data.characters.some((c, i) => i !== index && c.id === id);
		},
		[data.characters]
	);

	return (
		<EditorWorkspace>
			<CharacterList
				characters={data.characters}
				selectedIndex={selectedIndex}
				onAdd={addCharacter}
				onSelect={setSelectedIndex}
			/>

			<CharacterEditor
				character={selectedChar}
				allEvents={data.eventNodes || []}
				allDialogPackages={data.dialogPackages || []}
				isIdDuplicate={
					selectedChar
						? isIdDuplicate(selectedChar.id, selectedIndex)
						: false
				}
				onRemove={() => {
					removeCharacter(selectedIndex);
				}}
				onUpdate={(updates) => {
					updateCharacter(selectedIndex, updates);
				}}
			/>
		</EditorWorkspace>
	);
}
