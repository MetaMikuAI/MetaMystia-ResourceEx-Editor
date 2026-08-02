import { memo, useCallback, useId } from 'react';

import Input from '@/design/ui/components/input';
import Textarea from '@/design/ui/components/textarea';

import { FOOD_TAGS } from '@/domain/data/tags';
import type { Food } from '@/domain/resourcePack/contracts/items';

import { Label } from '@/features/resourceEditor/client/components/fields/Label';
import { EditorDetailEmptyState } from '@/features/resourceEditor/client/components/layout/EditorDetailEmptyState';
import { EditorDetailHeader } from '@/features/resourceEditor/client/components/layout/EditorDetailHeader';
import { EditorDetailPanel } from '@/features/resourceEditor/client/components/layout/EditorDetailPanel';
import { EditorSection } from '@/features/resourceEditor/client/components/layout/EditorSection';
import { ErrorBadge } from '@/features/resourceEditor/client/components/status/ErrorBadge';
import { TagsField } from '@/features/resourceEditor/client/components/tags/TagsField';
import { SpriteUploader } from '@/features/resourceEditor/client/components/uploads/SpriteUploader';
import { IdRangeBadge } from '@/features/resourceEditor/client/editors/info/IdRangeBadge';
import { useResourceEditor } from '@/features/resourceEditor/client/state/useResourceEditor';

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

	const { getAssetUrl, updateAsset } = useResourceEditor();

	const handleSpriteUpdate = useCallback(
		(blob: Blob) => {
			if (!food) return { isSuccess: false, error: '未选择料理。' };
			return updateAsset(food.spritePath, blob);
		},
		[food, updateAsset]
	);

	if (!food) {
		return <EditorDetailEmptyState itemLabel="料理" />;
	}

	const spriteUrl = getAssetUrl(food.spritePath);

	return (
		<EditorDetailPanel>
			<EditorDetailHeader title="料理编辑" />

			<EditorSection title="基本信息">
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
						<Input
							id={idId}
							type="number"
							value={isNaN(food.id) ? '' : String(food.id)}
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
							isInvalid={Boolean(isIdTooSmall)}
						/>
					</div>

					<div className="flex flex-col gap-1">
						<Label htmlFor={idName}>名称（Name）</Label>
						<Input
							id={idName}
							type="text"
							value={food.name}
							onChange={(e) => onUpdate({ name: e.target.value })}
						/>
					</div>

					<div className="col-span-full flex flex-col gap-1">
						<Label htmlFor={idDescription}>
							描述（Description）
						</Label>
						<Textarea
							id={idDescription}
							value={food.description}
							onChange={(e) =>
								onUpdate({ description: e.target.value })
							}
							minRows={3}
						/>
					</div>
				</div>
			</EditorSection>

			<EditorSection title="属性">
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div className="flex flex-col gap-1">
						<Label htmlFor={idLevel}>等级（Level）</Label>
						<Input
							id={idLevel}
							type="number"
							value={isNaN(food.level) ? '' : String(food.level)}
							onChange={(e) =>
								onUpdate({ level: parseInt(e.target.value) })
							}
						/>
					</div>

					<div className="flex flex-col gap-1">
						<Label htmlFor={idBaseValue}>价格（BaseValue）</Label>
						<Input
							id={idBaseValue}
							type="number"
							value={
								isNaN(food.baseValue)
									? ''
									: String(food.baseValue)
							}
							onChange={(e) =>
								onUpdate({
									baseValue: parseInt(e.target.value),
								})
							}
						/>
					</div>
				</div>
			</EditorSection>

			<EditorSection title="标签（Food Tags）">
				<TagsField
					label=""
					tags={food.tags}
					tagPool={FOOD_TAGS}
					onChange={(newTags) => onUpdate({ tags: newTags })}
					tone="positive"
				/>
			</EditorSection>

			<EditorSection title="禁止使用的标签（Ban Tags）">
				<TagsField
					label=""
					tags={food.banTags ?? []}
					tagPool={FOOD_TAGS}
					onChange={(newTags) => onUpdate({ banTags: newTags })}
					tone="negative"
				/>
			</EditorSection>

			<EditorSection title="贴图（预期26×26）">
				<SpriteUploader
					spriteUrl={spriteUrl ?? null}
					spritePath={food.spritePath}
					onUpload={handleSpriteUpdate}
				/>
			</EditorSection>
		</EditorDetailPanel>
	);
});
