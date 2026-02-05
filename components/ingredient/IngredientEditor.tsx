import { memo, useCallback, useId } from 'react';

import { useData } from '@/components/context/DataContext';
import { ErrorBadge } from '@/components/common/ErrorBadge';
import { SpriteUploader } from '@/components/common/SpriteUploader';
import { Label } from '@/components/common/Label';
import { FOOD_TAGS } from '@/data/tags';

import { cn } from '@/lib';
import type { Ingredient } from '@/types/resource';

interface IngredientEditorProps {
	ingredient: Ingredient | null;
	ingredientIndex: number | null;
	onUpdate: (updates: Partial<Ingredient>) => void;
}

export const IngredientEditor = memo<IngredientEditorProps>(
	function IngredientEditor({ ingredient, onUpdate }) {
		const idId = useId();
		const idName = useId();
		const idDescription = useId();
		const idLevel = useId();
		const idPrefix = useId();
		const idBaseValue = useId();

		const isIdTooSmall = ingredient && ingredient.id < 9000;

		const { getAssetUrl, updateAsset } = useData();

		const handleSpriteUpdate = useCallback(
			(blob: Blob) => {
				if (!ingredient) return;
				updateAsset(ingredient.spritePath, blob);
			},
			[ingredient, updateAsset]
		);

		const toggleTag = useCallback(
			(tagId: number) => {
				if (!ingredient) return;

				const currentTags = ingredient.tags || [];
				const exists = currentTags.includes(tagId);

				let newTags;
				if (exists) {
					newTags = currentTags.filter((id) => id !== tagId);
				} else {
					newTags = [...currentTags, tagId];
				}

				onUpdate({ tags: newTags });
			},
			[ingredient, onUpdate]
		);

		if (!ingredient) {
			return (
				<div className="col-span-2 flex h-96 items-center justify-center rounded-lg bg-white/10 p-4 shadow-md backdrop-blur">
					<p className="text-center text-black/40 dark:text-white/40">
						请从左侧选择一个原料进行编辑
					</p>
				</div>
			);
		}

		const spriteUrl = getAssetUrl(ingredient.spritePath);

		return (
			<div className="col-span-2 flex flex-col gap-6 overflow-y-auto rounded-lg bg-white/10 p-6 shadow-md backdrop-blur">
				<div className="flex items-center justify-between border-b border-black/5 pb-4 dark:border-white/5">
					<h2 className="text-2xl font-bold">原料编辑</h2>
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
								{isIdTooSmall && (
									<ErrorBadge>ID需&ge;9000</ErrorBadge>
								)}
							</div>
							<input
								id={idId}
								type="number"
								value={
									isNaN(ingredient.id) ? '' : ingredient.id
								}
								onChange={(e) => {
									const val = parseInt(e.target.value);
									if (isNaN(val)) {
										onUpdate({ id: val });
									} else {
										onUpdate({
											id: val,
											spritePath: `assets/Ingredient/${val}.png`,
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
								value={ingredient.name}
								onChange={(e) =>
									onUpdate({ name: e.target.value })
								}
								className="h-9 w-full rounded-lg border border-black/10 bg-white/40 px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-black/30 focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-black/10 dark:focus:border-white/10 dark:focus:ring-white/10"
							/>
						</div>

						<div className="col-span-full flex flex-col gap-1">
							<Label htmlFor={idDescription}>
								描述 (Description)
							</Label>
							<textarea
								id={idDescription}
								value={ingredient.description}
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
					<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
						<div className="flex flex-col gap-1">
							<Label htmlFor={idLevel}>等级 (Level)</Label>
							<input
								id={idLevel}
								type="number"
								value={
									isNaN(ingredient.level)
										? ''
										: ingredient.level
								}
								onChange={(e) =>
									onUpdate({
										level: parseInt(e.target.value),
									})
								}
								className="h-9 w-full rounded-lg border border-black/10 bg-white/40 px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-black/30 focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-black/10 dark:focus:border-white/10 dark:focus:ring-white/10"
							/>
						</div>

						<div className="flex flex-col gap-1">
							<Label htmlFor={idPrefix}>前缀 (Prefix)</Label>
							<input
								id={idPrefix}
								type="number"
								value={
									isNaN(ingredient.prefix)
										? ''
										: ingredient.prefix
								}
								onChange={(e) =>
									onUpdate({
										prefix: parseInt(e.target.value),
									})
								}
								className="h-9 w-full rounded-lg border border-black/10 bg-white/40 px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-black/30 focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-black/10 dark:focus:border-white/10 dark:focus:ring-white/10"
							/>
						</div>

						<div className="flex flex-col gap-1">
							<Label htmlFor={idBaseValue}>
								价值 (BaseValue)
							</Label>
							<input
								id={idBaseValue}
								type="number"
								value={
									isNaN(ingredient.baseValue)
										? ''
										: ingredient.baseValue
								}
								onChange={(e) =>
									onUpdate({
										baseValue: parseInt(e.target.value),
									})
								}
								className="h-9 w-full rounded-lg border border-black/10 bg-white/40 px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-black/30 focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-black/10 dark:focus:border-white/10 dark:focus:ring-white/10"
							/>
						</div>
					</div>

					{/* 类型复选框 */}
					<div className="flex flex-wrap gap-4">
						<label className="flex items-center gap-2">
							<input
								type="checkbox"
								checked={ingredient.isFish}
								onChange={(e) =>
									onUpdate({ isFish: e.target.checked })
								}
								className="h-4 w-4 rounded border-black/20 text-primary focus:ring-2 focus:ring-primary dark:border-white/20"
							/>
							<span className="text-sm">鱼类</span>
						</label>
						<label className="flex items-center gap-2">
							<input
								type="checkbox"
								checked={ingredient.isMeat}
								onChange={(e) =>
									onUpdate({ isMeat: e.target.checked })
								}
								className="h-4 w-4 rounded border-black/20 text-primary focus:ring-2 focus:ring-primary dark:border-white/20"
							/>
							<span className="text-sm">肉类</span>
						</label>
						<label className="flex items-center gap-2">
							<input
								type="checkbox"
								checked={ingredient.isVeg}
								onChange={(e) =>
									onUpdate({ isVeg: e.target.checked })
								}
								className="h-4 w-4 rounded border-black/20 text-primary focus:ring-2 focus:ring-primary dark:border-white/20"
							/>
							<span className="text-sm">蔬菜</span>
						</label>
					</div>
				</div>

				{/* 标签 */}
				<div className="flex flex-col gap-4 rounded-lg bg-white/20 p-4 dark:bg-white/5">
					<h3 className="text-sm font-bold uppercase tracking-wider opacity-60">
						标签 (Food Tags)
					</h3>
					<div className="flex flex-wrap gap-2 rounded-xl border border-black/10 bg-white/40 p-4 dark:border-white/10 dark:bg-black/10">
						{FOOD_TAGS.map((tag) => {
							const isSelected = ingredient.tags.includes(tag.id);
							return (
								<button
									key={tag.id}
									onClick={() => toggleTag(tag.id)}
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

				{/* 贴图 */}
				<div className="flex flex-col gap-4 rounded-lg bg-white/20 p-4 dark:bg-white/5">
					<h3 className="text-sm font-bold uppercase tracking-wider opacity-60">
						贴图 (预期 26×26)
					</h3>
					<SpriteUploader
						spriteUrl={spriteUrl ?? null}
						spritePath={ingredient.spritePath}
						onUpload={handleSpriteUpdate}
					/>
				</div>
			</div>
		);
	}
);
