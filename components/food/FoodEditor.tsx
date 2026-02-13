import { memo, useCallback, useId } from 'react';

import { useData } from '@/components/context/DataContext';
import { ErrorBadge } from '@/components/common/ErrorBadge';
import { IdRangeBadge } from '@/components/common/IdRangeBadge';
import { SpriteUploader } from '@/components/common/SpriteUploader';
import { FOOD_TAGS } from '@/data/tags';
import { Label } from '@/components/common/Label';

import { cn } from '@/lib';
import type { Food } from '@/types/resource';

interface FoodEditorProps {
	food: Food | null;
	foodIndex: number | null;
	onUpdate: (updates: Partial<Food>) => void;
}

export const FoodEditor = memo<FoodEditorProps>(function FoodEditor({
	food,
	onUpdate,
}) {
	const idId = useId();
	const idName = useId();
	const idDescription = useId();
	const idLevel = useId();
	const idBaseValue = useId();

	const isIdTooSmall = food && food.id < 9000;

	const { getAssetUrl, updateAsset } = useData();

	const handleSpriteUpdate = useCallback(
		(blob: Blob) => {
			if (!food) return;
			updateAsset(food.spritePath, blob);
		},
		[food, updateAsset]
	);

	const toggleTag = useCallback(
		(tagId: number, field: 'tags' | 'banTags') => {
			if (!food) return;

			const currentTags = food[field] || [];
			const exists = currentTags.includes(tagId);

			let newTags;
			if (exists) {
				newTags = currentTags.filter((id) => id !== tagId);
			} else {
				newTags = [...currentTags, tagId];
			}

			newTags.sort((a, b) => a - b);

			onUpdate({ [field]: newTags });
		},
		[food, onUpdate]
	);

	if (!food) {
		return (
			<div className="col-span-2 flex h-96 items-center justify-center rounded-lg bg-white/10 p-4 shadow-md backdrop-blur">
				<p className="text-center text-black/40 dark:text-white/40">
					请从左侧选择一个料理进行编辑
				</p>
			</div>
		);
	}

	const spriteUrl = getAssetUrl(food.spritePath);

	return (
		<div className="col-span-2 flex flex-col gap-6 overflow-y-auto rounded-lg bg-white/10 p-6 shadow-md backdrop-blur">
			<div className="flex items-center justify-between border-b border-black/5 pb-4 dark:border-white/5">
				<h2 className="text-2xl font-bold">料理编辑</h2>
			</div>

			{/* 基本信息 */}
			<div className="flex flex-col gap-4 rounded-lg bg-white/20 p-4 dark:bg-white/5">
				<h3 className="text-sm font-bold uppercase tracking-wider opacity-60">
					基本信息
				</h3>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div className="flex flex-col gap-1">
						<div className="flex items-center justify-between">
							<Label htmlFor={idId}>ID</Label>
							<div className="flex gap-2">
								{isIdTooSmall && (
									<ErrorBadge>ID需&ge;9000</ErrorBadge>
								)}
								<IdRangeBadge id={food.id} />
							</div>
						</div>
						<input
							id={idId}
							type="number"
							value={isNaN(food.id) ? '' : food.id}
							onChange={(e) => {
								const val = parseInt(e.target.value);
								if (isNaN(val)) {
									onUpdate({ id: val });
								} else {
									onUpdate({
										id: val,
										spritePath: `assets/Food/${val}.png`,
									});
								}
							}}
							className={cn(
								'h-9 w-full rounded-lg border bg-white/40 px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-black/30 focus:ring-2 focus:ring-black/10 dark:bg-black/10 dark:focus:border-white/30 dark:focus:ring-white/10',
								isIdTooSmall
									? 'border-danger bg-danger text-white opacity-50 focus:border-danger'
									: 'border-black/10 dark:border-white/10'
							)}
						/>
					</div>

					<div className="flex flex-col gap-1">
						<Label htmlFor={idName}>名称 (Name)</Label>
						<input
							id={idName}
							type="text"
							value={food.name}
							onChange={(e) => onUpdate({ name: e.target.value })}
							className="h-9 w-full rounded-lg border border-black/10 bg-white/40 px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-black/30 focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-black/10 dark:focus:border-white/10 dark:focus:ring-white/10"
						/>
					</div>

					<div className="col-span-full flex flex-col gap-1">
						<Label htmlFor={idDescription}>
							描述 (Description)
						</Label>
						<textarea
							id={idDescription}
							value={food.description}
							onChange={(e) =>
								onUpdate({ description: e.target.value })
							}
							rows={3}
							className="w-full rounded-lg border border-black/10 bg-white/40 px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-black/30 focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-black/10 dark:focus:border-white/10 dark:focus:ring-white/10"
						/>
					</div>
				</div>
			</div>

			{/* 属性 */}
			<div className="flex flex-col gap-4 rounded-lg bg-white/20 p-4 dark:bg-white/5">
				<h3 className="text-sm font-bold uppercase tracking-wider opacity-60">
					属性
				</h3>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div className="flex flex-col gap-1">
						<Label htmlFor={idLevel}>等级 (Level)</Label>
						<input
							id={idLevel}
							type="number"
							value={isNaN(food.level) ? '' : food.level}
							onChange={(e) =>
								onUpdate({ level: parseInt(e.target.value) })
							}
							className="h-9 w-full rounded-lg border border-black/10 bg-white/40 px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-black/30 focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-black/10 dark:focus:border-white/10 dark:focus:ring-white/10"
						/>
					</div>

					<div className="flex flex-col gap-1">
						<Label htmlFor={idBaseValue}>价格 (BaseValue)</Label>
						<input
							id={idBaseValue}
							type="number"
							value={isNaN(food.baseValue) ? '' : food.baseValue}
							onChange={(e) =>
								onUpdate({
									baseValue: parseInt(e.target.value),
								})
							}
							className="h-9 w-full rounded-lg border border-black/10 bg-white/40 px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-black/30 focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-black/10 dark:focus:border-white/10 dark:focus:ring-white/10"
						/>
					</div>
				</div>
			</div>

			{/* 标签 */}
			<div className="flex flex-col gap-4 rounded-lg bg-white/20 p-4 dark:bg-white/5">
				<h3 className="text-sm font-bold uppercase tracking-wider opacity-60">
					标签 (Food Tags)
				</h3>
				<div className="flex flex-wrap gap-2 rounded-xl border border-black/10 bg-white/40 p-4 dark:border-white/10 dark:bg-black/10">
					{FOOD_TAGS.map((tag) => {
						const isSelected = food.tags.includes(tag.id);
						return (
							<button
								key={tag.id}
								onClick={() => toggleTag(tag.id, 'tags')}
								className={cn(
									'flex items-center border px-2 py-1 text-xs font-bold transition-all',
									isSelected
										? 'border-[#9d5437] bg-[#e6b4a6] text-[#830000] shadow-sm'
										: 'border-black/20 bg-black/5 hover:bg-black/10 dark:border-white/20 dark:bg-white/5 dark:hover:bg-white/10'
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
								{tag.name}
							</button>
						);
					})}
				</div>
			</div>

			{/* 禁止使用的标签 */}
			<div className="flex flex-col gap-4 rounded-lg bg-white/20 p-4 dark:bg-white/5">
				<h3 className="text-sm font-bold uppercase tracking-wider opacity-60">
					禁止使用的标签 (Ban Tags)
				</h3>
				<div className="flex flex-wrap gap-2 rounded-xl border border-black/10 bg-white/40 p-4 dark:border-white/10 dark:bg-black/10">
					{FOOD_TAGS.map((tag) => {
						const isSelected = food.banTags?.includes(tag.id);
						return (
							<button
								key={tag.id}
								onClick={() => toggleTag(tag.id, 'banTags')}
								className={cn(
									'flex items-center border px-2 py-1 text-xs font-bold transition-all',
									isSelected
										? 'border-danger bg-danger/20 text-danger shadow-sm'
										: 'border-black/20 bg-black/5 hover:bg-black/10 dark:border-white/20 dark:bg-white/5 dark:hover:bg-white/10'
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
									✕
								</span>
								{tag.name}
							</button>
						);
					})}
				</div>
			</div>

			{/* 贴图 */}
			<div className="flex flex-col gap-4 rounded-lg bg-white/20 p-4 dark:bg-white/5">
				<h3 className="text-sm font-bold uppercase tracking-wider opacity-60">
					贴图 (预期 26×26)
				</h3>
				<SpriteUploader
					spriteUrl={spriteUrl ?? null}
					spritePath={food.spritePath}
					onUpload={handleSpriteUpdate}
				/>
			</div>
		</div>
	);
});
