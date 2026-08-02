import { memo, useCallback, useId } from 'react';

import Input from '@/design/ui/components/input';
import Textarea from '@/design/ui/components/textarea';

import { BEVERAGE_TAGS } from '@/domain/data/tags';
import type { Beverage } from '@/domain/resourcePack/contracts/items';

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

interface BeverageEditorProps {
	beverage: Beverage | null;
	beverageIndex: number | null;
	onUpdate: (updates: Partial<Beverage>) => void;
}

export const BeverageEditor = memo<BeverageEditorProps>(
	function BeverageEditor({ beverage, onUpdate }) {
		const idId = useId();
		const idName = useId();
		const idDescription = useId();
		const idLevel = useId();
		const idBaseValue = useId();

		const isIdTooSmall = beverage && beverage.id < 9000;

		const { getAssetUrl, updateAsset } = useResourceEditor();

		const handleSpriteUpdate = useCallback(
			(blob: Blob) => {
				if (!beverage) {
					return { isSuccess: false, error: '未选择酒水。' };
				}
				return updateAsset(beverage.spritePath, blob);
			},
			[beverage, updateAsset]
		);

		if (!beverage) {
			return <EditorDetailEmptyState itemLabel="酒水" />;
		}

		const spriteUrl = getAssetUrl(beverage.spritePath);

		return (
			<EditorDetailPanel>
				<EditorDetailHeader title="酒水编辑" />

				<EditorSection title="基本信息">
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div className="flex flex-col gap-1">
							<div className="flex items-center justify-between">
								<Label htmlFor={idId}>ID</Label>
								<div className="flex gap-2">
									{isIdTooSmall && (
										<ErrorBadge>ID需&ge;9000</ErrorBadge>
									)}
									<IdRangeBadge id={beverage.id} />
								</div>
							</div>
							<Input
								id={idId}
								type="number"
								value={
									isNaN(beverage.id)
										? ''
										: String(beverage.id)
								}
								onChange={(e) => {
									const val = parseInt(e.target.value);
									if (isNaN(val)) {
										onUpdate({ id: val });
									} else {
										onUpdate({
											id: val,
											spritePath: `assets/Beverage/${val}.png`,
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
								value={beverage.name}
								onChange={(e) =>
									onUpdate({ name: e.target.value })
								}
							/>
						</div>

						<div className="col-span-full flex flex-col gap-1">
							<Label htmlFor={idDescription}>
								描述（Description）
							</Label>
							<Textarea
								id={idDescription}
								value={beverage.description}
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
								value={
									isNaN(beverage.level)
										? ''
										: String(beverage.level)
								}
								min={1}
								max={5}
								onChange={(e) =>
									onUpdate({
										level: parseInt(e.target.value),
									})
								}
							/>
						</div>

						<div className="flex flex-col gap-1">
							<Label htmlFor={idBaseValue}>
								价格（BaseValue）
							</Label>
							<Input
								id={idBaseValue}
								type="number"
								value={
									isNaN(beverage.baseValue)
										? ''
										: String(beverage.baseValue)
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

				<EditorSection title="标签（Beverage Tags）">
					<TagsField
						label=""
						tags={beverage.tags}
						tagPool={BEVERAGE_TAGS}
						onChange={(newTags) => onUpdate({ tags: newTags })}
						tone="beverage"
					/>
				</EditorSection>

				<EditorSection title="资源（Assets）">
					<SpriteUploader
						spriteUrl={spriteUrl ?? null}
						spritePath={beverage.spritePath}
						onUpload={handleSpriteUpdate}
					/>
				</EditorSection>
			</EditorDetailPanel>
		);
	}
);
