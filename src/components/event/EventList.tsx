import { memo, useState } from 'react';
import { Button } from '@/design/ui/components';
import { EmptyState } from '@/components/common/EmptyState';
import { WarningBadge } from '@/components/common/WarningBadge';
import { cn } from '@/design/ui/utils';
import type { EventNode } from '@/types/resource';
import { usePackLabelPrefix } from '@/components/common/useLabelPrefixValidation';

interface EventListProps {
	events: EventNode[];
	selectedIndex: number | null;
	onAdd: () => void;
	onSelect: (index: number) => void;
}

export const EventList = memo<EventListProps>(function EventList({
	events,
	selectedIndex,
	onAdd,
	onSelect,
}) {
	const packLabelPrefix = usePackLabelPrefix();
	const [isCollapsed, setIsCollapsed] = useState(false);

	return (
		<div className="flex h-min min-w-0 flex-col gap-4 overflow-y-auto rounded-lg bg-white/10 p-4 shadow-md backdrop-blur lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)]">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold">事件节点列表</h2>
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
						{(events || []).map((event, index) => {
							const hasPrefixWarning =
								packLabelPrefix &&
								packLabelPrefix !== '_' &&
								event.label &&
								!event.label.startsWith(packLabelPrefix);
							return (
								<button
									key={index}
									onClick={() => onSelect(index)}
									className={cn(
										'surface-pressable min-w-0 flex-col items-start gap-1.5 border p-4 text-left',
										selectedIndex === index
											? 'border-primary bg-primary/20 shadow-inner'
											: 'border-transparent bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10'
									)}
								>
									<div className="flex w-full min-w-0 items-start gap-2">
										<span className="min-w-0 text-lg font-bold leading-snug text-foreground">
											{event.debugLabel || '未命名事件'}
										</span>
										{hasPrefixWarning && (
											<WarningBadge className="mt-0.5 shrink-0">
												前缀不规范
											</WarningBadge>
										)}
									</div>
									<div className="w-full min-w-0 break-all font-mono text-[11px] text-foreground/50">
										{event.label}
									</div>
								</button>
							);
						})}
						{(!events || events.length === 0) && (
							<EmptyState
								title="暂无事件节点"
								description="点击上方 + 按钮创建"
							/>
						)}
					</div>
				</div>
			</div>
		</div>
	);
});
