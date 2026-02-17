import { memo } from 'react';
import { EmptyState } from '@/components/common/EmptyState';
import { WarningBadge } from '@/components/common/WarningBadge';
import { cn } from '@/lib';
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

	return (
		<div className="flex h-min flex-col gap-4 overflow-y-auto rounded-lg bg-white/10 p-4 shadow-md backdrop-blur lg:sticky lg:top-24">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold">事件节点列表</h2>
				<button
					onClick={onAdd}
					className="btn-mystia h-8 w-8 text-lg hover:bg-black/5 dark:hover:bg-white/5"
				>
					+
				</button>
			</div>
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
								'btn-mystia-primary flex-col items-start border p-4',
								selectedIndex === index
									? 'border-primary bg-primary/20 shadow-inner'
									: 'border-transparent bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10'
							)}
						>
							<div className="flex items-center gap-2">
								<span className="text-lg font-bold text-foreground">
									{event.debugLabel || '未命名事件'}
								</span>
								{hasPrefixWarning && (
									<WarningBadge>前缀不规范</WarningBadge>
								)}
							</div>
							<div className="font-mono text-xs text-foreground opacity-80">
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
	);
});
