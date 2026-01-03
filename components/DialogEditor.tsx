import { useMemo } from 'react';
import type {
	Dialog,
	DialogPackage,
	Character,
	CharacterType,
} from '@/types/resource';
import { SPECIAL_GUESTS } from '@/data/specialGuest';
import { SPECIAL_PORTRAITS } from '@/data/specialPortraits';
import { useData } from '@/components/DataContext';
import { cn } from '@/lib';

interface DialogEditorProps {
	dialogPackage: DialogPackage | null;
	allPackages: DialogPackage[];
	packageIndex: number | null;
	onUpdate: (updates: Partial<DialogPackage>) => void;
	onRemoveDialog: (index: number) => void;
	onAddDialog: (insertIndex?: number) => void;
	onUpdateDialog: (index: number, updates: Partial<Dialog>) => void;
}

export function DialogEditor({
	dialogPackage,
	allPackages,
	packageIndex,
	onUpdate,
	onRemoveDialog,
	onAddDialog,
	onUpdateDialog,
}: DialogEditorProps) {
	if (!dialogPackage) {
		return (
			<div className="col-span-2 flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-12">
				<div className="text-center text-black/40">
					<p className="text-sm">请在左侧选择或创建对话包</p>
				</div>
			</div>
		);
	}

	return (
		<div className="col-span-2 space-y-6">
			<div className="rounded-2xl border border-white/10 bg-white/5 p-6">
				<div className="mb-4">
					<div className="mb-2 flex items-center justify-between">
						<label className="block text-sm font-medium text-black/70">
							对话包名称
						</label>
						{(() => {
							const isDuplicate =
								allPackages.some(
									(pkg, idx) =>
										idx !== packageIndex &&
										pkg.name === dialogPackage.name
								) && dialogPackage.name.length > 0;
							return isDuplicate ? (
								<span className="text-[10px] font-bold text-red-500">
									⚠️ 名字冲突
								</span>
							) : null;
						})()}
					</div>
					<input
						type="text"
						value={dialogPackage.name}
						onChange={(e) => onUpdate({ name: e.target.value })}
						className={cn(
							'w-full rounded-lg border bg-white/50 px-3 py-2 text-sm text-black outline-none focus:border-black/30 focus:ring-2 focus:ring-black/10',
							allPackages.some(
								(pkg, idx) =>
									idx !== packageIndex &&
									pkg.name === dialogPackage.name
							) && dialogPackage.name.length > 0
								? 'border-red-300 bg-red-50'
								: 'border-black/10'
						)}
					/>
				</div>

				<div className="mb-4 flex items-center justify-between">
					<h3 className="text-sm font-medium text-black/70">
						对话列表 ({dialogPackage.dialogList.length})
					</h3>
					<button
						onClick={() => onAddDialog()}
						className="rounded-lg bg-black/10 px-3 py-1.5 text-sm font-medium text-black transition-all hover:bg-black/20 active:scale-95"
					>
						+ 添加对话
					</button>
				</div>

				<div className="space-y-2">
					{/* 在列表首位添加插入按钮 */}
					{dialogPackage.dialogList.length > 0 && (
						<button
							onClick={() => onAddDialog(0)}
							className="w-full rounded-lg border-2 border-dashed border-black/20 py-2 text-xs font-medium text-black/40 transition-all hover:border-black/40 hover:bg-black/5"
						>
							↓ 在顶部插入对话
						</button>
					)}

					{dialogPackage.dialogList.map((dialog, index) => (
						<div key={index} className="space-y-2">
							<DialogItemWrapper
								dialog={dialog}
								index={index}
								onUpdate={(updates) =>
									onUpdateDialog(index, updates)
								}
								onRemove={() => onRemoveDialog(index)}
							/>
							{/* 在每个对话下方添加插入按钮 */}
							<button
								onClick={() => onAddDialog(index + 1)}
								className="w-full rounded-lg border-2 border-dashed border-black/20 py-2 text-xs font-medium text-black/40 transition-all hover:border-black/40 hover:bg-black/5"
							>
								↓ 在此处插入对话
							</button>
						</div>
					))}
					{dialogPackage.dialogList.length === 0 && (
						<div className="rounded-lg border border-dashed border-black/10 p-8 text-center text-sm text-black/40">
							暂无对话，点击上方按钮添加
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

interface DialogItemProps {
	dialog: Dialog;
	index: number;
	onUpdate: (updates: Partial<Dialog>) => void;
	onRemove: () => void;
	customCharacters: Character[];
}

function DialogItemWrapper({
	dialog,
	index,
	onUpdate,
	onRemove,
}: Omit<DialogItemProps, 'customCharacters'>) {
	const { data } = useData();
	return (
		<DialogItem
			dialog={dialog}
			index={index}
			onUpdate={onUpdate}
			onRemove={onRemove}
			customCharacters={data.characters}
		/>
	);
}

function DialogItem({
	dialog,
	index,
	onUpdate,
	onRemove,
	customCharacters,
}: DialogItemProps) {
	// 获取立绘图片路径
	const getPortraitImagePath = (): string | null => {
		// 仅对 Special 类型的游戏内置角色加载图片
		// 自定义角色不从服务端请求立绘图片
		if (dialog.characterType === 'Special') {
			const specialPortrait = SPECIAL_PORTRAITS.find(
				(p) =>
					p.characterId === dialog.characterId && p.pid === dialog.pid
			);
			if (specialPortrait?.filename) {
				return `/assets/SpecialPortrait/${specialPortrait.filename}`;
			}
		}

		return null;
	};

	const portraitPath = getPortraitImagePath();

	// 获取角色和立绘名称用于显示
	const getPortraitInfo = () => {
		let charName = '未知角色';
		let portraitName = '未知立绘';

		if (dialog.characterType === 'Special') {
			const guest = SPECIAL_GUESTS.find(
				(g) => g.id === dialog.characterId
			);
			if (guest) charName = guest.name;

			const portrait = SPECIAL_PORTRAITS.find(
				(p) =>
					p.characterId === dialog.characterId && p.pid === dialog.pid
			);
			if (portrait) portraitName = portrait.name;
		} else {
			const customChar = customCharacters.find(
				(c) =>
					c.id === dialog.characterId &&
					c.type === dialog.characterType
			);
			if (customChar) {
				charName = customChar.name;
				const portrait = customChar.portraits?.find(
					(p) => p.pid === dialog.pid
				);
				if (portrait)
					portraitName = portrait.label || `立绘 ${portrait.pid}`;
			}
		}

		return { charName, portraitName };
	};

	const { charName, portraitName } = getPortraitInfo();

	return (
		<div className="rounded-xl border border-black/10 bg-white/40 p-5 shadow-sm transition-all hover:bg-white/50">
			<div className="mb-4 flex items-center justify-between border-b border-black/5 pb-2">
				<span className="text-xs font-bold uppercase tracking-wider text-black/40">
					对话条目 #{index + 1}
				</span>
				<button
					onClick={onRemove}
					className="rounded-lg px-3 py-1 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 active:scale-95"
				>
					删除此条
				</button>
			</div>

			<div className="flex flex-col gap-6 md:flex-row">
				{/* 立绘预览区域 - 显著放大 */}
				<div className="w-full flex-shrink-0 md:w-56">
					{portraitPath ? (
						<div className="group relative space-y-2">
							<div
								className="relative h-80 w-full overflow-hidden rounded-xl border border-black/10 shadow-inner"
								style={{
									backgroundImage: `conic-gradient(#f0f0f0 90deg, #e5e5e5 90deg 180deg, #f0f0f0 180deg 270deg, #e5e5e5 270deg)`,
									backgroundSize: '20px 20px',
								}}
							>
								<img
									src={portraitPath}
									alt="角色立绘"
									className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
									onError={(e) => {
										const target = e.currentTarget;
										target.style.display = 'none';
										const errorDiv =
											target.nextElementSibling as HTMLElement;
										if (errorDiv)
											errorDiv.style.display = 'flex';
									}}
								/>
								<div
									className="hidden h-full w-full flex-col items-center justify-center bg-red-50 p-4 text-center"
									style={{ display: 'none' }}
								>
									<span className="mb-1 text-2xl">⚠️</span>
									<span className="text-xs font-medium text-red-600">
										图片加载失败
									</span>
								</div>
							</div>
							<div className="rounded bg-black/5 px-2 py-1 text-center">
								<div className="text-[10px] font-medium text-black/60">
									({dialog.characterId}){charName}
									&nbsp;&nbsp; ({dialog.pid}){portraitName}
								</div>
							</div>
						</div>
					) : (
						<div className="flex h-80 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-black/10 bg-black/5 text-black/30">
							<span className="mb-2 text-2xl opacity-20">🖼️</span>
							<span className="text-xs font-medium">
								无立绘预览
							</span>
						</div>
					)}
				</div>

				{/* 表单区域 - 自动填充剩余空间 */}
				<div className="flex flex-1 flex-col justify-between space-y-4">
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<CharacterSelector
							value={dialog.characterId}
							characterType={dialog.characterType}
							onChange={(id, type) =>
								onUpdate({
									characterId: id,
									characterType: type,
								})
							}
							customCharacters={customCharacters}
						/>

						<PortraitSelector
							characterId={dialog.characterId}
							characterType={dialog.characterType}
							value={dialog.pid}
							onChange={(pid) => onUpdate({ pid })}
							customCharacters={customCharacters}
						/>

						<div className="space-y-1">
							<label className="text-[11px] font-bold uppercase tracking-tight text-black/50">
								显示位置
							</label>
							<select
								value={dialog.position}
								onChange={(e) =>
									onUpdate({
										position: e.target.value as
											| 'Left'
											| 'Right',
									})
								}
								className="w-full rounded-lg border border-black/10 bg-white/60 px-3 py-2 text-sm text-black outline-none transition-all focus:border-black/30 focus:bg-white"
							>
								<option value="Left">左侧 (Left)</option>
								<option value="Right">右侧 (Right)</option>
							</select>
						</div>

						<div className="space-y-1">
							<label className="text-[11px] font-bold uppercase tracking-tight text-black/50">
								角色类型
							</label>
							<input
								type="text"
								value={dialog.characterType}
								disabled
								className="w-full cursor-not-allowed rounded-lg border border-black/5 bg-black/5 px-3 py-2 text-sm text-black/40 outline-none"
							/>
						</div>
					</div>

					<div className="flex flex-1 flex-col space-y-1">
						<label className="text-[11px] font-bold uppercase tracking-tight text-black/50">
							对话内容
						</label>
						<textarea
							value={dialog.text}
							onChange={(e) => onUpdate({ text: e.target.value })}
							className="min-h-[160px] w-full flex-1 rounded-lg border border-black/10 bg-white/60 px-3 py-2 text-sm text-black outline-none transition-all focus:border-black/30 focus:bg-white focus:ring-2 focus:ring-black/5"
							placeholder="在此输入对话文本..."
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

interface CharacterSelectorProps {
	value: number;
	characterType: CharacterType;
	onChange: (id: number, type: CharacterType) => void;
	customCharacters: Character[];
}

function CharacterSelector({
	value,
	characterType,
	onChange,
	customCharacters,
}: CharacterSelectorProps) {
	// 将选择器的值编码为 "type:id" 格式
	const encodedValue = `${characterType}:${value}`;

	return (
		<div>
			<label className="mb-1 block text-xs font-medium text-black/70">
				角色
			</label>
			<select
				value={encodedValue}
				onChange={(e) => {
					const [type, id] = e.target.value.split(':');
					if (type && id) {
						onChange(parseInt(id), type as CharacterType);
					}
				}}
				className="w-full rounded border border-black/10 bg-white/50 px-2 py-1.5 text-sm text-black outline-none focus:border-black/30"
			>
				<optgroup label="游戏角色">
					{SPECIAL_GUESTS.map((guest) => (
						<option
							key={`Special:${guest.id}`}
							value={`Special:${guest.id}`}
						>
							({guest.id}) {guest.name}
						</option>
					))}
				</optgroup>
				{customCharacters.length > 0 && (
					<optgroup label="自定义角色">
						{customCharacters.map((char) => (
							<option
								key={`${char.type}:${char.id}`}
								value={`${char.type}:${char.id}`}
							>
								({char.id}) {char.name} [{char.type}]
							</option>
						))}
					</optgroup>
				)}
			</select>
		</div>
	);
}

interface PortraitSelectorProps {
	characterId: number;
	characterType: CharacterType;
	value: number;
	onChange: (pid: number) => void;
	customCharacters: Character[];
}

function PortraitSelector({
	characterId,
	characterType,
	value,
	onChange,
	customCharacters,
}: PortraitSelectorProps) {
	// 根据角色类型获取立绘列表
	const portraits = useMemo(() => {
		// 优先从自定义角色中查找（匹配 ID 和类型）
		const customChar = customCharacters.find(
			(c) => c.id === characterId && c.type === characterType
		);

		if (customChar) {
			return (customChar.portraits || []).map((p) => ({
				pid: p.pid,
				name: p.label || `立绘 ${p.pid}`,
			}));
		}

		// 如果没找到自定义角色，且类型是 Special，则查找内置游戏立绘
		if (characterType === 'Special') {
			return SPECIAL_PORTRAITS.filter(
				(p) => p.characterId === characterId
			).map((p) => ({ pid: p.pid, name: p.name }));
		}

		return [];
	}, [characterId, characterType, customCharacters]);

	return (
		<div>
			<label className="mb-1 block text-xs font-medium text-black/70">
				表情/立绘
			</label>
			<select
				value={value}
				onChange={(e) => onChange(parseInt(e.target.value))}
				className="w-full rounded border border-black/10 bg-white/50 px-2 py-1.5 text-sm text-black outline-none focus:border-black/30"
			>
				{portraits.length > 0 ? (
					portraits.map((portrait) => (
						<option key={portrait.pid} value={portrait.pid}>
							({portrait.pid}) {portrait.name}
						</option>
					))
				) : (
					<option value={0}>无可用立绘</option>
				)}
			</select>
		</div>
	);
}
