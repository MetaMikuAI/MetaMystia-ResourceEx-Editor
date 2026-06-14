import { memo, useCallback, useId, useMemo, useState } from 'react';

import { Button, Select } from '@/design/ui/components';
import type { SelectItemSpec } from '@/design/ui/components';
import { AssetPickerDialog } from '@/components/asset/AssetPickerDialog';
import { useData } from '@/components/context/DataContext';
import { Label } from '@/components/common/Label';
import { TextInput } from '@/components/common/TextInput';
import { WarningBadge } from '@/components/common/WarningBadge';

import type {
	Dialog,
	DialogAction,
	DialogActionType,
	DialogBranchOption,
} from '@/types/resource';

const ACTION_TYPES: DialogActionType[] = [
	'CameraShake',
	'CG',
	'BG',
	'Sound',
	'Branch',
	'Goto',
	'End',
];

const ACTION_LABEL: Record<DialogActionType, string> = {
	CameraShake: '镜头抖动',
	CG: 'CG',
	BG: 'BG',
	Sound: '音效',
	Branch: '选项分支',
	Goto: '跳转',
	End: '结束',
};

const ACTION_FOLDER: Partial<Record<DialogActionType, string>> = {
	CG: 'assets/CG/',
	BG: 'assets/BG/',
	Sound: 'assets/Audio/',
};

type SpriteMode = 'set' | 'clear';

function getSpriteMode(action: DialogAction): SpriteMode {
	return action.shouldSet === false ? 'clear' : 'set';
}

function makeDefaultAction(type: DialogActionType): DialogAction {
	if (type === 'CameraShake') {
		return { actionType: type };
	}
	if (type === 'Sound') {
		return { actionType: type, sound: '' };
	}
	if (type === 'Branch') {
		return {
			actionType: type,
			options: [
				{ text: '', jump: 1 },
				{ text: '', jump: 1 },
			],
		};
	}
	if (type === 'Goto') {
		return { actionType: type, index: 1 };
	}
	if (type === 'End') {
		return { actionType: type, exitCode: 0 };
	}
	return { actionType: type, sprite: '' };
}

interface DialogActionsEditorProps {
	actions: DialogAction[] | undefined;
	dialogCount: number;
	onChange: (actions: DialogAction[] | undefined) => void;
}

export const DialogActionsEditor = memo<DialogActionsEditorProps>(
	function DialogActionsEditor({ actions, dialogCount, onChange }) {
		const list = actions ?? [];

		const update = useCallback(
			(next: DialogAction[]) => {
				onChange(next.length > 0 ? next : undefined);
			},
			[onChange]
		);

		const handleAdd = useCallback(
			(type: DialogActionType) => {
				update([...list, makeDefaultAction(type)]);
			},
			[list, update]
		);

		const handleRemove = useCallback(
			(index: number) => {
				update(list.filter((_, i) => i !== index));
			},
			[list, update]
		);

		const handleUpdate = useCallback(
			(index: number, patch: Partial<DialogAction>) => {
				const next = list.map((act, i) =>
					i === index ? ({ ...act, ...patch } as DialogAction) : act
				);
				update(next);
			},
			[list, update]
		);

		const handleMove = useCallback(
			(from: number, to: number) => {
				if (to < 0 || to >= list.length) return;
				const next = [...list];
				const [moved] = next.splice(from, 1);
				if (!moved) return;
				next.splice(to, 0, moved);
				update(next);
			},
			[list, update]
		);

		return (
			<div className="flex flex-col gap-2 rounded-lg border border-dashed border-black/10 bg-black/[0.02] p-3 dark:border-white/10 dark:bg-white/[0.02]">
				<div className="flex flex-wrap items-center justify-between gap-2">
					<span className="text-xs font-medium opacity-70">
						动作列表（{list.length}）
					</span>
					<div className="flex flex-wrap gap-1">
						{ACTION_TYPES.map((type) => (
							<Button
								key={type}
								variant="light"
								size="sm"
								onPress={() => {
									handleAdd(type);
								}}
								className="rounded-md border border-black/10 px-2 py-0.5 text-xs hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
							>
								+ {ACTION_LABEL[type]}
							</Button>
						))}
					</div>
				</div>

				{list.length === 0 ? (
					<p className="py-1 text-center text-[11px] italic opacity-40">
						无附加动作
					</p>
				) : (
					<div className="flex flex-col gap-2">
						{list.map((action, index) => (
							<DialogActionRow
								key={index}
								action={action}
								index={index}
								dialogCount={dialogCount}
								total={list.length}
								onRemove={() => {
									handleRemove(index);
								}}
								onUpdate={(patch) => {
									handleUpdate(index, patch);
								}}
								onMoveUp={() => {
									handleMove(index, index - 1);
								}}
								onMoveDown={() => {
									handleMove(index, index + 1);
								}}
							/>
						))}
					</div>
				)}
			</div>
		);
	}
);

interface DialogActionRowProps {
	action: DialogAction;
	index: number;
	dialogCount: number;
	total: number;
	onUpdate: (patch: Partial<DialogAction>) => void;
	onRemove: () => void;
	onMoveUp: () => void;
	onMoveDown: () => void;
}

const DialogActionRow = memo<DialogActionRowProps>(function DialogActionRow({
	action,
	index,
	dialogCount,
	total,
	onUpdate,
	onRemove,
	onMoveUp,
	onMoveDown,
}) {
	const isSpriteAction =
		action.actionType === 'CG' || action.actionType === 'BG';
	const isSoundAction = action.actionType === 'Sound';
	const isBranchAction = action.actionType === 'Branch';
	const isGotoAction = action.actionType === 'Goto';
	const isEndAction = action.actionType === 'End';

	return (
		<div className="flex flex-col gap-2 rounded-md border border-black/10 bg-black/5 p-2 dark:border-white/10 dark:bg-white/5">
			<div className="flex items-center justify-between gap-2">
				<div className="flex items-center gap-2">
					<span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-primary">
						#{index + 1}
					</span>
					<span className="text-xs font-medium">
						{ACTION_LABEL[action.actionType]}
					</span>
				</div>
				<div className="flex items-center gap-1">
					<Button
						variant="light"
						size="sm"
						isIconOnly
						onPress={onMoveUp}
						isDisabled={index === 0}
						className="h-6 w-6 min-w-0 rounded text-xs opacity-60"
						title="上移"
					>
						↑
					</Button>
					<Button
						variant="light"
						size="sm"
						isIconOnly
						onPress={onMoveDown}
						isDisabled={index === total - 1}
						className="h-6 w-6 min-w-0 rounded text-xs opacity-60"
						title="下移"
					>
						↓
					</Button>
					<Button
						color="danger"
						size="sm"
						onPress={onRemove}
						className="h-6 min-w-0 rounded px-2 text-xs"
					>
						删除
					</Button>
				</div>
			</div>

			{isSpriteAction && (
				<SpriteActionFields action={action} onUpdate={onUpdate} />
			)}
			{isSoundAction && (
				<SoundActionFields action={action} onUpdate={onUpdate} />
			)}
			{isBranchAction && (
				<BranchActionFields
					action={action}
					dialogCount={dialogCount}
					onUpdate={onUpdate}
				/>
			)}
			{isGotoAction && (
				<GotoActionFields
					action={action}
					dialogCount={dialogCount}
					onUpdate={onUpdate}
				/>
			)}
			{isEndAction && (
				<EndActionFields action={action} onUpdate={onUpdate} />
			)}
		</div>
	);
});

interface SpriteActionFieldsProps {
	action: DialogAction;
	onUpdate: (patch: Partial<DialogAction>) => void;
}

const SpriteActionFields = memo<SpriteActionFieldsProps>(
	function SpriteActionFields({ action, onUpdate }) {
		const mode = getSpriteMode(action);
		const folder = ACTION_FOLDER[action.actionType] ?? 'assets/';
		const radioName = useId();
		const selectId = useId();

		const { assetUrls, getAssetUrl } = useData();

		const availableAssets = useMemo(() => {
			return Object.keys(assetUrls)
				.filter((path) => path.startsWith(folder))
				.sort();
		}, [assetUrls, folder]);

		const previewUrl =
			mode === 'set' && action.sprite
				? getAssetUrl(action.sprite)
				: undefined;

		const isMissing =
			mode === 'set' &&
			!!action.sprite &&
			!availableAssets.includes(action.sprite);

		const spriteItems = useMemo<SelectItemSpec<string>[]>(() => {
			const items: SelectItemSpec<string>[] = [
				{ value: '', label: '— 选择资产 —' },
			];
			if (isMissing && action.sprite) {
				items.push({
					value: action.sprite,
					label: `${action.sprite}（缺失）`,
				});
			}
			for (const path of availableAssets) {
				items.push({ value: path, label: path.slice(folder.length) });
			}
			return items;
		}, [availableAssets, action.sprite, isMissing, folder]);

		const [isPickerOpen, setIsPickerOpen] = useState(false);

		const handleModeChange = (next: SpriteMode) => {
			if (next === 'clear') {
				onUpdate({ sprite: undefined, shouldSet: false });
			} else {
				onUpdate({ shouldSet: undefined, sprite: action.sprite ?? '' });
			}
		};

		return (
			<div className="flex flex-col gap-2">
				<div className="flex flex-wrap items-center gap-3 text-xs">
					<label className="flex cursor-pointer items-center gap-1">
						<input
							type="radio"
							name={radioName}
							checked={mode === 'set'}
							onChange={() => handleModeChange('set')}
						/>
						设置图片
					</label>
					<label className="flex cursor-pointer items-center gap-1">
						<input
							type="radio"
							name={radioName}
							checked={mode === 'clear'}
							onChange={() => handleModeChange('clear')}
						/>
						清空（shouldSet:false）
					</label>
				</div>

				{mode === 'set' && (
					<div className="flex flex-col gap-2 sm:flex-row">
						<div className="bg-checkerboard flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md border border-black/10 dark:border-white/10">
							{previewUrl ? (
								<img
									src={previewUrl}
									alt="预览"
									className="h-full w-full object-contain"
									draggable={false}
								/>
							) : (
								<span className="text-[10px] opacity-40">
									无预览
								</span>
							)}
						</div>
						<div className="flex flex-1 flex-col gap-1">
							<div className="flex items-center justify-between gap-2">
								<Label
									htmlFor={selectId}
									className="text-xs normal-case opacity-70"
								>
									资产路径（来自 {folder}）
								</Label>
								{isMissing && (
									<WarningBadge>资产未注册</WarningBadge>
								)}
							</div>
							<div className="flex items-center gap-1">
								<Select<string>
									id={selectId}
									ariaLabel="资产路径"
									size="sm"
									isInvalid={isMissing}
									placeholder="— 选择资产 —"
									value={action.sprite ?? ''}
									onChange={(v) =>
										onUpdate({ sprite: v || undefined })
									}
									items={spriteItems}
									className="flex-1"
								/>
								<Button
									variant="light"
									size="sm"
									isIconOnly
									onPress={() => setIsPickerOpen(true)}
									className="h-8 w-8 min-w-0 rounded-md"
									title="浏览资产"
								>
									<svg
										viewBox="0 0 24 24"
										className="h-4 w-4"
										fill="none"
										stroke="currentColor"
										strokeWidth={2}
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<path d="M3 6.5A2.5 2.5 0 0 1 5.5 4H10l2 2h6.5A2.5 2.5 0 0 1 21 8.5v9A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5z" />
									</svg>
								</Button>
							</div>
							{availableAssets.length === 0 && (
								<p className="text-[10px] opacity-50">
									{folder} 下暂无资源，请前往「资产」页上传。
								</p>
							)}
						</div>
					</div>
				)}

				<AssetPickerDialog
					open={isPickerOpen}
					onClose={() => setIsPickerOpen(false)}
					onSelect={(path) => onUpdate({ sprite: path })}
					initialFolder={folder}
				/>
			</div>
		);
	}
);

interface BranchActionFieldsProps {
	action: DialogAction;
	dialogCount: number;
	onUpdate: (patch: Partial<DialogAction>) => void;
}

const BranchActionFields = memo<BranchActionFieldsProps>(
	function BranchActionFields({ action, dialogCount, onUpdate }) {
		const options = action.options ?? [];
		const finishTarget = dialogCount + 1;

		const updateOptions = (next: DialogBranchOption[]) => {
			onUpdate({ options: next.length > 0 ? next : undefined });
		};

		const updateOption = (
			optionIndex: number,
			patch: Partial<DialogBranchOption>
		) => {
			updateOptions(
				options.map((option, i) =>
					i === optionIndex ? { ...option, ...patch } : option
				)
			);
		};

		const removeOption = (optionIndex: number) => {
			updateOptions(options.filter((_, i) => i !== optionIndex));
		};

		const moveOption = (from: number, to: number) => {
			if (to < 0 || to >= options.length) return;
			const next = [...options];
			const [moved] = next.splice(from, 1);
			if (!moved) return;
			next.splice(to, 0, moved);
			updateOptions(next);
		};

		return (
			<div className="flex flex-col gap-2">
				<div className="flex flex-wrap items-center justify-between gap-2">
					<p className="text-[11px] opacity-60">
						跳转目标使用左侧显示的对话编号，范围 1-
						{finishTarget}，{finishTarget} 表示结束当前对话包。
					</p>
					<Button
						variant="light"
						size="sm"
						onPress={() =>
							updateOptions([...options, { text: '', jump: 1 }])
						}
						className="h-7 rounded-md border border-black/10 px-2 text-xs dark:border-white/10"
					>
						+ 选项
					</Button>
				</div>
				{options.length === 0 ? (
					<p className="rounded-md border border-warning/30 bg-warning/10 px-2 py-1 text-[11px] text-warning-700 dark:text-warning-300">
						Branch 至少需要一个选项，否则运行时会被当作普通对话行。
					</p>
				) : (
					<div className="flex flex-col gap-2">
						{options.map((option, optionIndex) => (
							<div
								key={optionIndex}
								className="grid gap-2 rounded-md border border-black/10 bg-background/50 p-2 sm:grid-cols-[minmax(0,1fr)_112px_auto] dark:border-white/10"
							>
								<div className="flex flex-col gap-1">
									<Label className="text-[10px] normal-case opacity-60">
										选项文本
									</Label>
									<TextInput
										value={option.text}
										onChange={(e) =>
											updateOption(optionIndex, {
												text: e.target.value,
											})
										}
										placeholder="请输入选项文本..."
										className="h-8 text-xs"
									/>
								</div>
								<div className="flex flex-col gap-1">
									<Label className="text-[10px] normal-case opacity-60">
										跳转
									</Label>
									<TextInput
										type="number"
										min={1}
										max={finishTarget}
										value={option.jump}
										onChange={(e) =>
											updateOption(optionIndex, {
												jump: numberOrOne(
													e.target.value
												),
											})
										}
										className="h-8 text-xs"
									/>
								</div>
								<div className="flex items-end gap-1">
									<Button
										variant="light"
										size="sm"
										isIconOnly
										onPress={() =>
											moveOption(
												optionIndex,
												optionIndex - 1
											)
										}
										isDisabled={optionIndex === 0}
										className="h-8 w-8 min-w-0 rounded-md text-xs opacity-60"
										title="上移选项"
									>
										↑
									</Button>
									<Button
										variant="light"
										size="sm"
										isIconOnly
										onPress={() =>
											moveOption(
												optionIndex,
												optionIndex + 1
											)
										}
										isDisabled={
											optionIndex === options.length - 1
										}
										className="h-8 w-8 min-w-0 rounded-md text-xs opacity-60"
										title="下移选项"
									>
										↓
									</Button>
									<Button
										color="danger"
										size="sm"
										onPress={() =>
											removeOption(optionIndex)
										}
										className="h-8 min-w-0 rounded-md px-2 text-xs"
									>
										删除
									</Button>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		);
	}
);

interface GotoActionFieldsProps {
	action: DialogAction;
	dialogCount: number;
	onUpdate: (patch: Partial<DialogAction>) => void;
}

const GotoActionFields = memo<GotoActionFieldsProps>(function GotoActionFields({
	action,
	dialogCount,
	onUpdate,
}) {
	const finishTarget = dialogCount + 1;
	return (
		<div className="flex flex-col gap-1">
			<Label className="text-xs normal-case opacity-70">
				跳转目标对话编号
			</Label>
			<div className="flex flex-col gap-1 sm:flex-row sm:items-center">
				<TextInput
					type="number"
					min={1}
					max={finishTarget}
					value={action.index ?? 1}
					onChange={(e) =>
						onUpdate({ index: numberOrOne(e.target.value) })
					}
					className="h-8 text-xs sm:w-32"
				/>
				<p className="text-[11px] opacity-60">
					使用左侧显示的对话编号，范围 1-{finishTarget}，
					{finishTarget} 表示结束当前对话包。
				</p>
			</div>
		</div>
	);
});

interface EndActionFieldsProps {
	action: DialogAction;
	onUpdate: (patch: Partial<DialogAction>) => void;
}

const EndActionFields = memo<EndActionFieldsProps>(function EndActionFields({
	action,
	onUpdate,
}) {
	return (
		<div className="flex flex-col gap-1">
			<Label className="text-xs normal-case opacity-70">退出码</Label>
			<div className="flex flex-col gap-1 sm:flex-row sm:items-center">
				<TextInput
					type="number"
					value={action.exitCode ?? 0}
					onChange={(e) =>
						onUpdate({ exitCode: numberOrZero(e.target.value) })
					}
					className="h-8 text-xs sm:w-32"
				/>
				<p className="text-[11px] opacity-60">
					结束当前对话包。普通对话保持 0 即可，只有需要读取 ExitCode
					的调用会使用这个值。
				</p>
			</div>
		</div>
	);
});

function numberOrOne(value: string): number {
	const parsed = Number.parseInt(value, 10);
	if (!Number.isFinite(parsed)) return 1;
	return parsed;
}

function numberOrZero(value: string): number {
	const parsed = Number.parseInt(value, 10);
	if (!Number.isFinite(parsed)) return 0;
	return parsed;
}

// Helper to keep Dialog typing consistent for callers that pass `Partial<Dialog>`
export type DialogActionsPatch = Pick<Dialog, 'actions'>;

interface SoundActionFieldsProps {
	action: DialogAction;
	onUpdate: (patch: Partial<DialogAction>) => void;
}

const SoundActionFields = memo<SoundActionFieldsProps>(
	function SoundActionFields({ action, onUpdate }) {
		const folder = ACTION_FOLDER.Sound ?? 'assets/Audio/';
		const selectId = useId();
		const [isPickerOpen, setIsPickerOpen] = useState(false);

		const { assetUrls, getAssetUrl } = useData();

		const availableAssets = useMemo(() => {
			return Object.keys(assetUrls)
				.filter((path) => path.startsWith(folder))
				.sort();
		}, [assetUrls, folder]);

		const previewUrl = action.sound ? getAssetUrl(action.sound) : undefined;

		const isMissing =
			!!action.sound && !availableAssets.includes(action.sound);

		const soundItems = useMemo<SelectItemSpec<string>[]>(() => {
			const items: SelectItemSpec<string>[] = [
				{ value: '', label: '— 选择音频 —' },
			];
			if (isMissing && action.sound) {
				items.push({
					value: action.sound,
					label: `${action.sound}（缺失）`,
				});
			}
			for (const path of availableAssets) {
				items.push({ value: path, label: path.slice(folder.length) });
			}
			return items;
		}, [availableAssets, action.sound, isMissing, folder]);

		return (
			<div className="flex flex-col gap-2">
				<div className="flex flex-col gap-1">
					<div className="flex items-center justify-between gap-2">
						<Label
							htmlFor={selectId}
							className="text-xs normal-case opacity-70"
						>
							音频路径（来自 {folder}，仅支持 .wav）
						</Label>
						{isMissing && <WarningBadge>资产未注册</WarningBadge>}
					</div>
					<div className="flex items-center gap-1">
						<Select<string>
							id={selectId}
							ariaLabel="音频路径"
							size="sm"
							isInvalid={isMissing}
							placeholder="— 选择音频 —"
							value={action.sound ?? ''}
							onChange={(v) =>
								onUpdate({ sound: v || undefined })
							}
							items={soundItems}
							className="flex-1"
						/>
						<Button
							variant="light"
							size="sm"
							isIconOnly
							onPress={() => setIsPickerOpen(true)}
							className="h-8 w-8 min-w-0 rounded-md"
							title="浏览资产"
						>
							<svg
								viewBox="0 0 24 24"
								className="h-4 w-4"
								fill="none"
								stroke="currentColor"
								strokeWidth={2}
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<path d="M3 6.5A2.5 2.5 0 0 1 5.5 4H10l2 2h6.5A2.5 2.5 0 0 1 21 8.5v9A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5z" />
							</svg>
						</Button>
					</div>
					{availableAssets.length === 0 && (
						<p className="text-[10px] opacity-50">
							{folder} 下暂无音频，请前往「资产」页上传 .wav
							文件。
						</p>
					)}
				</div>
				{previewUrl && (
					<audio
						controls
						src={previewUrl}
						className="h-8 w-full"
						preload="none"
					/>
				)}

				<AssetPickerDialog
					open={isPickerOpen}
					onClose={() => setIsPickerOpen(false)}
					onSelect={(path) => onUpdate({ sound: path })}
					initialFolder={folder}
				/>
			</div>
		);
	}
);
