'use client';

import { type ChangeEvent, useCallback, useMemo, useState } from 'react';

import { useData } from '@/components/DataContext';

import { CharacterEditor } from '@/components/CharacterEditor';
import { CharacterList } from '@/components/CharacterList';
import { Header } from '@/components/Header';

import type { Character, CharacterType, ResourceEx } from '@/types/resource';

const DEFAULT_CHARACTER: Character = {
	id: 0,
	name: '',
	label: '',
	descriptions: ['', '', ''],
	type: 'Special',
	portraits: [],
};

export default function CharacterPage() {
	const { data, setData, hasUnsavedChanges, setHasUnsavedChanges } =
		useData();
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

	const handleFileUpload = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			if (
				hasUnsavedChanges &&
				!confirm('当前有未保存的更改，确定要覆盖吗？')
			) {
				return;
			}

			const file = e.target.files?.[0];
			if (!file) {
				return;
			}

			const reader = new FileReader();

			reader.addEventListener('load', (event) => {
				try {
					const json = JSON.parse(
						event.target?.result as string
					) as Partial<ResourceEx>;
					if (json.characters) {
						json.characters = json.characters.map((char) => ({
							...char,
							descriptions: char.descriptions
								? [...char.descriptions, '', '', ''].slice(0, 3)
								: ['', '', ''],
							guest: char.guest
								? {
										...char.guest,
										evaluation: char.guest.evaluation
											? [
													...char.guest.evaluation,
													...Array(9).fill(''),
												].slice(0, 9)
											: Array(9).fill(''),
										// 导入时，确保请求列表存在
										foodRequests:
											char.guest.foodRequests || [],
										bevRequests:
											char.guest.bevRequests || [],
									}
								: undefined,
						}));
					}
					setData(json as ResourceEx);
					setSelectedIndex(null);
					setHasUnsavedChanges(false);
				} catch {
					alert('无法读取文件，请确保文件格式正确。');
				}
			});

			reader.readAsText(file);
		},
		[hasUnsavedChanges, setData, setHasUnsavedChanges]
	);

	const handleCreateBlank = useCallback(() => {
		if (
			hasUnsavedChanges &&
			!confirm('当前有未保存的更改，确定要清空吗？')
		) {
			return;
		}
		setData({ characters: [], dialogPackages: [] });
		setSelectedIndex(null);
		setHasUnsavedChanges(false);
	}, [hasUnsavedChanges, setData, setHasUnsavedChanges]);

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

	const downloadJson = useCallback(() => {
		const exportData = {
			...data,
			characters: data.characters.map((char) => {
				if (!char.guest) {
					return char;
				}
				const activeLikeFoodTagIds = char.guest.likeFoodTag.map(
					(t) => t.tagId
				);
				const activeLikeBevTagIds = char.guest.likeBevTag.map(
					(t) => t.tagId
				);
				return {
					...char,
					guest: {
						...char.guest,
						foodRequests: char.guest.foodRequests.filter(
							({ tagId }) => activeLikeFoodTagIds.includes(tagId)
						),
						bevRequests: (char.guest.bevRequests || []).filter(
							({ tagId }) => activeLikeBevTagIds.includes(tagId)
						),
					},
				};
			}),
		};
		const blob = new Blob([JSON.stringify(exportData, null, 2)], {
			type: 'application/json',
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'ResourceEx.json';
		a.click();
		URL.revokeObjectURL(url);
		setHasUnsavedChanges(false);
	}, [data, setHasUnsavedChanges]);

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
			<Header
				onCreateBlank={handleCreateBlank}
				onDownload={downloadJson}
				onFileUpload={handleFileUpload}
			/>

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
