import { memo, useCallback, useState } from 'react';

import { Button } from '@/design/ui/components';
import { cn } from '@/design/ui/utils';
import { ErrorBadge } from '@/components/common/ErrorBadge';
import { EmptyState } from '@/components/common/EmptyState';
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

	const [isCollapsed, setIsCollapsed] = useState(false);

	return (
		<div className="flex h-min flex-col gap-4 overflow-y-auto rounded-lg bg-white/10 p-4 shadow-md backdrop-blur lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)]">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold">酒水列表</h2>
				<div className="flex items-center gap-1">
					<Button
						isIconOnly
						variant="light"
						size="sm"
						className="h-8 w-8 lg:hidden"
						onPress={() => setIsCollapsed((v) => !v)}
						aria-label={isCollapsed ? '展开列表' : '折叠列表'}
					>
						<svg
							viewBox="0 0 24 24"
							className={cn(
								'h-4 w-4 transition-transform duration-200',
								isCollapsed ? '-rotate-90' : 'rotate-0'
							)}
							fill="none"
							stroke="currentColor"
							strokeWidth={2}
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="m9 18 6-6-6-6" />
						</svg>
					</Button>
					<Button
						isIconOnly
						variant="light"
						size="sm"
						onPress={onAdd}
						className="h-8 w-8 text-lg"
					>
						+
					</Button>
				</div>
			</div>
			<div
				className={cn(
					'grid transition-all duration-300',
					isCollapsed
						? 'grid-rows-[0fr] lg:grid-rows-[1fr]'
						: 'grid-rows-[1fr]'
				)}
				style={{ overflow: isCollapsed ? 'hidden' : undefined }}
			>
				<div className="min-h-0">
					<div className="flex flex-col gap-2">
						{beverages.map((bev, index) => {
							const isDuplicate = isIdDuplicate(bev.id, index);
							return (
								<div
									key={index}
									className={cn(
										'surface-pressable group border p-4',
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
													<ErrorBadge>
														ID重复
													</ErrorBadge>
												)}
											</div>
											<div className="font-mono text-xs text-foreground opacity-80">
												ID: {bev.id} | 等级: {bev.level}
											</div>
										</button>
										<Button
											color="danger"
											size="sm"
											radius="full"
											onPress={() => {
												if (
													confirm(
														'确定要删除这个酒水吗？'
													)
												) {
													onRemove(index);
												}
											}}
											className="pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100"
										>
											删除
										</Button>
									</div>
								</div>
							);
						})}
						{beverages.length === 0 && (
							<EmptyState
								title="暂无酒水"
								description="点击上方 + 按钮创建"
							/>
						)}
					</div>
				</div>
			</div>
		</div>
	);
});
