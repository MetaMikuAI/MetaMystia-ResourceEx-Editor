'use client';

import { type ChangeEvent, useMemo, useState } from 'react';
import type { Character, CharacterType, ResourceEx } from '@/types/resource';
import { Header } from '@/components/Header';
import { CharacterList } from '@/components/CharacterList';
import { CharacterEditor } from '@/components/CharacterEditor';
import { useData } from '@/components/DataContext';

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

	const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
		if (
			hasUnsavedChanges &&
			!confirm('当前有未保存的更改，确定要覆盖吗？')
		) {
			return;
		}
		const file = e.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (event) => {
			try {
				const json = JSON.parse(
					event.target?.result as string
				) as ResourceEx;
				// 确保每个角色都有 3 条描述
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
									foodRequests: char.guest.foodRequests || [],
									bevRequests: char.guest.bevRequests || [],
								}
							: undefined,
					}));
				}
				setData(json);
				setSelectedIndex(null);
				setHasUnsavedChanges(false);
			} catch (err) {
				alert('Failed to parse JSON');
			}
		};
		reader.readAsText(file);
	};

	const handleCreateBlank = () => {
		if (
			hasUnsavedChanges &&
			!confirm('当前有未保存的更改，确定要清空吗？')
		) {
			return;
		}
		setData({ characters: [], dialogPackages: [] });
		setSelectedIndex(null);
		setHasUnsavedChanges(false);
	};

	const sortCharacters = (chars: Character[]) => {
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
	};

	const addCharacter = () => {
		const newId =
			data.characters.length > 0
				? Math.max(...data.characters.map((c) => c.id)) + 1
				: 9000;
		const newChar = { ...DEFAULT_CHARACTER, id: newId };
		const newCharacters = sortCharacters([...data.characters, newChar]);
		setData({ ...data, characters: newCharacters });
		// 找到排序后新角色的索引
		const newIndex = newCharacters.indexOf(newChar);
		setSelectedIndex(newIndex);
		setHasUnsavedChanges(true);
	};

	const removeCharacter = (index: number) => {
		if (!confirm('确定要删除这个角色吗？此操作不可撤销。')) return;
		const newCharacters = [...data.characters];
		newCharacters.splice(index, 1);
		setData({ ...data, characters: newCharacters });
		setSelectedIndex(null);
		setHasUnsavedChanges(true);
	};

	const updateCharacter = (index: number, updates: Partial<Character>) => {
		const newCharacters = [...data.characters];
		const updatedChar = {
			...newCharacters[index],
			...updates,
		} as Character;
		newCharacters[index] = updatedChar;

		setHasUnsavedChanges(true);

		// 如果更新了 id 或 type，需要重新排序
		if ('id' in updates || 'type' in updates) {
			const sorted = sortCharacters(newCharacters);
			setData({ ...data, characters: sorted });
			// 使用对象引用查找新索引，确保即使 ID 重复也能选中正确的角色
			const newIndex = sorted.indexOf(updatedChar);
			setSelectedIndex(newIndex);
		} else {
			setData({ ...data, characters: newCharacters });
		}
	};

	const downloadJson = () => {
		const exportData = {
			...data,
			characters: data.characters.map((char) => {
				if (!char.guest) return char;
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
						foodRequests: char.guest.foodRequests.filter((req) =>
							activeLikeFoodTagIds.includes(req.tagId)
						),
						bevRequests: (char.guest.bevRequests || []).filter(
							(req) => activeLikeBevTagIds.includes(req.tagId)
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
	};

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

	const isIdDuplicate = (id: number, currentIndex: number) => {
		return data.characters.some(
			(c, i) => i !== currentIndex && c.id === id
		);
	};

	return (
		<main className="flex min-h-screen flex-col">
			<Header
				onCreateBlank={handleCreateBlank}
				onFileUpload={handleFileUpload}
				onDownload={downloadJson}
				currentPage="character"
			/>

			<div className="mx-auto w-full max-w-6xl p-8">
				<div className="grid grid-cols-1 gap-8 md:grid-cols-3">
					<CharacterList
						characters={data.characters}
						selectedIndex={selectedIndex}
						onSelect={setSelectedIndex}
						onAdd={addCharacter}
					/>

					<CharacterEditor
						character={selectedChar}
						isIdDuplicate={
							selectedChar
								? isIdDuplicate(selectedChar.id, selectedIndex!)
								: false
						}
						onUpdate={(updates) =>
							updateCharacter(selectedIndex!, updates)
						}
						onRemove={() => removeCharacter(selectedIndex!)}
					/>
				</div>
			</div>
		</main>
	);
}
