import { memo, useCallback } from 'react';

import { cn } from '@/lib';
import { ErrorBadge } from '@/components/ErrorBadge';
import type { Beverage } from '@/types/resource';

interface BeverageListProps {
	beverages: Beverage[];
	selectedIndex: number | null;
	onSelect: (index: number) => void;
	onAdd: () => void;
	onRemove: (index: number) => void;
}

export const BeverageList = memo<BeverageListProps>(function BeverageList({
	beverages,
	selectedIndex,
	onSelect,
	onAdd,
	onRemove,
}) {
	const isIdDuplicate = useCallback(
		(id: number, index: number) => {
			return beverages.some((bev, i) => i !== index && bev.id === id);
		},
		[beverages]
	);

	return (
		<div className="flex h-min flex-col gap-4 overflow-y-auto rounded-lg bg-white/10 p-4 shadow-md backdrop-blur lg:sticky lg:top-24">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold">酒水列表</h2>
				<button
					onClick={onAdd}
					className="btn-mystia h-8 w-8 text-lg hover:bg-black/5 dark:hover:bg-white/5"
				>
					+
				</button>
			</div>
			<div className="flex flex-col gap-2">
				{beverages.map((bev, index) => {
					const isDuplicate = isIdDuplicate(bev.id, index);
					return (
						<div
							key={index}
							className={cn(
								'btn-mystia-primary group border p-4',
								selectedIndex === index
									? isDuplicate
										? 'border-danger bg-danger/20 shadow-inner'
										: 'border-primary bg-primary/20 shadow-inner'
									: isDuplicate
										? 'border-danger/50 bg-danger/10 hover:bg-danger/20'
										: 'border-transparent bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10'
							)}
						>
							<div className="flex w-full items-start justify-between gap-2">
								<button
									onClick={() => {
										onSelect(index);
									}}
									className="flex flex-1 flex-col gap-2 text-left"
								>
									<div className="flex items-center gap-2">
										<span className="text-lg font-bold text-foreground">
											{bev.name}
										</span>
										{isDuplicate && (
											<ErrorBadge>ID重复</ErrorBadge>
										)}
									</div>
									<div className="font-mono text-xs text-foreground opacity-80">
										ID: {bev.id} | 等级: {bev.level}
									</div>
								</button>
								<button
									onClick={(e) => {
										e.stopPropagation();
										if (confirm('确定要删除这个酒水吗？')) {
											onRemove(index);
										}
									}}
									className="btn-mystia-danger pointer-events-none rounded-full px-3 py-1 text-sm opacity-0 group-hover:pointer-events-auto group-hover:opacity-100"
								>
									删除
								</button>
							</div>
						</div>
					);
				})}
				{beverages.length === 0 && (
					<div className="rounded-lg border border-dashed border-black/10 p-8 text-center dark:border-white/10">
						<p className="text-sm text-black/40 dark:text-white/40">
							暂无酒水
						</p>
						<p className="mt-1 text-xs text-black/30 dark:text-white/30">
							点击上方 + 按钮创建
						</p>
					</div>
				)}
			</div>
		</div>
	);
});
