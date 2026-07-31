import { cn } from '@heroui/theme';
import { memo, useCallback, useId, useMemo } from 'react';

import { ErrorBadge } from '@/components/common/ErrorBadge';
import { IdRangeBadge } from '@/components/common/IdRangeBadge';
import { InfoTip } from '@/components/common/InfoTip';
import { Label } from '@/components/common/Label';
import { SpriteUploader } from '@/components/common/SpriteUploader';
import { TagsField } from '@/components/common/TagsField';

import {
	INGREDIENT_PREFIX_NONE_ID,
	INGREDIENT_PREFIXES,
} from '@/data/ingredientPrefixes';
import { FOOD_TAGS } from '@/data/tags';

import { Select } from '@/design/ui/components/select';

import type { Ingredient } from '@/domain/resourcePack/contracts/items';

import { useResourceEditor } from '@/features/resourceEditor/client/state/useResourceEditor';

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

		const { getAssetUrl, updateAsset } = useResourceEditor();

		const handleSpriteUpdate = useCallback(
			(blob: Blob) => {
				if (!ingredient) return;
				updateAsset(ingredient.spritePath, blob);
			},
			[ingredient, updateAsset]
		);

		const prefixItems = useMemo(
			() =>
				INGREDIENT_PREFIXES.map((p) => ({
					value: p.id,
					label: `[${p.id}] ${p.label}`,
				})),
			[]
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

		const prefixValue = INGREDIENT_PREFIXES.some(
			(p) => p.id === ingredient.prefix
		)
			? ingredient.prefix
			: INGREDIENT_PREFIX_NONE_ID;

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
								<div className="flex gap-2">
									{isIdTooSmall && (
										<ErrorBadge>ID需&ge;9000</ErrorBadge>
									)}
									<IdRangeBadge id={ingredient.id} />
								</div>
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
							<div className="flex items-center gap-1">
								<Label htmlFor={idPrefix}>前缀 (Prefix)</Label>
								<InfoTip>
									<div className="max-w-xs space-y-1 text-xs leading-relaxed">
										<p>
											此字段为
											<span className="font-semibold">
												游戏废案
											</span>
											，原版游戏未启用前缀效果。
										</p>
										<p>
											若要在游戏中实际生效，请安装模组{' '}
											<a
												href="https://github.com/MetaMystia/PreFix"
												target="_blank"
												rel="noreferrer"
												className="underline"
											>
												MetaMystia/PreFix
											</a>
											。
										</p>
										<p>默认值为「[-1] 无」。</p>
									</div>
								</InfoTip>
							</div>
							<Select<number>
								id={idPrefix}
								ariaLabel="原料前缀"
								value={prefixValue}
								onChange={(v) => onUpdate({ prefix: v })}
								items={prefixItems}
							/>
						</div>

						<div className="flex flex-col gap-1">
							<Label htmlFor={idBaseValue}>
								价格 (BaseValue)
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
					<TagsField
						label=""
						tags={ingredient.tags}
						tagPool={FOOD_TAGS}
						onChange={(newTags) => onUpdate({ tags: newTags })}
					/>
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
