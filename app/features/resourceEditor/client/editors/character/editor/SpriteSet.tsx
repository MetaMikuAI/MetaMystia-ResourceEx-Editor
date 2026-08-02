import { cn } from '@heroui/theme';
import { useState } from 'react';

import Button from '@/design/ui/components/button';
import Input from '@/design/ui/components/input';
import Switch from '@/design/ui/components/switch';

import type { CharacterSpriteSet } from '@/domain/resourcePack/contracts/character';

import { ConfirmPopover } from '@/features/resourceEditor/client/components/confirm/ConfirmPopover';
import { InfoTip } from '@/features/resourceEditor/client/components/fields/InfoTip';
import { Label } from '@/features/resourceEditor/client/components/fields/Label';
import { ChevronRight } from '@/features/resourceEditor/client/components/icons/ChevronRight';
import { EmptyState } from '@/features/resourceEditor/client/components/layout/EmptyState';
import { EditorSection } from '@/features/resourceEditor/client/components/layout/EditorSection';
import { WarningBadge } from '@/features/resourceEditor/client/components/status/WarningBadge';
import { WarningNotice } from '@/features/resourceEditor/client/components/status/WarningNotice';
import { useLabelPrefixValidation } from '@/features/resourceEditor/client/hooks/useLabelPrefixValidation';
import { useResourceEditor } from '@/features/resourceEditor/client/state/useResourceEditor';

import { readImageDimensions } from '@/infrastructure/browser/images/readImageDimensions';

interface SpriteSetProps {
	characterId: number;
	spriteSet: CharacterSpriteSet | undefined;
	label: string;
	onUpdate: (updates: Partial<CharacterSpriteSet>) => void;
	onEnable: () => void;
	onDisable: () => void;
	onGenerateDefaults: () => void;
}

export function SpriteSetEditor({
	characterId,
	spriteSet,
	onUpdate,
	onEnable,
	onDisable,
	onGenerateDefaults,
}: SpriteSetProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const [isDisableConfirmationOpen, setIsDisableConfirmationOpen] =
		useState(false);
	const [uploadError, setUploadError] = useState<string | null>(null);
	const { getAssetUrl, updateAsset } = useResourceEditor();
	const {
		isValid: isSpriteNamePrefixValid,
		prefix: expectedPrefix,
		hasPackLabel,
	} = useLabelPrefixValidation(spriteSet?.name || '');
	const showPrefixWarning =
		hasPackLabel && spriteSet && !isSpriteNamePrefixValid;

	const updateSpriteArray = (
		field: 'mainSprite' | 'eyeSprite',
		index: number,
		value: string
	) => {
		if (!spriteSet) return;
		const newArray = [...spriteSet[field]];
		newArray[index] = value;
		onUpdate({ [field]: newArray });
	};

	const handleUpload = async (
		field: 'mainSprite' | 'eyeSprite',
		index: number,
		file: File
	) => {
		let dimensions;
		try {
			dimensions = await readImageDimensions(file);
		} catch {
			setUploadError('无法读取角色小人贴图尺寸。');
			return;
		}
		if (dimensions.width !== 64 || dimensions.height !== 64) {
			setUploadError(
				`错误：角色小人贴图尺寸必须为64×64，当前为${dimensions.width}×${dimensions.height}。`
			);
			return;
		}
		setUploadError(null);

		let filename = '';
		if (field === 'mainSprite') {
			const row = Math.floor(index / 3);
			const col = index % 3;
			filename = `Main_${row}, ${col}.png`;
		} else {
			const row = Math.floor(index / 4);
			const col = index % 4;
			filename = `Eyes_${row}, ${col}.png`;
		}

		const path = `assets/Character/${characterId}/Sprite/${filename}`;
		updateAsset(path, file);
		updateSpriteArray(field, index, path);
	};

	return (
		<EditorSection
			title={
				<div className="flex min-w-0 items-center gap-1">
					<Button
						variant="light"
						size="sm"
						aria-expanded={isExpanded}
						className="-ml-2 h-10 px-2 text-base font-semibold text-foreground-700 sm:h-8"
						startContent={
							<ChevronRight
								className={cn(
									'h-4 w-4 transition-transform duration-200 motion-reduce:transition-none',
									isExpanded && 'rotate-90'
								)}
							/>
						}
						onPress={() => setIsExpanded((value) => !value)}
					>
						角色小人配置（Sprite Set）
					</Button>
					<InfoTip>
						配置角色的小人贴图，包括主身体和眼睛的贴图。贴图大小为64×64。主身体为12张，一共4个方向，每个方向3张。如需尝试创作，可以在群文件中找到游戏原始资源，或使用MetaMystia提供的资源包。
					</InfoTip>
				</div>
			}
			actions={
				<div className="flex items-center gap-2">
					<span className="whitespace-nowrap text-xs font-medium text-foreground-600">
						{spriteSet ? '已启用角色小人配置' : '启用角色小人配置'}
					</span>
					{spriteSet ? (
						<ConfirmPopover
							title="确定要关闭角色小人配置吗？"
							description="关闭后将丢失名称与贴图路径等所有小人配置数据，且不可恢复。"
							confirmLabel="确认关闭"
							isOpen={isDisableConfirmationOpen}
							onConfirm={onDisable}
							onOpenChange={setIsDisableConfirmationOpen}
							trigger={
								<Switch
									aria-label="关闭角色小人配置"
									isSelected
									onValueChange={(isSelected) => {
										if (!isSelected) {
											setIsDisableConfirmationOpen(true);
										}
									}}
									size="sm"
								/>
							}
						/>
					) : (
						<Switch
							aria-label="启用角色小人配置"
							size="sm"
							isSelected={false}
							onValueChange={(isSelected) => {
								if (!isSelected) return;
								setIsExpanded(true);
								onEnable();
							}}
						/>
					)}
				</div>
			}
		>
			{uploadError !== null && (
				<WarningNotice>{uploadError}</WarningNotice>
			)}

			{isExpanded && spriteSet && (
				<div className="flex min-w-0 flex-col gap-6">
					<div className="flex flex-col gap-2">
						<div className="flex flex-wrap items-center justify-between gap-2">
							<Label tip="角色小人名称，建议以_{资源包标识符}_开头，如：_MyPack_Daiyousei。">
								角色小人名称（Name）
							</Label>
							<div className="flex items-center gap-2">
								{showPrefixWarning && (
									<WarningBadge>
										建议以{expectedPrefix}开头
									</WarningBadge>
								)}
								<Button
									size="sm"
									variant="bordered"
									className="h-10 sm:h-8"
									onPress={onGenerateDefaults}
								>
									刷新默认填充
								</Button>
							</div>
						</div>
						<Input
							type="text"
							value={spriteSet.name}
							onChange={(e) => onUpdate({ name: e.target.value })}
							placeholder="默认为角色标签（Label）"
						/>
					</div>

					<div className="flex flex-col gap-4">
						<Label>主身体贴图（Main Sprites，12张）</Label>
						<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
							{spriteSet.mainSprite.map((path, i) => (
								<div
									key={i}
									className="group relative flex min-w-0 flex-col gap-2 rounded-large border border-divider bg-content1/50 p-2 transition-colors hover:bg-content1 motion-reduce:transition-none"
								>
									<label
										className="bg-checkerboard relative aspect-square cursor-pointer overflow-hidden rounded-medium border border-divider hover:border-primary/50"
										onDragOver={(e) => e.preventDefault()}
										onDrop={(e) => {
											e.preventDefault();
											const file =
												e.dataTransfer.files?.[0];
											if (
												file &&
												file.type === 'image/png'
											) {
												handleUpload(
													'mainSprite',
													i,
													file
												);
											}
										}}
									>
										<span className="absolute left-1 top-1 z-10 rounded bg-background/80 px-1 text-xs text-foreground">
											{i}
										</span>
										{getAssetUrl(path) ? (
											<img
												src={getAssetUrl(path)}
												className="image-rendering-pixelated h-full w-full object-contain"
												alt={`第${i + 1}张主身体贴图`}
											/>
										) : (
											<div className="flex h-full w-full flex-col items-center justify-center text-foreground-500">
												<span className="text-xs font-medium">
													上传
												</span>
											</div>
										)}
										<div className="absolute inset-0 flex items-center justify-center bg-background/75 opacity-0 transition-opacity group-hover:opacity-100 motion-reduce:transition-none">
											<span className="text-xs font-semibold text-foreground">
												更换
											</span>
										</div>
										<input
											type="file"
											accept="image/png"
											className="hidden"
											onChange={(e) => {
												const file =
													e.target.files?.[0];
												if (file)
													handleUpload(
														'mainSprite',
														i,
														file
													);
											}}
										/>
									</label>
									<p className="truncate text-center text-xs text-foreground-500">
										{path.split('/').pop()}
									</p>
								</div>
							))}
						</div>
					</div>

					<div className="flex flex-col gap-4">
						<Label>眼睛贴图（Eye Sprites，24张）</Label>
						<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
							{spriteSet.eyeSprite.map((path, i) => (
								<div
									key={i}
									className="group relative flex min-w-0 flex-col gap-2 rounded-large border border-divider bg-content1/50 p-2 transition-colors hover:bg-content1 motion-reduce:transition-none"
								>
									<label
										className="bg-checkerboard relative aspect-square cursor-pointer overflow-hidden rounded-medium border border-divider hover:border-primary/50"
										onDragOver={(e) => e.preventDefault()}
										onDrop={(e) => {
											e.preventDefault();
											const file =
												e.dataTransfer.files?.[0];
											if (
												file &&
												file.type === 'image/png'
											) {
												handleUpload(
													'eyeSprite',
													i,
													file
												);
											}
										}}
									>
										<span className="absolute left-1 top-1 z-10 rounded bg-background/80 px-1 text-xs text-foreground">
											{i}
										</span>
										{getAssetUrl(path) ? (
											<img
												src={getAssetUrl(path)}
												className="image-rendering-pixelated h-full w-full object-contain"
												alt={`第${i + 1}张眼睛贴图`}
											/>
										) : (
											<div className="flex h-full w-full flex-col items-center justify-center text-foreground-500">
												<span className="text-xs font-medium">
													上传
												</span>
											</div>
										)}
										<div className="absolute inset-0 flex items-center justify-center bg-background/75 opacity-0 transition-opacity group-hover:opacity-100 motion-reduce:transition-none">
											<span className="text-xs font-semibold text-foreground">
												更换
											</span>
										</div>
										<input
											type="file"
											accept="image/png"
											className="hidden"
											onChange={(e) => {
												const file =
													e.target.files?.[0];
												if (file)
													handleUpload(
														'eyeSprite',
														i,
														file
													);
											}}
										/>
									</label>
									<p className="truncate text-center text-xs text-foreground-500">
										{path.split('/').pop()}
									</p>
								</div>
							))}
						</div>
					</div>
				</div>
			)}
			{isExpanded && !spriteSet && (
				<EmptyState
					title="暂未启用角色小人配置"
					description="可使用右侧开关启用角色小人配置。"
				/>
			)}
		</EditorSection>
	);
}
