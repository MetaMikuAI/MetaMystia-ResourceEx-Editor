import { memo } from 'react';
import { EmptyState } from '@/components/EmptyState';
import { cn } from '@/lib';
import type { MissionNode } from '@/types/resource';

interface MissionListProps {
	missions: MissionNode[];
	selectedIndex: number | null;
	onAdd: () => void;
	onSelect: (index: number) => void;
}

export const MissionList = memo<MissionListProps>(function MissionList({
	missions,
	selectedIndex,
	onAdd,
	onSelect,
}) {
	return (
		<div className="flex h-min flex-col gap-4 overflow-y-auto rounded-lg bg-white/10 p-4 shadow-md backdrop-blur lg:sticky lg:top-24">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold">任务节点列表</h2>
				<button
					onClick={onAdd}
					className="btn-mystia h-8 w-8 text-lg hover:bg-black/5 dark:hover:bg-white/5"
				>
					+
				</button>
			</div>
			<div className="flex flex-col gap-2">
				{(missions || []).map((mission, index) => (
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
						<span className="text-lg font-bold text-foreground">
							{mission.title ||
								mission.debugLabel ||
								'未命名任务'}
						</span>
						<div className="font-mono text-xs text-foreground opacity-80">
							{mission.label} | {mission.missionType}
						</div>
					</button>
				))}
				{(!missions || missions.length === 0) && (
					<EmptyState
						title="暂无任务节点"
						description="点击上方 + 按钮创建"
					/>
				)}
			</div>
		</div>
	);
});
