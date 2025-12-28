'use client';

import { type ChangeEvent, useEffect, useState } from 'react';

import { BEVERAGE_TAGS, FOOD_TAGS, FOOD_TAG_MAP } from '@/data/tags';
import { cn } from '@/lib';
import type {
	Character,
	CharacterPortrait,
	CharacterType,
	FoodRequest,
	ResourceEx,
} from '@/types/resource';

const DEFAULT_CHARACTER: Character = {
	id: 0,
	name: '',
	label: '',
	descriptions: ['', '', ''],
	type: 'Special',
	portraits: [],
};

export default function Home() {
	const [data, setData] = useState<ResourceEx>({
		characters: [],
		dialogPackages: [],
	});
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
	const [isPortraitsExpanded, setIsPortraitsExpanded] = useState(true);
	const [isGuestExpanded, setIsGuestExpanded] = useState(false);
	const [isSpriteExpanded, setIsSpriteExpanded] = useState(false);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

	useEffect(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			if (hasUnsavedChanges) {
				e.preventDefault();
				e.returnValue = '';
			}
		};
		window.addEventListener('beforeunload', handleBeforeUnload);
		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	}, [hasUnsavedChanges]);

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
									// 导入时，如果 foodRequests 中的 tagId 在 likeFoodTag 中，则默认启用
									foodRequests: char.guest.foodRequests.map(
										(req) => ({
											...req,
											enabled:
												req.enabled ??
												char.guest?.likeFoodTag.some(
													(t) => t.tagId === req.tagId
												),
										})
									),
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

	const updateDescription = (
		charIndex: number,
		descIndex: number,
		value: string
	) => {
		const newCharacters = [...data.characters];
		const newDescriptions = [
			...(newCharacters[charIndex]?.descriptions || []),
		];
		newDescriptions[descIndex] = value;
		if (newCharacters[charIndex]) {
			newCharacters[charIndex].descriptions = newDescriptions;
		}
		setData({ ...data, characters: newCharacters });
		setHasUnsavedChanges(true);
	};

	const addPortrait = (charIndex: number) => {
		const newCharacters = [...data.characters];
		const char = newCharacters[charIndex];
		const portraits = char?.portraits || [];
		const nextPid =
			portraits.length > 0
				? Math.max(...portraits.map((p) => p.pid)) + 1
				: 0;
		const label = char?.label || 'Character';
		newCharacters[charIndex] = {
			...char,
			portraits: [
				...portraits,
				{ pid: nextPid, path: `assets/${label}_${nextPid}.png` },
			],
		} as Character;
		setData({ ...data, characters: newCharacters });
		setHasUnsavedChanges(true);
	};

	const updatePortrait = (
		charIndex: number,
		portraitIndex: number,
		updates: Partial<CharacterPortrait>
	) => {
		const newCharacters = [...data.characters];
		const portraits = [...(newCharacters[charIndex]?.portraits || [])];
		portraits[portraitIndex] = {
			...portraits[portraitIndex],
			...updates,
		} as CharacterPortrait;
		newCharacters[charIndex] = {
			...newCharacters[charIndex],
			portraits,
		} as Character;
		setData({ ...data, characters: newCharacters });
		setHasUnsavedChanges(true);
	};

	const removePortrait = (charIndex: number, portraitIndex: number) => {
		const newCharacters = [...data.characters];
		const portraits = [...(newCharacters[charIndex]?.portraits || [])];
		portraits.splice(portraitIndex, 1);
		newCharacters[charIndex] = {
			...newCharacters[charIndex],
			portraits,
		} as Character;
		setData({ ...data, characters: newCharacters });
		setHasUnsavedChanges(true);
	};

	const updateGuest = (charIndex: number, updates: Partial<any>) => {
		const newCharacters = [...data.characters];
		const char = newCharacters[charIndex];
		const guest = char?.guest || {
			fundRangeLower: 0,
			fundRangeUpper: 0,
			evaluation: Array(9).fill(''),
			foodRequests: [],
			hateFoodTag: [],
			likeFoodTag: [],
			likeBevTag: [],
		};
		newCharacters[charIndex] = {
			...char,
			guest: { ...guest, ...updates },
		} as Character;
		setData({ ...data, characters: newCharacters });
		setHasUnsavedChanges(true);
	};

	const toggleLikeTag = (
		charIndex: number,
		field: 'likeFoodTag' | 'likeBevTag',
		tagId: number
	) => {
		const char = data.characters[charIndex];
		if (!char?.guest) return;

		const currentTags = char.guest[field] || [];
		const exists = currentTags.find((t) => t.tagId === tagId);

		let newTags;
		let newFoodRequests = [...(char.guest.foodRequests || [])];

		if (exists) {
			newTags = currentTags.filter((t) => t.tagId !== tagId);
		} else {
			newTags = [...currentTags, { tagId, weight: 1 }];
			if (field === 'likeFoodTag') {
				const existingReq = newFoodRequests.find(
					(r) => r.tagId === tagId
				);
				if (!existingReq) {
					newFoodRequests.push({ tagId, request: '', enabled: true });
				}
			}
		}

		updateGuest(charIndex, {
			[field]: newTags,
			foodRequests: newFoodRequests,
		});
	};

	const updateFoodRequest = (
		charIndex: number,
		requestIndex: number,
		updates: Partial<any>
	) => {
		const char = data.characters[charIndex];
		if (!char?.guest) return;
		const newRequests = [...char.guest.foodRequests];
		newRequests[requestIndex] = {
			...newRequests[requestIndex],
			...updates,
		} as FoodRequest;
		updateGuest(charIndex, { foodRequests: newRequests });
	};

	const generateDefaultSprites = (charIndex: number) => {
		const char = data.characters[charIndex];
		const label = char?.label || 'Unknown';

		const mainSprite = [];
		for (let row = 0; row < 4; row++) {
			for (let col = 0; col < 3; col++) {
				mainSprite.push(
					`assets/${label}/${label}_Main_${row}, ${col}.png`
				);
			}
		}

		const eyeSprite = [];
		for (let row = 0; row < 6; row++) {
			for (let col = 0; col < 4; col++) {
				eyeSprite.push(
					`assets/${label}/${label}_Eyes_${row}, ${col}.png`
				);
			}
		}

		updateSpriteSet(charIndex, { name: label, mainSprite, eyeSprite });
	};

	const updateSpriteSet = (charIndex: number, updates: Partial<any>) => {
		const newCharacters = [...data.characters];
		const char = newCharacters[charIndex];
		const spriteSet = char?.characterSpriteSetCompact || {
			name: char?.label || '',
			mainSprite: Array(12).fill(''),
			eyeSprite: Array(24).fill(''),
		};
		newCharacters[charIndex] = {
			...char,
			characterSpriteSetCompact: { ...spriteSet, ...updates },
		} as Character;
		setData({ ...data, characters: newCharacters });
		setHasUnsavedChanges(true);
	};

	const updateSpriteArray = (
		charIndex: number,
		field: 'mainSprite' | 'eyeSprite',
		index: number,
		value: string
	) => {
		const char = data.characters[charIndex];
		if (!char?.characterSpriteSetCompact) return;
		const newArray = [...char.characterSpriteSetCompact[field]];
		newArray[index] = value;
		updateSpriteSet(charIndex, { [field]: newArray });
	};

	const toggleHateTag = (charIndex: number, tagId: number) => {
		const char = data.characters[charIndex];
		if (!char?.guest) return;

		const currentTags = char.guest.hateFoodTag || [];
		const exists = currentTags.includes(tagId);

		let newTags;
		if (exists) {
			newTags = currentTags.filter((id) => id !== tagId);
		} else {
			newTags = [...currentTags, tagId];
		}

		updateGuest(charIndex, { hateFoodTag: newTags });
	};

	const updateEvaluation = (
		charIndex: number,
		evalIndex: number,
		value: string
	) => {
		const newCharacters = [...data.characters];
		const char = newCharacters[charIndex];
		const guest = char?.guest || {
			fundRangeLower: 0,
			fundRangeUpper: 0,
			evaluation: Array(9).fill(''),
			foodRequests: [],
			hateFoodTag: [],
			likeFoodTag: [],
			likeBevTag: [],
		};
		const newEval = [...guest.evaluation];
		newEval[evalIndex] = value;
		newCharacters[charIndex] = {
			...char,
			guest: { ...guest, evaluation: newEval },
		} as Character;
		setData({ ...data, characters: newCharacters });
		setHasUnsavedChanges(true);
	};

	const downloadJson = () => {
		// 导出时过滤掉未启用的食物请求
		const exportData = {
			...data,
			characters: data.characters.map((char) => {
				if (!char.guest) return char;
				const activeLikeTagIds = char.guest.likeFoodTag.map(
					(t) => t.tagId
				);
				return {
					...char,
					guest: {
						...char.guest,
						foodRequests: char.guest.foodRequests
							.filter(
								(req) =>
									activeLikeTagIds.includes(req.tagId) &&
									req.enabled !== false
							)
							.map(({ enabled, ...rest }) => rest), // 导出时移除 UI 专用的 enabled 字段
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

	const selectedChar =
		selectedIndex !== null ? data.characters[selectedIndex] : null;

	const isIdDuplicate = (id: number, currentIndex: number) => {
		return data.characters.some(
			(c, i) => i !== currentIndex && c.id === id
		);
	};

	const isPidDuplicate = (
		pid: number,
		currentPortraitIndex: number,
		charIndex: number
	) => {
		const portraits = data.characters[charIndex]?.portraits || [];
		return portraits.some(
			(p, i) => i !== currentPortraitIndex && p.pid === pid
		);
	};

	return (
		<main className="flex min-h-screen flex-col">
			<header className="sticky top-0 z-50 w-full border-b border-white/10 bg-white/5 backdrop-blur-md">
				<div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-8">
					<div className="flex select-none items-center gap-3">
						<div className="h-8 w-8 rounded-full border border-white/10 bg-mystia bg-cover bg-no-repeat" />
						<div className="flex items-baseline gap-2">
							<span className="text-lg font-bold tracking-tight">
								ResourceEx Editor
							</span>
							<span className="font-mono text-[10px] uppercase tracking-widest opacity-40">
								MetaMystia
							</span>
						</div>
					</div>
					<div className="flex items-center gap-1">
						<button
							onClick={handleCreateBlank}
							className="rounded-xl px-4 py-2 text-sm font-medium transition-all hover:bg-white/10 active:scale-95"
						>
							从空白创建
						</button>
						<label className="cursor-pointer rounded-xl px-4 py-2 text-sm font-medium transition-all hover:bg-white/10 active:scale-95">
							上传 JSON
							<input
								type="file"
								accept=".json"
								onChange={handleFileUpload}
								className="hidden"
							/>
						</label>
						<button
							onClick={downloadJson}
							className="rounded-xl bg-white/10 px-4 py-2 text-sm font-medium transition-all hover:bg-white/20 active:scale-95"
						>
							导出 JSON
						</button>
					</div>
				</div>
			</header>

			<div className="mx-auto w-full max-w-6xl p-8">
				<div className="grid grid-cols-1 gap-8 md:grid-cols-3">
					{/* Character List */}
					<div className="h-[70vh] overflow-y-auto rounded-2xl border border-white/20 bg-white/10 p-4 shadow-xl backdrop-blur-md">
						<div className="mb-4 flex items-center justify-between px-2">
							<h2 className="text-xl font-semibold">角色列表</h2>
							<button
								onClick={addCharacter}
								className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/10 text-lg transition-all hover:bg-white/20 active:scale-90"
							>
								+
							</button>
						</div>
						<div className="flex flex-col gap-2">
							{data.characters.map((char, index) => {
								const duplicate = isIdDuplicate(char.id, index);
								return (
									<button
										key={index}
										onClick={() => setSelectedIndex(index)}
										className={cn(
											'rounded-xl border p-4 text-left transition-all',
											selectedIndex === index
												? duplicate
													? 'border-danger bg-danger/20 shadow-inner'
													: 'border-primary bg-primary/20 shadow-inner'
												: duplicate
													? 'border-danger/50 bg-danger/10 hover:bg-danger/20'
													: 'border-transparent bg-white/5 hover:bg-white/10'
										)}
									>
										<div className="flex items-start justify-between">
											<div className="text-lg font-bold">
												{char.name || '未命名角色'}
											</div>
											{duplicate && (
												<span className="rounded bg-danger px-1.5 py-0.5 text-[10px] font-bold text-white">
													ID 重复
												</span>
											)}
										</div>
										<div className="font-mono text-xs opacity-60">
											ID: {char.id} | {char.type}
										</div>
									</button>
								);
							})}
						</div>
					</div>

					{/* Editor Form */}
					<div className="rounded-2xl border border-white/20 bg-white/10 p-8 shadow-xl backdrop-blur-md md:col-span-2">
						{selectedChar ? (
							<div className="flex flex-col gap-8">
								<div className="flex items-center justify-between border-b border-white/10 pb-4">
									<div className="flex items-center gap-4">
										<h2 className="text-2xl font-bold">
											编辑角色: {selectedChar.name}
										</h2>
										<span className="rounded-full bg-primary/20 px-3 py-1 text-sm font-bold text-primary">
											{selectedChar.type}
										</span>
									</div>
									<button
										onClick={() =>
											removeCharacter(selectedIndex!)
										}
										className="rounded-lg bg-danger/20 px-3 py-1 text-sm font-bold text-danger transition-colors hover:bg-danger/30"
									>
										删除角色
									</button>
								</div>

								<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
									<div className="flex flex-col gap-2">
										<div className="ml-1 flex items-center justify-between">
											<label className="text-sm font-bold opacity-70">
												角色 ID
											</label>
											{isIdDuplicate(
												selectedChar.id,
												selectedIndex!
											) && (
												<span className="text-[10px] font-bold text-danger">
													ID 已存在
												</span>
											)}
										</div>
										<input
											type="number"
											value={selectedChar.id}
											onChange={(e) =>
												updateCharacter(
													selectedIndex!,
													{
														id:
															parseInt(
																e.target.value
															) || 0,
													}
												)
											}
											className={cn(
												'rounded-xl border bg-black/20 p-3 transition-all focus:outline-none focus:ring-2',
												isIdDuplicate(
													selectedChar.id,
													selectedIndex!
												)
													? 'border-danger focus:ring-danger/50'
													: 'border-white/10 focus:ring-primary/50'
											)}
										/>
									</div>
									<div className="flex flex-col gap-2">
										<label className="ml-1 text-sm font-bold opacity-70">
											角色类型
										</label>
										<select
											value={selectedChar.type}
											onChange={(e) =>
												updateCharacter(
													selectedIndex!,
													{
														type: e.target
															.value as CharacterType,
													}
												)
											}
											className="appearance-none rounded-xl border border-white/10 bg-black/20 p-3 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
										>
											<option value="Special">
												Special (稀客)
											</option>
											<option value="Self">
												Self (自机)
											</option>
											<option value="Normal">
												Normal (普客)
											</option>
											<option value="Unknown">
												Unknown (未知)
											</option>
										</select>
									</div>
									<div className="flex flex-col gap-2">
										<label className="ml-1 text-sm font-bold opacity-70">
											角色名称
										</label>
										<input
											type="text"
											value={selectedChar.name}
											onChange={(e) =>
												updateCharacter(
													selectedIndex!,
													{ name: e.target.value }
												)
											}
											className="rounded-xl border border-white/10 bg-black/20 p-3 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
										/>
									</div>
									<div className="flex flex-col gap-2">
										<label className="ml-1 text-sm font-bold opacity-70">
											内部标签 (Label)
										</label>
										<input
											type="text"
											value={selectedChar.label}
											onChange={(e) =>
												updateCharacter(
													selectedIndex!,
													{ label: e.target.value }
												)
											}
											className="rounded-xl border border-white/10 bg-black/20 p-3 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
										/>
									</div>
								</div>

								<div className="flex flex-col gap-4">
									<label className="ml-1 text-sm font-bold opacity-70">
										角色图鉴描述
									</label>
									{selectedChar.descriptions.map(
										(desc, i) => (
											<div key={i} className="relative">
												<span className="absolute -left-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white shadow-lg">
													{i + 1}
												</span>
												<textarea
													value={desc}
													onChange={(e) =>
														updateDescription(
															selectedIndex!,
															i,
															e.target.value
														)
													}
													placeholder={`请输入第 ${i + 1} 条描述...`}
													className="textarea-mystia"
												/>
											</div>
										)
									)}
								</div>

								<div className="flex flex-col gap-4">
									<div className="ml-1 flex items-center justify-between">
										<div
											className="flex cursor-pointer select-none items-center gap-2"
											onClick={() =>
												setIsPortraitsExpanded(
													!isPortraitsExpanded
												)
											}
										>
											<span
												className={cn(
													'transition-transform duration-200',
													isPortraitsExpanded &&
														'rotate-90'
												)}
											>
												▶
											</span>
											<label className="cursor-pointer text-sm font-bold opacity-70">
												立绘配置 (Portraits){' '}
												{selectedChar.portraits?.length
													? `(${selectedChar.portraits.length})`
													: ''}
											</label>
										</div>
										<button
											onClick={() =>
												addPortrait(selectedIndex!)
											}
											className="rounded-lg border border-white/10 bg-white/10 px-3 py-1 text-xs transition-all hover:bg-white/20 active:scale-95"
										>
											添加立绘
										</button>
									</div>
									{isPortraitsExpanded && (
										<div className="animate-in fade-in slide-in-from-top-2 grid grid-cols-1 gap-3 duration-200">
											{selectedChar.portraits?.map(
												(portrait, i) => {
													const duplicatePid =
														isPidDuplicate(
															portrait.pid,
															i,
															selectedIndex!
														);
													return (
														<div
															key={i}
															className={cn(
																'flex items-end gap-3 rounded-xl border bg-black/10 p-4 transition-all',
																duplicatePid
																	? 'border-danger/50 bg-danger/5'
																	: 'border-white/5'
															)}
														>
															<div className="flex w-20 flex-col gap-1">
																<div className="ml-1 flex items-center justify-between">
																	<label className="text-[10px] font-bold opacity-50">
																		PID
																	</label>
																	{duplicatePid && (
																		<span className="text-[8px] font-bold text-danger">
																			重复
																		</span>
																	)}
																</div>
																<input
																	type="number"
																	value={
																		portrait.pid
																	}
																	onChange={(
																		e
																	) =>
																		updatePortrait(
																			selectedIndex!,
																			i,
																			{
																				pid:
																					parseInt(
																						e
																							.target
																							.value
																					) ||
																					0,
																			}
																		)
																	}
																	className={cn(
																		'rounded-lg border bg-black/20 p-2 text-sm transition-all focus:outline-none focus:ring-1',
																		duplicatePid
																			? 'border-danger focus:ring-danger/50'
																			: 'border-white/10 focus:ring-primary/50'
																	)}
																/>
															</div>
															<div className="flex flex-1 flex-col gap-1">
																<label className="ml-1 text-[10px] font-bold opacity-50">
																	图片路径
																</label>
																<input
																	type="text"
																	value={
																		portrait.path
																	}
																	onChange={(
																		e
																	) =>
																		updatePortrait(
																			selectedIndex!,
																			i,
																			{
																				path: e
																					.target
																					.value,
																			}
																		)
																	}
																	className="rounded-lg border border-white/10 bg-black/20 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
																/>
															</div>
															<button
																onClick={() =>
																	removePortrait(
																		selectedIndex!,
																		i
																	)
																}
																className="flex h-9 w-9 items-center justify-center rounded-lg border border-danger/20 bg-danger/10 p-2 text-danger transition-all hover:bg-danger/20 active:scale-90"
																title="删除立绘"
															>
																×
															</button>
														</div>
													);
												}
											)}
											{(!selectedChar.portraits ||
												selectedChar.portraits
													.length === 0) && (
												<div className="rounded-xl border-2 border-dashed border-white/5 py-4 text-center text-sm opacity-30">
													暂无立绘配置
												</div>
											)}
										</div>
									)}
								</div>

								<div className="flex flex-col gap-4">
									<div className="ml-1 flex items-center justify-between">
										<div
											className="flex cursor-pointer select-none items-center gap-2"
											onClick={() =>
												setIsGuestExpanded(
													!isGuestExpanded
												)
											}
										>
											<span
												className={cn(
													'transition-transform duration-200',
													isGuestExpanded &&
														'rotate-90'
												)}
											>
												▶
											</span>
											<label className="cursor-pointer text-sm font-bold opacity-70">
												顾客配置 (Guest Info)
											</label>
										</div>
										<button
											onClick={() => {
												if (selectedChar.guest) {
													updateCharacter(
														selectedIndex!,
														{ guest: undefined }
													);
												} else {
													updateGuest(
														selectedIndex!,
														{}
													);
												}
											}}
											className={cn(
												'rounded-lg border px-3 py-1 text-xs transition-all active:scale-95',
												selectedChar.guest
													? 'border-danger/20 bg-danger/10 text-danger hover:bg-danger/20'
													: 'border-white/10 bg-white/10 hover:bg-white/20'
											)}
										>
											{selectedChar.guest
												? '移除顾客配置'
												: '启用顾客配置'}
										</button>
									</div>

									{isGuestExpanded && selectedChar.guest && (
										<div className="animate-in fade-in slide-in-from-top-2 flex flex-col gap-6 rounded-2xl border border-white/5 bg-black/5 p-6 duration-200">
											{selectedChar.guest.likeFoodTag.some(
												(lt) =>
													selectedChar.guest?.hateFoodTag.includes(
														lt.tagId
													)
											) && (
												<div className="flex animate-pulse items-center gap-3 rounded-xl border border-danger/50 bg-danger/20 p-3 text-xs font-bold text-danger">
													<span className="text-lg">
														⚠️
													</span>
													检测到标签冲突：某些食物标签同时存在于“喜爱”和“厌恶”列表中。
												</div>
											)}
											<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
												<div className="flex flex-col gap-2">
													<label className="ml-1 text-sm font-bold opacity-70">
														携带金钱下限 (Lower)
													</label>
													<input
														type="number"
														value={
															selectedChar.guest
																.fundRangeLower
														}
														onChange={(e) =>
															updateGuest(
																selectedIndex!,
																{
																	fundRangeLower:
																		parseInt(
																			e
																				.target
																				.value
																		) || 0,
																}
															)
														}
														className="rounded-xl border border-white/10 bg-black/20 p-3 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
													/>
												</div>
												<div className="flex flex-col gap-2">
													<label className="ml-1 text-sm font-bold opacity-70">
														携带金钱上限 (Upper)
													</label>
													<input
														type="number"
														value={
															selectedChar.guest
																.fundRangeUpper
														}
														onChange={(e) =>
															updateGuest(
																selectedIndex!,
																{
																	fundRangeUpper:
																		parseInt(
																			e
																				.target
																				.value
																		) || 0,
																}
															)
														}
														className="rounded-xl border border-white/10 bg-black/20 p-3 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
													/>
												</div>
											</div>

											<div className="flex flex-col gap-4">
												<label className="ml-1 text-sm font-bold opacity-70">
													评价文本 (Evaluations)
												</label>
												<div className="grid grid-cols-1 gap-3">
													{[
														'黑评',
														'紫评',
														'绿评',
														'橙评',
														'粉评',
														'大额爆预算',
														'小额爆预算',
														'被驱赶',
														'评价驱赶',
													].map((label, i) => (
														<div
															key={i}
															className="flex flex-col gap-1"
														>
															<label className="ml-1 text-[10px] font-bold opacity-50">
																{label}
															</label>
															<input
																type="text"
																value={
																	selectedChar
																		.guest
																		?.evaluation[
																		i
																	] || ''
																}
																onChange={(e) =>
																	updateEvaluation(
																		selectedIndex!,
																		i,
																		e.target
																			.value
																	)
																}
																placeholder={`请输入${label}文本...`}
																className="rounded-lg border border-white/10 bg-black/20 p-2 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-primary/50"
															/>
														</div>
													))}
												</div>
											</div>

											<div className="flex flex-col gap-6">
												<div className="flex flex-col gap-3">
													<div className="ml-1 flex items-center justify-between">
														<label className="text-sm font-bold opacity-70">
															喜爱食物标签 (Like
															Food Tags)
														</label>
													</div>
													<div className="flex flex-wrap gap-2 rounded-xl border border-white/10 bg-black/20 p-4">
														{FOOD_TAGS.map(
															(tag) => {
																const isSelected =
																	selectedChar.guest?.likeFoodTag.some(
																		(t) =>
																			t.tagId ===
																			tag.id
																	);
																const isConflict =
																	isSelected &&
																	selectedChar.guest?.hateFoodTag.includes(
																		tag.id
																	);
																return (
																	<button
																		key={
																			tag.id
																		}
																		onClick={() =>
																			toggleLikeTag(
																				selectedIndex!,
																				'likeFoodTag',
																				tag.id
																			)
																		}
																		className={cn(
																			'relative flex items-center border px-1.5 py-0.5 text-[11px] font-bold transition-all',
																			isSelected
																				? isConflict
																					? 'border-danger bg-danger/40 text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]'
																					: 'border-[#9d5437] bg-[#e6b4a6] text-[#830000]'
																				: 'border-white/20 bg-white/10 text-black hover:bg-white/20'
																		)}
																		title={
																			isConflict
																				? '冲突：该标签同时存在于喜爱和厌恶列表中'
																				: ''
																		}
																	>
																		<span
																			className={cn(
																				'mr-1 transition-opacity',
																				isSelected
																					? 'opacity-100'
																					: 'opacity-40'
																			)}
																		>
																			⦁
																		</span>
																		{
																			tag.name
																		}
																		{isConflict && (
																			<span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full border border-white/20 bg-danger text-[10px] text-white shadow-lg">
																				!
																			</span>
																		)}
																	</button>
																);
															}
														)}
													</div>
												</div>

												<div className="flex flex-col gap-3">
													<label className="ml-1 text-sm font-bold text-danger opacity-70">
														厌恶食物标签 (Hate Food
														Tags)
													</label>
													<div className="flex flex-wrap gap-2 rounded-xl border border-white/10 bg-black/20 p-4">
														{FOOD_TAGS.map(
															(tag) => {
																const isSelected =
																	selectedChar.guest?.hateFoodTag.includes(
																		tag.id
																	);
																const isConflict =
																	isSelected &&
																	selectedChar.guest?.likeFoodTag.some(
																		(t) =>
																			t.tagId ===
																			tag.id
																	);
																return (
																	<button
																		key={
																			tag.id
																		}
																		onClick={() =>
																			toggleHateTag(
																				selectedIndex!,
																				tag.id
																			)
																		}
																		className={cn(
																			'relative flex items-center border px-1.5 py-0.5 text-[11px] font-bold transition-all',
																			isSelected
																				? isConflict
																					? 'border-danger bg-danger/40 text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]'
																					: 'border-danger bg-danger/10 text-danger'
																				: 'border-white/20 bg-white/10 text-black hover:bg-white/20'
																		)}
																		title={
																			isConflict
																				? '冲突：该标签同时存在于喜爱和厌恶列表中'
																				: ''
																		}
																	>
																		{
																			tag.name
																		}
																		<span
																			className={cn(
																				'ml-1 transition-opacity',
																				isSelected
																					? 'opacity-100'
																					: 'opacity-40'
																			)}
																		>
																			✘
																		</span>
																		{isConflict && (
																			<span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full border border-white/20 bg-danger text-[10px] text-white shadow-lg">
																				!
																			</span>
																		)}
																	</button>
																);
															}
														)}
													</div>
												</div>

												<div className="flex flex-col gap-3">
													<label className="ml-1 text-sm font-bold text-primary opacity-70">
														喜爱酒水标签 (Like
														Beverage Tags)
													</label>
													<div className="flex flex-wrap gap-2 rounded-xl border border-white/10 bg-black/20 p-4">
														{BEVERAGE_TAGS.map(
															(tag) => {
																const isSelected =
																	selectedChar.guest?.likeBevTag.some(
																		(t) =>
																			t.tagId ===
																			tag.id
																	);
																return (
																	<button
																		key={
																			tag.id
																		}
																		onClick={() =>
																			toggleLikeTag(
																				selectedIndex!,
																				'likeBevTag',
																				tag.id
																			)
																		}
																		className={cn(
																			'relative flex items-center border px-1.5 py-0.5 text-[11px] font-bold transition-all',
																			isSelected
																				? 'border-[#6f929b] bg-[#b0cfd7] text-[#a45c22]'
																				: 'border-white/20 bg-white/10 text-black hover:bg-white/20'
																		)}
																	>
																		<span
																			className={cn(
																				'mr-1 transition-opacity',
																				isSelected
																					? 'opacity-100'
																					: 'opacity-40'
																			)}
																		>
																			⦁
																		</span>
																		{
																			tag.name
																		}
																	</button>
																);
															}
														)}
													</div>
												</div>
											</div>

											<div className="flex flex-col gap-4">
												<div className="ml-1 flex items-center justify-between">
													<label className="text-sm font-bold opacity-70">
														特殊食物请求 (Food
														Requests)
													</label>
													<span className="text-[10px] italic opacity-40">
														根据上方喜爱食物自动同步
													</span>
												</div>
												<div className="grid grid-cols-1 gap-3">
													{selectedChar.guest?.foodRequests
														.filter((req) =>
															selectedChar.guest?.likeFoodTag.some(
																(t) =>
																	t.tagId ===
																	req.tagId
															)
														)
														.sort(
															(a, b) =>
																a.tagId -
																b.tagId
														)
														.map((req) => (
															<div
																key={req.tagId}
																className={cn(
																	'flex items-center gap-3 rounded-xl border p-3 transition-all',
																	req.enabled !==
																		false
																		? 'border-white/5 bg-black/10'
																		: 'border-transparent bg-black/5 opacity-50'
																)}
															>
																<div className="flex w-32 flex-shrink-0 items-center gap-3">
																	<input
																		type="checkbox"
																		checked={
																			req.enabled !==
																			false
																		}
																		onChange={(
																			e
																		) => {
																			const realIndex =
																				selectedChar.guest!.foodRequests.findIndex(
																					(
																						r
																					) =>
																						r.tagId ===
																						req.tagId
																				);
																			updateFoodRequest(
																				selectedIndex!,
																				realIndex,
																				{
																					enabled:
																						e
																							.target
																							.checked,
																				}
																			);
																		}}
																		className="h-4 w-4 rounded border-white/10 bg-black/20 text-primary focus:ring-primary/50"
																	/>
																	<div
																		className={cn(
																			'border px-1.5 py-0.5 text-[11px] font-medium transition-colors',
																			req.enabled !==
																				false
																				? 'border-[#9d5437] bg-[#e6b4a6] text-[#830000]'
																				: 'border-white/10 bg-white/5 text-white/40'
																		)}
																	>
																		<span className="mr-1">
																			⦁
																		</span>
																		{FOOD_TAG_MAP[
																			req
																				.tagId
																		] ||
																			req.tagId}
																	</div>
																</div>
																<div className="flex flex-1 flex-col gap-1">
																	<input
																		type="text"
																		value={
																			req.request
																		}
																		disabled={
																			req.enabled ===
																			false
																		}
																		onChange={(
																			e
																		) => {
																			const realIndex =
																				selectedChar.guest!.foodRequests.findIndex(
																					(
																						r
																					) =>
																						r.tagId ===
																						req.tagId
																				);
																			updateFoodRequest(
																				selectedIndex!,
																				realIndex,
																				{
																					request:
																						e
																							.target
																							.value,
																				}
																			);
																		}}
																		className="rounded-lg border border-white/10 bg-black/20 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 disabled:opacity-30"
																		placeholder={
																			req.enabled ===
																			false
																				? '已禁用'
																				: `请输入对“${FOOD_TAG_MAP[req.tagId]}”的请求文本...`
																		}
																	/>
																</div>
															</div>
														))}
													{(!selectedChar.guest
														?.foodRequests ||
														selectedChar.guest.foodRequests.filter(
															(req) =>
																selectedChar.guest?.likeFoodTag.some(
																	(t) =>
																		t.tagId ===
																		req.tagId
																)
														).length === 0) && (
														<div className="rounded-xl border-2 border-dashed border-white/5 py-4 text-center text-sm opacity-30">
															请先在上方选择喜爱食物标签
														</div>
													)}
												</div>
											</div>
										</div>
									)}
									{isGuestExpanded && !selectedChar.guest && (
										<div className="rounded-xl border-2 border-dashed border-white/5 py-8 text-center text-sm opacity-30">
											该角色尚未启用顾客配置
										</div>
									)}
								</div>

								<div className="flex flex-col gap-4">
									<div className="ml-1 flex items-center justify-between">
										<div
											className="flex cursor-pointer select-none items-center gap-2"
											onClick={() =>
												setIsSpriteExpanded(
													!isSpriteExpanded
												)
											}
										>
											<span
												className={cn(
													'transition-transform duration-200',
													isSpriteExpanded &&
														'rotate-90'
												)}
											>
												▶
											</span>
											<label className="cursor-pointer text-sm font-bold opacity-70">
												角色小人配置 (Sprite Set)
											</label>
										</div>
										<button
											onClick={() => {
												if (
													selectedChar.characterSpriteSetCompact
												) {
													updateCharacter(
														selectedIndex!,
														{
															characterSpriteSetCompact:
																undefined,
														}
													);
												} else {
													// 启用时自动刷新默认填充
													const label =
														selectedChar.label ||
														'Unknown';
													const mainSprite = [];
													for (
														let row = 0;
														row < 4;
														row++
													) {
														for (
															let col = 0;
															col < 3;
															col++
														) {
															mainSprite.push(
																`assets/${label}/${label}_Main_${row}, ${col}.png`
															);
														}
													}
													const eyeSprite = [];
													for (
														let row = 0;
														row < 6;
														row++
													) {
														for (
															let col = 0;
															col < 4;
															col++
														) {
															eyeSprite.push(
																`assets/${label}/${label}_Eyes_${row}, ${col}.png`
															);
														}
													}
													updateSpriteSet(
														selectedIndex!,
														{
															name: label,
															mainSprite,
															eyeSprite,
														}
													);
												}
											}}
											className={cn(
												'rounded-lg border px-3 py-1 text-xs transition-all active:scale-95',
												selectedChar.characterSpriteSetCompact
													? 'border-danger/20 bg-danger/10 text-danger hover:bg-danger/20'
													: 'border-white/10 bg-white/10 hover:bg-white/20'
											)}
										>
											{selectedChar.characterSpriteSetCompact
												? '移除小人配置'
												: '启用小人配置'}
										</button>
									</div>

									{isSpriteExpanded &&
										selectedChar.characterSpriteSetCompact && (
											<div className="animate-in fade-in slide-in-from-top-2 flex flex-col gap-6 rounded-2xl border border-white/5 bg-black/5 p-6 duration-200">
												<div className="flex flex-col gap-2">
													<div className="ml-1 flex items-center justify-between">
														<label className="text-sm font-bold opacity-70">
															小人名称 (Name)
														</label>
														<button
															onClick={() =>
																generateDefaultSprites(
																	selectedIndex!
																)
															}
															className="rounded border border-white/10 bg-white/10 px-2 py-0.5 text-[10px] transition-all hover:bg-white/20 active:scale-95"
														>
															刷新默认填充
														</button>
													</div>
													<input
														type="text"
														value={
															selectedChar
																.characterSpriteSetCompact
																.name
														}
														onChange={(e) =>
															updateSpriteSet(
																selectedIndex!,
																{
																	name: e
																		.target
																		.value,
																}
															)
														}
														placeholder="默认为角色 Label"
														className="rounded-xl border border-white/10 bg-black/20 p-3 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
													/>
												</div>

												<div className="flex flex-col gap-4">
													<label className="ml-1 text-sm font-bold opacity-70">
														主身体贴图 (Main Sprites
														- 12张)
													</label>
													<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
														{selectedChar.characterSpriteSetCompact.mainSprite.map(
															(path, i) => (
																<div
																	key={i}
																	className="flex items-center gap-2 rounded-lg border border-white/5 bg-black/10 p-2"
																>
																	<span className="w-4 text-center text-[10px] opacity-40">
																		{i}
																	</span>
																	<input
																		type="text"
																		value={
																			path
																		}
																		onChange={(
																			e
																		) =>
																			updateSpriteArray(
																				selectedIndex!,
																				'mainSprite',
																				i,
																				e
																					.target
																					.value
																			)
																		}
																		placeholder={`assets/${selectedChar.label}/${selectedChar.label}_Main_...`}
																		className="w-full border-none bg-transparent p-0 text-xs focus:ring-0"
																	/>
																</div>
															)
														)}
													</div>
												</div>

												<div className="flex flex-col gap-4">
													<label className="ml-1 text-sm font-bold opacity-70">
														眼睛贴图 (Eye Sprites -
														24张)
													</label>
													<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
														{selectedChar.characterSpriteSetCompact.eyeSprite.map(
															(path, i) => (
																<div
																	key={i}
																	className="flex items-center gap-2 rounded-lg border border-white/5 bg-black/10 p-2"
																>
																	<span className="w-4 text-center text-[10px] opacity-40">
																		{i}
																	</span>
																	<input
																		type="text"
																		value={
																			path
																		}
																		onChange={(
																			e
																		) =>
																			updateSpriteArray(
																				selectedIndex!,
																				'eyeSprite',
																				i,
																				e
																					.target
																					.value
																			)
																		}
																		placeholder={`assets/${selectedChar.label}/${selectedChar.label}_Eyes_...`}
																		className="w-full border-none bg-transparent p-0 text-xs focus:ring-0"
																	/>
																</div>
															)
														)}
													</div>
												</div>
											</div>
										)}
									{isSpriteExpanded &&
										!selectedChar.characterSpriteSetCompact && (
											<div className="rounded-xl border-2 border-dashed border-white/5 py-8 text-center text-sm opacity-30">
												该角色尚未启用小人配置
											</div>
										)}
								</div>
							</div>
						) : (
							<div className="flex h-full items-center justify-center italic opacity-40">
								请从左侧选择一个角色进行编辑，或点击 +
								号添加新角色
							</div>
						)}
					</div>
				</div>
			</div>
		</main>
	);
}
