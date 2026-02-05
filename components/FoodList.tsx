import { memo, useCallback } from 'react';

import { cn } from '@/lib';
import { ErrorBadge } from '@/components/ErrorBadge';
import type { Food } from '@/types/resource';

interface FoodListProps {
	foods: Food[];
	selectedIndex: number | null;
	onSelect: (index: number) => void;
	onAdd: () => void;
	onRemove: (index: number) => void;
}

export const FoodList = memo<FoodListProps>(function FoodList({
	foods,
	selectedIndex,
	onSelect,
	onAdd,
	onRemove,
}) {
	const isIdDuplicate = useCallback(
		(id: number, index: number) => {
			return foods.some((food, i) => i !== index && food.id === id);
		},
		[foods]
	);

	return (
		<div className="flex h-min flex-col gap-4 overflow-y-auto rounded-lg bg-white/10 p-4 shadow-md backdrop-blur lg:sticky lg:top-24">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold">料理列表</h2>
				<button
					onClick={onAdd}
					className="btn-mystia h-8 w-8 text-lg hover:bg-black/5 dark:hover:bg-white/5"
				>
					+
				</button>
			</div>
			<div className="flex flex-col gap-2">
				{foods.map((food, index) => {
					const isDuplicate = isIdDuplicate(food.id, index);
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
											{food.name}
										</span>
										{isDuplicate && (
											<ErrorBadge>ID重复</ErrorBadge>
										)}
									</div>
									<div className="font-mono text-xs text-foreground opacity-80">
										ID: {food.id} | 等级: {food.level}
									</div>
								</button>
								<button
									onClick={(e) => {
										e.stopPropagation();
										if (confirm('确定要删除这个料理吗？')) {
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
				{foods.length === 0 && (
					<div className="rounded-lg border border-dashed border-black/10 p-8 text-center dark:border-white/10">
						<p className="text-sm text-black/40 dark:text-white/40">
							暂无料理
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
