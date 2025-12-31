import { useState } from 'react';
import { CharacterSpriteSet } from '@/types/resource';
import { cn } from '@/lib';

interface SpriteSetProps {
	spriteSet: CharacterSpriteSet | undefined;
	label: string;
	onUpdate: (updates: Partial<CharacterSpriteSet>) => void;
	onEnable: () => void;
	onDisable: () => void;
	onGenerateDefaults: () => void;
}

export function SpriteSetEditor({
	spriteSet,
	label,
	onUpdate,
	onEnable,
	onDisable,
	onGenerateDefaults,
}: SpriteSetProps) {
	const [isExpanded, setIsExpanded] = useState(false);

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

	return (
		<div className="flex flex-col gap-4">
			<div className="ml-1 flex items-center justify-between">
				<div
					className="flex cursor-pointer select-none items-center gap-2"
					onClick={() => setIsExpanded(!isExpanded)}
				>
					<span
						className={cn(
							'transition-transform duration-200',
							isExpanded && 'rotate-90'
						)}
					>
						▶
					</span>
					<label className="cursor-pointer text-sm font-bold opacity-70">
						角色小人配置 (Sprite Set)
					</label>
				</div>
				<button
					onClick={() => {
						if (spriteSet) {
							onDisable();
						} else {
							onEnable();
						}
					}}
					className={cn(
						'rounded-lg border px-3 py-1 text-xs transition-all active:scale-95',
						spriteSet
							? 'border-danger/20 bg-danger/10 text-danger hover:bg-danger/20'
							: 'border-white/10 bg-white/10 hover:bg-white/20'
					)}
				>
					{spriteSet ? '移除小人配置' : '启用小人配置'}
				</button>
			</div>

			{isExpanded && spriteSet && (
				<div className="animate-in fade-in slide-in-from-top-2 flex flex-col gap-6 rounded-2xl border border-white/5 bg-black/5 p-6 duration-200">
					<div className="flex flex-col gap-2">
						<div className="ml-1 flex items-center justify-between">
							<label className="text-sm font-bold opacity-70">
								小人名称 (Name)
							</label>
							<button
								onClick={onGenerateDefaults}
								className="rounded border border-white/10 bg-white/10 px-2 py-0.5 text-[10px] transition-all hover:bg-white/20 active:scale-95"
							>
								刷新默认填充
							</button>
						</div>
						<input
							type="text"
							value={spriteSet.name}
							onChange={(e) => onUpdate({ name: e.target.value })}
							placeholder="默认为角色 Label"
							className="rounded-xl border border-white/10 bg-black/20 p-3 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
						/>
					</div>

					<div className="flex flex-col gap-4">
						<label className="ml-1 text-sm font-bold opacity-70">
							主身体贴图 (Main Sprites - 12张)
						</label>
						<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
							{spriteSet.mainSprite.map((path, i) => (
								<div
									key={i}
									className="flex items-center gap-2 rounded-lg border border-white/5 bg-black/10 p-2"
								>
									<span className="w-4 text-center text-[10px] opacity-40">
										{i}
									</span>
									<input
										type="text"
										value={path}
										onChange={(e) =>
											updateSpriteArray(
												'mainSprite',
												i,
												e.target.value
											)
										}
										placeholder={`assets/${label}/${label}_Main_...`}
										className="w-full border-none bg-transparent p-0 text-xs focus:ring-0"
									/>
								</div>
							))}
						</div>
					</div>

					<div className="flex flex-col gap-4">
						<label className="ml-1 text-sm font-bold opacity-70">
							眼睛贴图 (Eye Sprites - 24张)
						</label>
						<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
							{spriteSet.eyeSprite.map((path, i) => (
								<div
									key={i}
									className="flex items-center gap-2 rounded-lg border border-white/5 bg-black/10 p-2"
								>
									<span className="w-4 text-center text-[10px] opacity-40">
										{i}
									</span>
									<input
										type="text"
										value={path}
										onChange={(e) =>
											updateSpriteArray(
												'eyeSprite',
												i,
												e.target.value
											)
										}
										placeholder={`assets/${label}/${label}_Eyes_...`}
										className="w-full border-none bg-transparent p-0 text-xs focus:ring-0"
									/>
								</div>
							))}
						</div>
					</div>
				</div>
			)}
			{isExpanded && !spriteSet && (
				<div className="rounded-xl border-2 border-dashed border-white/5 py-8 text-center text-sm opacity-30">
					该角色尚未启用小人配置
				</div>
			)}
		</div>
	);
}
