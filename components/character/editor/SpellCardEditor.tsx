import { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib';
import { ChevronRight } from '@/components/icons/ChevronRight';
import { Label } from '@/components/common/Label';
import { PortraitUploader } from '@/components/common/PortraitUploader';
import { useData } from '@/components/context/DataContext';
import type { SpellCard, Character } from '@/types/resource';
import { SPECIAL_GUESTS } from '@/data/specialGuest';

interface SpellCardEditorProps {
	character: Character;
	spellCard: SpellCard | undefined;
	onUpdate: (updates: Partial<Character>) => void;
	onEnable: () => void;
	onDisable: () => void;
	allCharacters: Character[];
}

export function SpellCardEditor({
	character,
	spellCard,
	onUpdate,
	onEnable,
	onDisable,
	allCharacters,
}: SpellCardEditorProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const { updateAsset } = useData();

	const updateSpellCard = useCallback(
		(updates: Partial<SpellCard>) => {
			const newSpellCard = { ...spellCard, ...updates } as SpellCard;
			onUpdate({ spellCard: newSpellCard });
		},
		[spellCard, onUpdate]
	);

	const updateSpell = useCallback(
		(spellType: 'positiveSpell' | 'negativeSpell', updates: any) => {
			if (!spellCard) return;
			const newSpell = { ...spellCard[spellType], ...updates };
			updateSpellCard({ [spellType]: newSpell });
		},
		[spellCard, updateSpellCard]
	);

	const updateBuff = useCallback(
		(buffType: 'positiveBuff' | 'negativeBuff', updates: any) => {
			if (!spellCard) return;
			const currentBuff = spellCard[buffType];
			if (!currentBuff) return;
			const newBuff = { ...currentBuff, ...updates };
			updateSpellCard({ [buffType]: newBuff });
		},
		[spellCard, updateSpellCard]
	);

	const toggleBuff = useCallback(
		(buffType: 'positiveBuff' | 'negativeBuff', enabled: boolean) => {
			if (!spellCard) return;
			if (enabled) {
				const fallback =
					buffType === 'positiveBuff'
						? 'PhilosopherStone'
						: 'Skill_Youmu_Punishment';
				const buffTypePrefix =
					buffType === 'positiveBuff' ? 'Positive' : 'Negative';
				updateSpellCard({
					[buffType]: {
						type: `${spellCard.spellCardType}_${buffTypePrefix}`,
						name: spellCard[
							buffType === 'positiveBuff'
								? 'positiveSpell'
								: 'negativeSpell'
						].name,
						description:
							spellCard[
								buffType === 'positiveBuff'
									? 'positiveSpell'
									: 'negativeSpell'
							].description,
						spritePath: '',
						spriteFallback: fallback,
					},
				});
			} else {
				updateSpellCard({ [buffType]: undefined });
			}
		},
		[spellCard, updateSpellCard]
	);

	const handlePositiveSpriteUpdate = useCallback(
		(file: File) => {
			if (!spellCard) return;
			updateAsset(spellCard.positiveSpell.spritePath, file);
		},
		[spellCard, updateAsset]
	);

	const handleNegativeSpriteUpdate = useCallback(
		(file: File) => {
			if (!spellCard) return;
			updateAsset(spellCard.negativeSpell.spritePath, file);
		},
		[spellCard, updateAsset]
	);

	// Get all special guest characters: game guests + custom guests
	const specialGuestCharacters = useMemo(() => {
		// 从 specialGuest.ts 获取所有游戏内稀客
		const gameGuests = SPECIAL_GUESTS.map((g) => ({
			id: g.id,
			name: g.name,
		}));

		// 从 allCharacters 获取自定义新稀客 (type: Special, id >= 9000)
		const customGuests = allCharacters
			.filter((char) => char.type === 'Special' && char.id >= 9000)
			.map((char) => ({ id: char.id, name: char.name }));

		// 合并并去重（如果有重复 id，自定义的覆盖游戏内的）
		const guestMap = new Map<number, { id: number; name: string }>();
		gameGuests.forEach((g) => guestMap.set(g.id, g));
		customGuests.forEach((g) => guestMap.set(g.id, g));

		return Array.from(guestMap.values()).sort((a, b) => a.id - b.id);
	}, [allCharacters]);

	// Check if spellCardType is Custom
	const isCustomType = spellCard?.spellCardType === 'Custom';

	return (
		<div className="flex flex-col gap-4">
			<div className="ml-1 flex items-center justify-between">
				<div
					className="flex cursor-pointer select-none items-center gap-2"
					onClick={() => setIsExpanded(!isExpanded)}
				>
					<ChevronRight
						className={cn(
							'transition-transform duration-200',
							isExpanded && 'rotate-90'
						)}
					/>
					<label className="cursor-pointer font-semibold">
						符卡配置 (Spell Card)
					</label>
				</div>
				<button
					onClick={() => {
						if (spellCard) {
							onDisable();
						} else {
							onEnable();
						}
					}}
					className={cn(
						'whitespace-nowrap rounded-full px-3 py-1 text-sm',
						spellCard
							? 'bg-danger/20 text-danger hover:bg-danger/30'
							: 'bg-primary/20 text-primary hover:bg-primary/30'
					)}
				>
					{spellCard ? '禁用' : '启用'}
				</button>
			</div>

			{spellCard && isExpanded && (
				<div className="ml-6 flex flex-col gap-4 rounded-lg bg-white/5 p-4">
					{/* Spell Card Type */}
					<div className="flex flex-col gap-1">
						<Label>符卡类型 (Spell Card Type)</Label>
						<input
							className="h-9 w-full rounded-lg border border-black/10 bg-white/40 px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-black/30 focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-black/10 dark:focus:border-white/30 dark:focus:ring-white/10"
							value={spellCard.spellCardType}
							onChange={(e) =>
								updateSpellCard({
									spellCardType: e.target.value,
								})
							}
							placeholder={`默认: Custom 或 ${character.label.replace(/^_/, '')}`}
						/>
						<p className="text-xs opacity-60">
							填写 "Custom" 以复用原有符卡，或填写角色
							label（去掉首下划线）并与实际代码匹配
						</p>
					</div>

					{/* Positive Spell (奖励符卡) */}
					<div className="flex flex-col gap-3 rounded-lg bg-white/10 p-4 dark:bg-white/5">
						<h4 className="text-sm font-semibold">
							奖励符卡 (Positive Spell)
						</h4>

						<div className="flex flex-col gap-1">
							<Label>符卡名称 (Name)</Label>
							<input
								className="h-9 w-full rounded-lg border border-black/10 bg-white/40 px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-black/30 focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-black/10 dark:focus:border-white/30 dark:focus:ring-white/10"
								value={spellCard.positiveSpell.name}
								onChange={(e) =>
									updateSpell('positiveSpell', {
										name: e.target.value,
									})
								}
								placeholder="例如: Sgr符「爆肝mod」"
							/>
						</div>

						<div className="flex flex-col gap-1">
							<Label>符卡描述 (Description)</Label>
							<textarea
								className="min-h-[80px] w-full rounded-lg border border-black/10 bg-white/40 px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-black/30 focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-black/10 dark:focus:border-white/30 dark:focus:ring-white/10"
								value={spellCard.positiveSpell.description}
								onChange={(e) =>
									updateSpell('positiveSpell', {
										description: e.target.value,
									})
								}
								placeholder="例如: Sgr太好了，会送你十四夜喝"
							/>
						</div>

						<div className="flex flex-col gap-1">
							<Label>覆盖符卡 ID (Override Spell)</Label>
							<select
								className="h-9 w-full rounded-lg border border-black/10 bg-white/40 px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-black/30 focus:ring-2 focus:ring-black/10 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-black/10 dark:focus:border-white/30 dark:focus:ring-white/10"
								value={spellCard.positiveSpell.overrideSpell}
								disabled={!isCustomType}
								onChange={(e) =>
									updateSpell('positiveSpell', {
										overrideSpell: parseInt(e.target.value),
									})
								}
							>
								<option value={-1}>不覆盖 (-1)</option>
								{specialGuestCharacters.map((char) => (
									<option key={char.id} value={char.id}>
										（{char.id}）{char.name}
									</option>
								))}
							</select>
							<p className="text-xs opacity-60">
								当且仅当 Spell Card Type 为 "Custom" 时有效
							</p>
						</div>

						{/* Positive Buff Toggle */}
						<div className="flex flex-col gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
							<label className="flex cursor-pointer items-center gap-2">
								<input
									type="checkbox"
									checked={!!spellCard.positiveBuff}
									onChange={(e) =>
										toggleBuff(
											'positiveBuff',
											e.target.checked
										)
									}
									className="h-4 w-4 accent-primary"
								/>
								<span className="text-sm font-semibold">
									启用奖励 Buff (Positive Buff)
								</span>
							</label>

							{spellCard.positiveBuff && (
								<div className="flex flex-col gap-3 rounded-lg bg-black/10 p-3">
									<div className="flex flex-col gap-1">
										<Label size="sm">
											Buff 类型 (Type)
										</Label>
										<input
											className="h-9 w-full rounded-lg border border-black/10 bg-white/40 px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-black/30 focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-black/10 dark:focus:border-white/30 dark:focus:ring-white/10"
											value={spellCard.positiveBuff.type}
											onChange={(e) =>
												updateBuff('positiveBuff', {
													type: e.target.value,
												})
											}
											placeholder="例如: Koakuma_Positive"
										/>
									</div>

									<div className="flex flex-col gap-1">
										<Label size="sm">
											Buff 名称 (Name)
										</Label>
										<input
											className="h-9 w-full rounded-lg border border-black/10 bg-white/40 px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-black/30 focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-black/10 dark:focus:border-white/30 dark:focus:ring-white/10"
											value={spellCard.positiveBuff.name}
											onChange={(e) =>
												updateBuff('positiveBuff', {
													name: e.target.value,
												})
											}
										/>
									</div>

									<div className="flex flex-col gap-1">
										<Label size="sm">
											Buff 描述 (Description)
										</Label>
										<textarea
											className="min-h-[60px] w-full rounded-lg border border-black/10 bg-white/40 px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-black/30 focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-black/10 dark:focus:border-white/30 dark:focus:ring-white/10"
											value={
												spellCard.positiveBuff
													.description
											}
											onChange={(e) =>
												updateBuff('positiveBuff', {
													description: e.target.value,
												})
											}
											placeholder="支持 $a 等变量占位符"
										/>
									</div>

									<div className="flex flex-col gap-1">
										<Label size="sm">
											Sprite Path (只读)
										</Label>
										<input
											className="text-foreground/50 h-9 w-full rounded-lg border border-black/10 bg-black/5 px-3 py-2 text-sm outline-none dark:bg-black/20"
											value={
												spellCard.positiveBuff
													.spritePath
											}
											readOnly
											disabled
										/>
									</div>

									<div className="flex flex-col gap-1">
										<Label size="sm">
											Sprite Fallback (固定为
											PhilosopherStone)
										</Label>
										<input
											className="text-foreground/50 h-9 w-full rounded-lg border border-black/10 bg-black/5 px-3 py-2 text-sm outline-none dark:bg-black/20"
											value={
												spellCard.positiveBuff
													.spriteFallback
											}
											readOnly
											disabled
										/>
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Negative Spell (惩罚符卡) */}
					<div className="flex flex-col gap-3 rounded-lg bg-white/10 p-4 dark:bg-white/5">
						<h4 className="text-sm font-semibold">
							惩罚符卡 (Negative Spell)
						</h4>

						<div className="flex flex-col gap-1">
							<Label>符卡名称 (Name)</Label>
							<input
								className="h-9 w-full rounded-lg border border-black/10 bg-white/40 px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-black/30 focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-black/10 dark:focus:border-white/30 dark:focus:ring-white/10"
								value={spellCard.negativeSpell.name}
								onChange={(e) =>
									updateSpell('negativeSpell', {
										name: e.target.value,
									})
								}
								placeholder="例如: mETA符「偷懒」"
							/>
						</div>

						<div className="flex flex-col gap-1">
							<Label>符卡描述 (Description)</Label>
							<textarea
								className="min-h-[80px] w-full rounded-lg border border-black/10 bg-white/40 px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-black/30 focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-black/10 dark:focus:border-white/30 dark:focus:ring-white/10"
								value={spellCard.negativeSpell.description}
								onChange={(e) =>
									updateSpell('negativeSpell', {
										description: e.target.value,
									})
								}
								placeholder="例如: mETAm1KU太坏了，偷偷的把你的酒水偷走！"
							/>
						</div>

						<div className="flex flex-col gap-1">
							<Label>覆盖符卡 ID (Override Spell)</Label>
							<select
								className="h-9 w-full rounded-lg border border-black/10 bg-white/40 px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-black/30 focus:ring-2 focus:ring-black/10 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-black/10 dark:focus:border-white/30 dark:focus:ring-white/10"
								value={spellCard.negativeSpell.overrideSpell}
								disabled={!isCustomType}
								onChange={(e) =>
									updateSpell('negativeSpell', {
										overrideSpell: parseInt(e.target.value),
									})
								}
							>
								<option value={-1}>不覆盖 (-1)</option>
								{specialGuestCharacters.map((char) => (
									<option key={char.id} value={char.id}>
										（{char.id}）{char.name}
									</option>
								))}
							</select>
							<p className="text-xs opacity-60">
								当且仅当 Spell Card Type 为 "Custom" 时有效
							</p>
						</div>

						{/* Negative Buff Toggle */}
						<div className="flex flex-col gap-2 rounded-lg border border-danger/20 bg-danger/5 p-3">
							<label className="flex cursor-pointer items-center gap-2">
								<input
									type="checkbox"
									checked={!!spellCard.negativeBuff}
									onChange={(e) =>
										toggleBuff(
											'negativeBuff',
											e.target.checked
										)
									}
									className="h-4 w-4 accent-danger"
								/>
								<span className="text-sm font-semibold">
									启用惩罚 Buff (Negative Buff)
								</span>
							</label>

							{spellCard.negativeBuff && (
								<div className="flex flex-col gap-3 rounded-lg bg-black/10 p-3">
									<div className="flex flex-col gap-1">
										<Label size="sm">
											Buff 类型 (Type)
										</Label>
										<input
											className="h-9 w-full rounded-lg border border-black/10 bg-white/40 px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-black/30 focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-black/10 dark:focus:border-white/30 dark:focus:ring-white/10"
											value={spellCard.negativeBuff.type}
											onChange={(e) =>
												updateBuff('negativeBuff', {
													type: e.target.value,
												})
											}
											placeholder="例如: Koakuma_Negative"
										/>
									</div>

									<div className="flex flex-col gap-1">
										<Label size="sm">
											Buff 名称 (Name)
										</Label>
										<input
											className="h-9 w-full rounded-lg border border-black/10 bg-white/40 px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-black/30 focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-black/10 dark:focus:border-white/30 dark:focus:ring-white/10"
											value={spellCard.negativeBuff.name}
											onChange={(e) =>
												updateBuff('negativeBuff', {
													name: e.target.value,
												})
											}
										/>
									</div>

									<div className="flex flex-col gap-1">
										<Label size="sm">
											Buff 描述 (Description)
										</Label>
										<textarea
											className="min-h-[60px] w-full rounded-lg border border-black/10 bg-white/40 px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-black/30 focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-black/10 dark:focus:border-white/30 dark:focus:ring-white/10"
											value={
												spellCard.negativeBuff
													.description
											}
											onChange={(e) =>
												updateBuff('negativeBuff', {
													description: e.target.value,
												})
											}
											placeholder="支持 $a 等变量占位符"
										/>
									</div>

									<div className="flex flex-col gap-1">
										<Label size="sm">
											Sprite Path (只读)
										</Label>
										<input
											className="text-foreground/50 h-9 w-full rounded-lg border border-black/10 bg-black/5 px-3 py-2 text-sm outline-none dark:bg-black/20"
											value={
												spellCard.negativeBuff
													.spritePath
											}
											readOnly
											disabled
										/>
									</div>

									<div className="flex flex-col gap-1">
										<Label size="sm">
											Sprite Fallback (固定为
											Skill_Youmu_Punishment)
										</Label>
										<input
											className="text-foreground/50 h-9 w-full rounded-lg border border-black/10 bg-black/5 px-3 py-2 text-sm outline-none dark:bg-black/20"
											value={
												spellCard.negativeBuff
													.spriteFallback
											}
											readOnly
											disabled
										/>
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Sprite Uploaders */}
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div className="flex flex-col gap-1">
							<Label>奖励符卡贴图</Label>
							<PortraitUploader
								spritePath={spellCard.positiveSpell.spritePath}
								onUpload={handlePositiveSpriteUpdate}
							/>
						</div>

						<div className="flex flex-col gap-1">
							<Label>惩罚符卡贴图</Label>
							<PortraitUploader
								spritePath={spellCard.negativeSpell.spritePath}
								onUpload={handleNegativeSpriteUpdate}
							/>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
