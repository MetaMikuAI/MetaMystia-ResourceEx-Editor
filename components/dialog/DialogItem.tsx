import { memo, useId, useMemo } from 'react';

import { useData } from '@/components/DataContext';
import { CharacterSelector } from '@/components/dialog/CharacterSelector';
import { PortraitSelector } from '@/components/dialog/PortraitSelector';

import { SPECIAL_GUESTS } from '@/data/specialGuest';
import { SPECIAL_PORTRAITS } from '@/data/specialPortraits';
import type { Character, Dialog } from '@/types/resource';

interface DialogItemProps {
	dialog: Dialog;
	index: number;
	onUpdate: (updates: Partial<Dialog>) => void;
	onRemove: () => void;
	customCharacters: Character[];
}

export const DialogItem = memo<DialogItemProps>(function DialogItem({
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
		<div className="relative flex flex-col gap-4 rounded-lg bg-white/40 p-4 shadow-sm dark:bg-white/5">
			{/* Position indicator stripe */}
			<div
				className={`absolute top-0 h-full w-1 ${
					dialog.position === 'Left'
						? 'left-0 rounded-l-lg bg-blue-500'
						: 'right-0 rounded-r-lg bg-orange-500'
				}`}
				title={`位置: ${dialog.position === 'Left' ? '左侧' : '右侧'}`}
			/>
			<div className="flex items-center justify-between border-b border-black/5 pb-2 dark:border-white/5">
				<div className="flex items-center gap-2">
					<span className="text-xs font-bold uppercase tracking-wider opacity-60">
						对话条目#{index + 1}
					</span>
					<span
						className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
							dialog.position === 'Left'
								? 'bg-blue-500/20 text-blue-700 dark:text-blue-300'
								: 'bg-orange-500/20 text-orange-700 dark:text-orange-300'
						}`}
					>
						{dialog.position === 'Left' ? '← 左侧' : '右侧 →'}
					</span>
				</div>
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
								let newPid = dialog.pid;
								// 检查新角色的立绘列表
								if (type === 'Special') {
									const hasPortrait = SPECIAL_PORTRAITS.some(
										(p) =>
											p.characterId === id &&
											p.pid === newPid
									);
									if (!hasPortrait) {
										// 如果当前pid不可用，尝试获取第一个可用立绘
										const firstPortrait =
											SPECIAL_PORTRAITS.find(
												(p) => p.characterId === id
											);
										newPid = firstPortrait
											? firstPortrait.pid
											: 0;
									}
								} else {
									const customChar = customCharacters.find(
										(c) => c.id === id && c.type === type
									);
									if (customChar) {
										const hasPortrait =
											customChar.portraits?.some(
												(p) => p.pid === newPid
											);
										if (!hasPortrait) {
											// 如果当前pid不可用，尝试获取第一个可用立绘
											newPid =
												customChar.portraits?.[0]
													?.pid ?? 0;
										}
									} else {
										newPid = 0;
									}
								}

								onUpdate({
									characterId: id,
									characterType: type,
									pid: newPid,
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

export const DialogItemWrapper = memo<
	Omit<DialogItemProps, 'customCharacters'>
>(function DialogItemWrapper({ dialog, index, onRemove, onUpdate }) {
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
});
