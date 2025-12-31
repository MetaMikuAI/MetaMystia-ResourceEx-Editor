import { Character } from '@/types/resource';
import { cn } from '@/lib';

interface CharacterListProps {
	characters: Character[];
	selectedIndex: number | null;
	onSelect: (index: number) => void;
	onAdd: () => void;
}

export function CharacterList({
	characters,
	selectedIndex,
	onSelect,
	onAdd,
}: CharacterListProps) {
	const isIdDuplicate = (id: number, currentIndex: number) => {
		return characters.some((c, i) => i !== currentIndex && c.id === id);
	};

	return (
		<div className="h-[70vh] overflow-y-auto rounded-2xl border border-white/20 bg-white/10 p-4 shadow-xl backdrop-blur-md">
			<div className="mb-4 flex items-center justify-between px-2">
				<h2 className="text-xl font-semibold">角色列表</h2>
				<button
					onClick={onAdd}
					className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/10 text-lg transition-all hover:bg-white/20 active:scale-90"
				>
					+
				</button>
			</div>
			<div className="flex flex-col gap-2">
				{characters.map((char, index) => {
					const duplicate = isIdDuplicate(char.id, index);
					return (
						<button
							key={index}
							onClick={() => onSelect(index)}
							className={cn(
								'rounded-xl border p-4 text-left transition-all',
								selectedIndex === index
									? duplicate
										? 'border-danger bg-danger/20 shadow-inner'
										: 'border-primary bg-primary/20 shadow-inner'
									: duplicate
										? 'border-danger/50 bg-danger/10 hover:bg-danger/20'
										: 'border-transparent bg-white/5 hover:bg-white/10'
							)}
						>
							<div className="flex items-start justify-between">
								<div className="text-lg font-bold">
									{char.name || '未命名角色'}
								</div>
								{duplicate && (
									<span className="rounded bg-danger px-1.5 py-0.5 text-[10px] font-bold text-white">
										ID 重复
									</span>
								)}
							</div>
							<div className="font-mono text-xs opacity-60">
								ID: {char.id} | {char.type}
							</div>
						</button>
					);
				})}
			</div>
		</div>
	);
}
