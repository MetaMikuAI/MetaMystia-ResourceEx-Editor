import { Character } from '@/types/resource';
import { cn } from '@/lib';

interface BasicInfoProps {
	character: Character;
	isIdDuplicate: boolean;
	onUpdate: (updates: Partial<Character>) => void;
}

export function BasicInfo({
	character,
	isIdDuplicate,
	onUpdate,
}: BasicInfoProps) {
	return (
		<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
			<div className="flex flex-col gap-2">
				<div className="ml-1 flex items-center justify-between">
					<label className="text-sm font-bold opacity-70">
						角色 ID
					</label>
					{isIdDuplicate && (
						<span className="text-[10px] font-bold text-danger">
							ID 已存在
						</span>
					)}
				</div>
				<input
					type="number"
					value={character.id}
					onChange={(e) =>
						onUpdate({ id: parseInt(e.target.value) || 0 })
					}
					className={cn(
						'rounded-xl border bg-black/20 p-3 transition-all focus:outline-none focus:ring-2',
						isIdDuplicate
							? 'border-danger focus:ring-danger/50'
							: 'border-white/10 focus:ring-primary/50'
					)}
				/>
			</div>
			<div className="flex flex-col gap-2">
				<label className="ml-1 text-sm font-bold opacity-70">
					角色类型（固定）
				</label>
				<input
					type="text"
					value="Special (稀客)"
					disabled
					className="cursor-not-allowed rounded-xl border border-white/10 bg-black/10 p-3 text-black/50"
				/>
			</div>
			<div className="flex flex-col gap-2">
				<label className="ml-1 text-sm font-bold opacity-70">
					角色名称
				</label>
				<input
					type="text"
					value={character.name}
					onChange={(e) => onUpdate({ name: e.target.value })}
					className="rounded-xl border border-white/10 bg-black/20 p-3 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
				/>
			</div>
			<div className="flex flex-col gap-2">
				<label className="ml-1 text-sm font-bold opacity-70">
					内部标签 (Label)
				</label>
				<input
					type="text"
					value={character.label}
					onChange={(e) => onUpdate({ label: e.target.value })}
					className="rounded-xl border border-white/10 bg-black/20 p-3 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
				/>
			</div>
		</div>
	);
}
