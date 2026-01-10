import { memo, useCallback, useId, useMemo } from 'react';

import { useData } from '@/components/DataContext';

import { SPECIAL_GUESTS } from '@/data/specialGuest';
import { SPECIAL_PORTRAITS } from '@/data/specialPortraits';
import { cn } from '@/lib';
import type {
	Character,
	CharacterType,
	Dialog,
	DialogPackage,
} from '@/types/resource';

interface CharacterSelectorProps {
	characterType: CharacterType;
	customCharacters: Character[];
	value: number;
	onChange: (id: number, type: CharacterType) => void;
}

const CharacterSelector = memo<CharacterSelectorProps>(
	function CharacterSelector({
		characterType,
		customCharacters,
		value,
		onChange,
	}: CharacterSelectorProps) {
		const id = useId();

		return (
			<div className="flex flex-col gap-1">
				<label
					htmlFor={id}
					className="text-xs font-medium uppercase opacity-60"
				>
					角色
				</label>
				<select
					id={id}
					value={`${characterType}:${value}`}
					onChange={(e) => {
						const [type, id] = e.target.value.split(':');
						if (type && id) {
							onChange(parseInt(id), type as CharacterType);
						}
					}}
					className="h-9 w-full rounded-lg border border-black/10 bg-white/40 px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-black/30 focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-black/10 dark:focus:border-white/10 dark:focus:ring-white/10"
				>
					<optgroup label="游戏角色" className="text-black">
						{SPECIAL_GUESTS.map(({ id, name }) => (
							<option
								key={`Special:${id}`}
								value={`Special:${id}`}
								className="text-black"
							>
								({id}) {name}
							</option>
						))}
					</optgroup>
					{customCharacters.length > 0 && (
						<optgroup label="自定义角色" className="text-black">
							{customCharacters.map(({ id, name, type }) => (
								<option
									key={`${type}:${id}`}
									value={`${type}:${id}`}
									className="text-black"
								>
									({id}) {name} [{type}]
								</option>
							))}
						</optgroup>
					)}
				</select>
			</div>
		);
	}
);

interface PortraitSelectorProps {
	characterId: number;
	characterType: CharacterType;
	value: number;
	onChange: (pid: number) => void;
	customCharacters: Character[];
}

const PortraitSelector = memo<PortraitSelectorProps>(function PortraitSelector({
	characterId,
	characterType,
	customCharacters,
	value,
	onChange,
}) {
	const id = useId();

	const portraits = useMemo(() => {
		const customChar = customCharacters.find(
			({ id, type }) => id === characterId && type === characterType
		);

		if (customChar) {
			return (customChar.portraits ?? []).map(({ label, pid }) => ({
				pid,
				name: label || `立绘${pid}`,
			}));
		}
		if (characterType === 'Special') {
			return SPECIAL_PORTRAITS.filter(
				(p) => p.characterId === characterId
			).map(({ name, pid }) => ({ name, pid }));
		}

		return [];
	}, [characterId, characterType, customCharacters]);

	return (
		<div className="flex flex-col gap-1">
			<label
				htmlFor={id}
				className="text-xs font-medium uppercase opacity-60"
			>
				表情/立绘
			</label>
			<select
				id={id}
				value={value}
				onChange={(e) => {
					onChange(parseInt(e.target.value));
				}}
				className="h-9 w-full rounded-lg border border-black/10 bg-white/40 px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-black/30 focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-black/10 dark:focus:border-white/10 dark:focus:ring-white/10"
			>
				{portraits.length > 0 ? (
					portraits.map(({ name, pid }, index) => (
						<option key={index} value={pid} className="text-black">
							({pid}) {name}
						</option>
					))
				) : (
					<option value={0} className="text-black">
						无可用立绘
					</option>
				)}
			</select>
		</div>
	);
});

interface DialogItemProps {
	dialog: Dialog;
	index: number;
	onUpdate: (updates: Partial<Dialog>) => void;
	onRemove: () => void;
	customCharacters: Character[];
}

const DialogItem = memo<DialogItemProps>(function DialogItem({
	customCharacters,
	dialog,
	index,
	onRemove,
	onUpdate,
}) {
	const idPos = useId();
	const idText = useId();
	const idType = useId();
	const { getAssetUrl } = useData();

	const portraitPath = useMemo(() => {
		if (dialog.characterType === 'Special') {
			const specialPortrait = SPECIAL_PORTRAITS.find(
				({ characterId, pid }) =>
					characterId === dialog.characterId && pid === dialog.pid
			);
			if (specialPortrait?.filename) {
				return `/assets/SpecialPortrait/${specialPortrait.filename}`;
			} else {
				const customChar = customCharacters.find(
					({ id, type }) =>
						id === dialog.characterId &&
						type === dialog.characterType
				);
				if (customChar) {
					const portrait = customChar.portraits?.find(
						({ pid }) => pid === dialog.pid
					);
					if (portrait) {
						return (
							getAssetUrl(portrait.path) ?? `/${portrait.path}`
						);
					}
				}
			}
		}

		return null;
	}, [
		dialog.characterId,
		dialog.characterType,
		dialog.pid,
		customCharacters,
		getAssetUrl,
	]);

	const { charName, portraitName } = useMemo(() => {
		let charName = '未知角色';
		let portraitName = '未知立绘';

		if (dialog.characterType === 'Special') {
			const guest = SPECIAL_GUESTS.find(
				({ id }) => id === dialog.characterId
			);
			if (guest) {
				charName = guest.name;
			}

			const portrait = SPECIAL_PORTRAITS.find(
				({ characterId, pid }) =>
					characterId === dialog.characterId && pid === dialog.pid
			);
			if (portrait) {
				portraitName = portrait.name;
			}
		} else {
			const customChar = customCharacters.find(
				({ id, type }) =>
					id === dialog.characterId && type === dialog.characterType
			);
			if (customChar) {
				charName = customChar.name;
				const portrait = customChar.portraits?.find(
					({ pid }) => pid === dialog.pid
				);
				if (portrait) {
					portraitName = portrait.label || `立绘 ${portrait.pid}`;
				}
			}
		}

		return { charName, portraitName };
	}, [
		customCharacters,
		dialog.characterId,
		dialog.characterType,
		dialog.pid,
	]);

	return (
		<div className="flex flex-col gap-4 rounded-lg bg-white/40 p-4 shadow-sm dark:bg-white/5">
			<div className="flex items-center justify-between border-b border-black/5 pb-2 dark:border-white/5">
				<span className="text-xs font-bold uppercase tracking-wider opacity-60">
					对话条目#{index + 1}
				</span>
				<button
					onClick={onRemove}
					className="btn-mystia-danger px-3 py-1 text-xs"
				>
					删除此条
				</button>
			</div>
			<div className="flex flex-col gap-6 md:flex-row">
				<div className="w-full shrink-0 md:w-56">
					{portraitPath ? (
						<div className="group flex flex-col gap-2">
							<div className="bg-checkerboard relative h-80 w-full overflow-hidden rounded-lg border border-black/10 shadow-inner">
								<img
									draggable="false"
									src={portraitPath}
									className="image-rendering-pixelated h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
									onError={(e) => {
										const { currentTarget: target } = e;
										target.style.display = 'none';
										const errorDiv =
											target.nextElementSibling as HTMLElement;
										if (errorDiv) {
											errorDiv.style.display = 'flex';
										}
									}}
								/>
								<div className="hidden h-full w-full flex-col items-center justify-center gap-2 bg-danger bg-opacity-10 p-4 text-center">
									<span className="text-2xl">⚠️</span>
									<span className="text-xs font-medium">
										图片加载失败
									</span>
								</div>
							</div>
							<div className="rounded-lg bg-black/5 px-2 py-1 text-center dark:bg-white/5">
								<div className="text-[10px] font-medium opacity-60">
									({dialog.characterId}){charName}
									&nbsp;&nbsp; ({dialog.pid}){portraitName}
								</div>
							</div>
						</div>
					) : (
						<div className="flex h-80 w-full flex-col items-center justify-center gap-2 rounded-lg border-dashed border-black/10 bg-white/60 text-black/40 dark:border-white/10 dark:bg-white/5 dark:text-white/40">
							<span className="text-2xl opacity-20">🖼️</span>
							<span className="text-xs font-medium">
								无立绘预览
							</span>
						</div>
					)}
				</div>
				<div className="flex flex-1 flex-col justify-between gap-4">
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<CharacterSelector
							characterType={dialog.characterType}
							customCharacters={customCharacters}
							value={dialog.characterId}
							onChange={(id, type) => {
								onUpdate({
									characterId: id,
									characterType: type,
								});
							}}
						/>
						<PortraitSelector
							characterId={dialog.characterId}
							characterType={dialog.characterType}
							customCharacters={customCharacters}
							value={dialog.pid}
							onChange={(pid) => {
								onUpdate({ pid });
							}}
						/>
						<div className="flex flex-col gap-1">
							<label
								htmlFor={idPos}
								className="text-xs font-medium uppercase opacity-60"
							>
								显示位置
							</label>
							<select
								id={idPos}
								value={dialog.position}
								onChange={(e) => {
									onUpdate({
										position: e.target
											.value as Dialog['position'],
									});
								}}
								className="h-9 w-full rounded-lg border border-black/10 bg-white/40 px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-black/30 focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-black/10 dark:focus:border-white/10 dark:focus:ring-white/10"
							>
								<option value="Left" className="text-black">
									左侧 (Left)
								</option>
								<option value="Right" className="text-black">
									右侧 (Right)
								</option>
							</select>
						</div>

						<div className="flex flex-col gap-1">
							<label
								htmlFor={idType}
								className="text-xs font-medium uppercase opacity-60"
							>
								角色类型
							</label>
							<input
								disabled
								id={idType}
								type="text"
								value={dialog.characterType}
								className="h-9 w-full cursor-not-allowed rounded-lg border border-black/10 bg-white/40 px-3 py-2 text-sm text-foreground outline-none disabled:opacity-50 dark:border-white/10 dark:bg-black/10"
							/>
						</div>
					</div>

					<div className="flex flex-1 flex-col gap-1">
						<label
							htmlFor={idText}
							className="text-xs font-medium uppercase opacity-60"
						>
							对话内容
						</label>
						<textarea
							id={idText}
							placeholder="在此输入对话文本..."
							value={dialog.text}
							onChange={(e) => {
								onUpdate({ text: e.target.value });
							}}
							className="min-h-40 w-full flex-1 rounded-lg border border-black/10 bg-white/40 px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-black/30 focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-black/10 dark:focus:border-white/10 dark:focus:ring-white/10"
						/>
					</div>
				</div>
			</div>
		</div>
	);
});

const DialogItemWrapper = memo<Omit<DialogItemProps, 'customCharacters'>>(
	function DialogItemWrapper({ dialog, index, onRemove, onUpdate }) {
		const { data } = useData();

		return (
			<DialogItem
				customCharacters={data.characters}
				dialog={dialog}
				index={index}
				onRemove={onRemove}
				onUpdate={onUpdate}
			/>
		);
	}
);

interface DialogEditorProps {
	allPackages: DialogPackage[];
	dialogPackage: DialogPackage | null;
	packageIndex: number | null;
	onAddDialog: (insertIndex?: number) => void;
	onRemoveDialog: (index: number) => void;
	onUpdate: (updates: Partial<DialogPackage>) => void;
	onUpdateDialog: (index: number, updates: Partial<Dialog>) => void;
}

export const DialogEditor = memo<DialogEditorProps>(function DialogEditor({
	allPackages,
	dialogPackage,
	packageIndex,
	onAddDialog,
	onRemoveDialog,
	onUpdate,
	onUpdateDialog,
}) {
	const id = useId();

	const isNameDuplicate = useCallback(
		(name: string, index: number | null) => {
			return allPackages.some(
				(p, i) => i !== index && p.name === name && name.length > 0
			);
		},
		[allPackages]
	);

	if (!dialogPackage) {
		return (
			<div className="flex flex-col items-center justify-center rounded-lg bg-white/10 p-4 shadow-md backdrop-blur lg:col-span-2">
				<div className="flex items-center justify-center text-center font-semibold italic opacity-30">
					请在左侧选择一个对话包进行编辑，或点击 + 按钮创建新对话包
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-8 overflow-y-auto rounded-lg bg-white/10 p-4 shadow-md backdrop-blur lg:col-span-2">
			<div className="flex flex-col gap-2">
				<div className="flex items-center justify-between">
					<label
						htmlFor={id}
						className="block w-full text-sm font-medium opacity-80"
					>
						对话包名称
					</label>
					{isNameDuplicate(dialogPackage.name, packageIndex) && (
						<span className="rounded bg-danger px-1.5 py-0.5 text-[10px] font-medium text-white">
							命名重复
						</span>
					)}
				</div>
				<input
					id={id}
					type="text"
					value={dialogPackage.name}
					onChange={(e) => {
						onUpdate({ name: e.target.value });
					}}
					className={cn(
						'w-full rounded-lg border bg-white/40 px-3 py-2 text-sm text-foreground outline-none focus:border-black/30 focus:ring-2 focus:ring-black/10 dark:bg-black/10 dark:focus:border-white/30 dark:focus:ring-white/10',
						isNameDuplicate(dialogPackage.name, packageIndex)
							? 'border-danger bg-danger text-white opacity-50 focus:border-danger'
							: 'border-black/10 dark:border-white/10'
					)}
				/>
			</div>
			<div className="flex items-center justify-between">
				<span className="block w-full text-sm font-medium opacity-80">
					对话列表（{dialogPackage.dialogList.length}）
				</span>
				<button
					onClick={() => {
						onAddDialog();
					}}
					className="btn-mystia-primary whitespace-nowrap px-3 py-1 text-sm"
				>
					添加对话
				</button>
			</div>
			<div className="flex flex-col gap-2">
				{/* 在列表首位添加插入按钮 */}
				{dialogPackage.dialogList.length > 0 && (
					<button
						onClick={() => {
							onAddDialog(0);
						}}
						className="btn-mystia w-full rounded-lg border border-dashed border-black/10 text-xs hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
					>
						在顶部插入对话
					</button>
				)}
				{dialogPackage.dialogList.map((dialog, index) => (
					<div key={index} className="flex flex-col gap-2">
						<DialogItemWrapper
							dialog={dialog}
							index={index}
							onRemove={() => {
								onRemoveDialog(index);
							}}
							onUpdate={(updates) =>
								onUpdateDialog(index, updates)
							}
						/>
						<button
							onClick={() => {
								onAddDialog(index + 1);
							}}
							className="btn-mystia w-full rounded-lg border border-dashed border-black/10 text-xs hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
						>
							在此处插入对话
						</button>
					</div>
				))}
				{dialogPackage.dialogList.length === 0 && (
					<div className="rounded-lg border border-dashed border-black/10 p-8 text-center dark:border-white/10">
						<p className="text-sm text-black/40 dark:text-white/40">
							暂无对话
						</p>
						<p className="mt-1 text-xs text-black/30 dark:text-white/30">
							点击上方按钮添加
						</p>
					</div>
				)}
			</div>
		</div>
	);
});
