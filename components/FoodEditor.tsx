import { memo, useCallback, useId } from 'react';

import { useData } from '@/components/DataContext';
import { FOOD_TAGS } from '@/data/tags';

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
	const idSpritePath = useId();

	const isIdTooSmall = food && food.id < 9000;

	const { getAssetUrl, updateAsset } = useData();

	const handleSpriteUpload = useCallback(
		async (e: React.ChangeEvent<HTMLInputElement>) => {
			if (!food) return;

			const file = e.target.files?.[0];
			if (!file) return;

			// Validate image dimensions - recommend 26x26 but allow other sizes
			const img = new Image();
			const url = URL.createObjectURL(file);
			img.src = url;

			await new Promise<void>((resolve) => {
				img.onload = () => {
					if (img.width !== 26 || img.height !== 26) {
						const proceed = confirm(
							`当前图片尺寸为 ${img.width}x${img.height}，建议尺寸为 26x26 像素。\n\n是否继续上传？`
						);
						if (!proceed) {
							URL.revokeObjectURL(url);
							return;
						}
					}
					resolve();
				};
				img.onerror = () => resolve();
			});

			URL.revokeObjectURL(url);

			const blob = new Blob([await file.arrayBuffer()], {
				type: file.type,
			});
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
							<label
								htmlFor={idId}
								className="text-xs font-medium uppercase opacity-60"
							>
								ID
							</label>
							{isIdTooSmall && (
								<span className="rounded bg-danger px-1.5 py-0.5 text-[10px] font-medium text-white">
									ID需&ge;9000
								</span>
							)}
						</div>
						<input
							id={idId}
							type="number"
							value={food.id}
							onChange={(e) =>
								onUpdate({ id: parseInt(e.target.value) })
							}
							className={cn(
								'h-9 w-full rounded-lg border bg-white/40 px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-black/30 focus:ring-2 focus:ring-black/10 dark:bg-black/10 dark:focus:border-white/30 dark:focus:ring-white/10',
								isIdTooSmall
									? 'border-danger bg-danger text-white opacity-50 focus:border-danger'
									: 'border-black/10 dark:border-white/10'
							)}
						/>
					</div>

					<div className="flex flex-col gap-1">
						<label
							htmlFor={idName}
							className="text-xs font-medium uppercase opacity-60"
						>
							名称 (Name)
						</label>
						<input
							id={idName}
							type="text"
							value={food.name}
							onChange={(e) => onUpdate({ name: e.target.value })}
							className="h-9 w-full rounded-lg border border-black/10 bg-white/40 px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-black/30 focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-black/10 dark:focus:border-white/10 dark:focus:ring-white/10"
						/>
					</div>

					<div className="col-span-full flex flex-col gap-1">
						<label
							htmlFor={idDescription}
							className="text-xs font-medium uppercase opacity-60"
						>
							描述 (Description)
						</label>
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
						<label
							htmlFor={idLevel}
							className="text-xs font-medium uppercase opacity-60"
						>
							等级 (Level)
						</label>
						<input
							id={idLevel}
							type="number"
							value={food.level}
							onChange={(e) =>
								onUpdate({ level: parseInt(e.target.value) })
							}
							className="h-9 w-full rounded-lg border border-black/10 bg-white/40 px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-black/30 focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-black/10 dark:focus:border-white/10 dark:focus:ring-white/10"
						/>
					</div>

					<div className="flex flex-col gap-1">
						<label
							htmlFor={idBaseValue}
							className="text-xs font-medium uppercase opacity-60"
						>
							价值 (BaseValue)
						</label>
						<input
							id={idBaseValue}
							type="number"
							value={food.baseValue}
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
				<div className="flex flex-col gap-4 md:flex-row">
					{/* 预览/上传区 */}
					<label
						className={cn(
							'bg-checkerboard group relative flex h-32 w-32 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-all',
							spriteUrl
								? 'border-primary/30 hover:border-primary/50'
								: 'border-black/10 hover:border-black/30 dark:border-white/10 dark:hover:border-white/30'
						)}
					>
						{spriteUrl ? (
							<>
								<img
									src={spriteUrl}
									alt="料理贴图"
									className="image-rendering-pixelated h-16 w-16 object-contain"
									draggable="false"
								/>
								<div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
									<span className="text-xs font-medium text-white">
										点击更换
									</span>
								</div>
							</>
						) : (
							<div className="flex flex-col items-center gap-2 text-black/40 dark:text-white/40">
								<span className="text-2xl">🖼️</span>
								<span className="text-xs">点击上传</span>
							</div>
						)}
						<input
							type="file"
							accept="image/*"
							onChange={handleSpriteUpload}
							className="hidden"
						/>
					</label>

					{/* 路径编辑 */}
					<div className="flex flex-1 flex-col gap-1">
						<label
							htmlFor={idSpritePath}
							className="text-xs font-medium uppercase opacity-60"
						>
							贴图路径
						</label>
						<input
							id={idSpritePath}
							type="text"
							value={food.spritePath}
							onChange={(e) =>
								onUpdate({ spritePath: e.target.value })
							}
							className="h-9 w-full rounded-lg border border-black/10 bg-white/40 px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-black/30 focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-black/10 dark:focus:border-white/10 dark:focus:ring-white/10"
						/>
						<p className="text-xs text-black/40 dark:text-white/40">
							上传图片会自动使用此路径保存
						</p>
					</div>
				</div>
			</div>
		</div>
	);
});
