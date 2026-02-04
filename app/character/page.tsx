'use client';

import { useCallback, useMemo, useState } from 'react';

import { useData } from '@/components/DataContext';

import { CharacterEditor } from '@/components/CharacterEditor';
import { CharacterList } from '@/components/CharacterList';
import { Header } from '@/components/Header';

import type { Character, CharacterType } from '@/types/resource';

const DEFAULT_CHARACTER: Character = {
	id: 0,
	name: '',
	label: '',
	descriptions: ['', '', ''],
	type: 'Special',
	portraits: [],
};

export default function CharacterPage() {
	const { data, setData, setHasUnsavedChanges } = useData();
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
		const newChar = { ...DEFAULT_CHARACTER, id: newId };
		const newCharacters = sortCharacters([...data.characters, newChar]);
		setData({ ...data, characters: newCharacters });
		const newIndex = newCharacters.indexOf(newChar);
		setSelectedIndex(newIndex);
		setHasUnsavedChanges(true);
	}, [data, setData, setHasUnsavedChanges, sortCharacters]);

	const removeCharacter = useCallback(
		(index: number | null) => {
			if (index === null) {
				return;
			}
			if (!confirm('确定要删除这个角色吗？此操作不可撤销。')) {
				return;
			}
			const newCharacters = [...data.characters];
			newCharacters.splice(index, 1);
			setData({ ...data, characters: newCharacters });
			setSelectedIndex(null);
			setHasUnsavedChanges(true);
		},
		[data, setData, setHasUnsavedChanges]
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

			setHasUnsavedChanges(true);

			if ('id' in updates || 'type' in updates) {
				const sorted = sortCharacters(newCharacters);
				setData({ ...data, characters: sorted });
				const newIndex = sorted.indexOf(updatedChar);
				setSelectedIndex(newIndex);
			} else {
				setData({ ...data, characters: newCharacters });
			}
		},
		[data, setData, setHasUnsavedChanges, sortCharacters]
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
		<main className="flex min-h-screen flex-col">
			<Header />

			<div className="container mx-auto w-full max-w-7xl px-6 py-8 3xl:max-w-screen-2xl 4xl:max-w-screen-3xl">
				<div className="relative grid grid-cols-1 gap-8 lg:grid-cols-3">
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
				</div>
			</div>
		</main>
	);
}
