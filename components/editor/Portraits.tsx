import { useState } from 'react';
import { CharacterPortrait } from '@/types/resource';
import { cn } from '@/lib';

interface PortraitsProps {
	portraits: CharacterPortrait[];
	onAdd: () => void;
	onUpdate: (index: number, updates: Partial<CharacterPortrait>) => void;
	onRemove: (index: number) => void;
}

export function Portraits({
	portraits,
	onAdd,
	onUpdate,
	onRemove,
}: PortraitsProps) {
	const [isExpanded, setIsExpanded] = useState(true);

	const isPidDuplicate = (pid: number, currentIndex: number) => {
		return portraits.some((p, i) => i !== currentIndex && p.pid === pid);
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
						立绘配置 (Portraits){' '}
						{portraits?.length ? `(${portraits.length})` : ''}
					</label>
				</div>
				<button
					onClick={onAdd}
					className="rounded-lg border border-white/10 bg-white/10 px-3 py-1 text-xs transition-all hover:bg-white/20 active:scale-95"
				>
					添加立绘
				</button>
			</div>
			{isExpanded && (
				<div className="animate-in fade-in slide-in-from-top-2 grid grid-cols-1 gap-3 duration-200">
					{portraits?.map((portrait, i) => {
						const duplicatePid = isPidDuplicate(portrait.pid, i);
						return (
							<div
								key={i}
								className={cn(
									'flex items-end gap-3 rounded-xl border bg-black/10 p-4 transition-all',
									duplicatePid
										? 'border-danger/50 bg-danger/5'
										: 'border-white/5'
								)}
							>
								<div className="flex w-20 flex-col gap-1">
									<div className="ml-1 flex items-center justify-between">
										<label className="text-[10px] font-bold opacity-50">
											PID
										</label>
										{duplicatePid && (
											<span className="text-[8px] font-bold text-danger">
												重复
											</span>
										)}
									</div>
									<input
										type="number"
										value={portrait.pid}
										onChange={(e) =>
											onUpdate(i, {
												pid:
													parseInt(e.target.value) ||
													0,
											})
										}
										className={cn(
											'rounded-lg border bg-black/20 p-2 text-sm transition-all focus:outline-none focus:ring-1',
											duplicatePid
												? 'border-danger focus:ring-danger/50'
												: 'border-white/10 focus:ring-primary/50'
										)}
									/>
								</div>
								<div className="flex flex-1 flex-col gap-1">
									<label className="ml-1 text-[10px] font-bold opacity-50">
										图片路径
									</label>
									<input
										type="text"
										value={portrait.path}
										onChange={(e) =>
											onUpdate(i, {
												path: e.target.value,
											})
										}
										className="rounded-lg border border-white/10 bg-black/20 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
									/>
								</div>
								<button
									onClick={() => onRemove(i)}
									className="flex h-9 w-9 items-center justify-center rounded-lg border border-danger/20 bg-danger/10 p-2 text-danger transition-all hover:bg-danger/20 active:scale-90"
									title="删除立绘"
								>
									×
								</button>
							</div>
						);
					})}
					{(!portraits || portraits.length === 0) && (
						<div className="rounded-xl border-2 border-dashed border-white/5 py-4 text-center text-sm opacity-30">
							暂无立绘配置
						</div>
					)}
				</div>
			)}
		</div>
	);
}
