'use client';

import { memo } from 'react';
import type {
	EventNode,
	MissionNode,
	Character,
	DialogPackage,
} from '@/types/resource';
import { PostEventList } from './PostEventList';
import { PostMissionList } from './PostMissionList';
import { ScheduledEventEditor } from './ScheduledEventEditor';

interface EventEditorProps {
	eventNode: EventNode | null;
	allMissions: MissionNode[];
	allEvents: EventNode[];
	allCharacters: Character[];
	allDialogPackages: DialogPackage[];
	onRemove: () => void;
	onUpdate: (updates: Partial<EventNode>) => void;
}

export default memo<EventEditorProps>(function EventEditor({
	eventNode,
	allMissions,
	allEvents,
	allCharacters,
	allDialogPackages,
	onRemove,
	onUpdate,
}) {
	if (!eventNode) {
		return (
			<div className="flex h-full items-center justify-center rounded-lg bg-white/5 p-8 text-center backdrop-blur">
				<div className="text-black/40 dark:text-white/40">
					请在左侧列表选择一个事件节点，或点击 + 按钮创建新事件节点
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6 rounded-lg bg-white/10 p-6 shadow-md backdrop-blur">
			<div className="flex items-center justify-between border-b border-black/10 pb-4 dark:border-white/10">
				<h2 className="text-2xl font-bold">事件节点编辑</h2>
				<button
					onClick={onRemove}
					className="btn-mystia-secondary bg-danger text-white hover:bg-danger/80"
				>
					删除事件
				</button>
			</div>

			<div className="grid grid-cols-1 gap-6">
				<div className="flex flex-col gap-2">
					<label className="font-medium text-foreground">
						Debug Label
					</label>
					<input
						type="text"
						value={eventNode.debugLabel || ''}
						onChange={(e) =>
							onUpdate({ debugLabel: e.target.value })
						}
						className="rounded-lg border border-black/10 bg-black/5 px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-white/10 dark:bg-white/5"
						placeholder="用于显示在编辑器左侧列表的名称"
					/>
				</div>

				<div className="flex flex-col gap-2">
					<label className="font-medium text-foreground">Label</label>
					<input
						type="text"
						value={eventNode.label || ''}
						onChange={(e) => onUpdate({ label: e.target.value })}
						className="rounded-lg border border-black/10 bg-black/5 px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-white/10 dark:bg-white/5"
						placeholder="游戏内唯一标识符"
					/>
				</div>

				<div className="flex flex-col gap-2">
					<label className="font-medium text-foreground">
						Scheduled Event
					</label>
					<ScheduledEventEditor
						scheduledEvent={eventNode.scheduledEvent || {}}
						allCharacters={allCharacters}
						allDialogPackages={allDialogPackages}
						onUpdate={(updatedScheduledEvent) =>
							onUpdate({ scheduledEvent: updatedScheduledEvent })
						}
					/>
				</div>

				<PostMissionList
					postMissions={eventNode.postMissionsAfterPerformance}
					allMissions={allMissions}
					onUpdate={(pms) =>
						onUpdate({ postMissionsAfterPerformance: pms })
					}
				/>

				<PostEventList
					postEvents={eventNode.postEvents}
					allEvents={allEvents}
					onUpdate={(events) => onUpdate({ postEvents: events })}
				/>
			</div>
		</div>
	);
});
