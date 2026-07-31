import { memo, useCallback, useMemo } from 'react';

import Button from '@/design/ui/components/button';

import type { EventNode } from '@/domain/resourcePack/contracts/event';

import { SectionAddButton } from '@/features/resourceEditor/client/components/actions/SectionAddButton';
import { EditorField } from '@/features/resourceEditor/client/components/fields/EditorField';
import { EmptyState } from '@/features/resourceEditor/client/components/layout/EmptyState';
import {
	Select,
	type SelectItem as SelectItemSpec,
} from '@/features/resourceEditor/client/components/select/Select';

interface PostEventListProps {
	postEvents: string[] | undefined;
	allEvents: EventNode[];
	onUpdate: (events: string[]) => void;
}

export const PostEventList = memo<PostEventListProps>(function PostEventList({
	postEvents,
	allEvents,
	onUpdate,
}) {
	const eventItems = useMemo<SelectItemSpec<string>[]>(() => {
		return allEvents.map((e) => ({
			value: e.label,
			label: `${e.debugLabel || e.label} (${e.label})`,
		}));
	}, [allEvents]);

	const addPostEvent = useCallback(() => {
		const newPostEvents = [...(postEvents || []), ''];
		onUpdate(newPostEvents);
	}, [postEvents, onUpdate]);

	const removePostEvent = useCallback(
		(index: number) => {
			if (!postEvents) return;
			const newPostEvents = [...postEvents];
			newPostEvents.splice(index, 1);
			onUpdate(newPostEvents);
		},
		[postEvents, onUpdate]
	);

	const updatePostEvent = useCallback(
		(index: number, value: string) => {
			if (!postEvents) return;
			const newPostEvents = [...postEvents];
			newPostEvents[index] = value;
			onUpdate(newPostEvents);
		},
		[postEvents, onUpdate]
	);

	return (
		<EditorField
			className="gap-4"
			label={`后继事件(postEvents) (${postEvents?.length || 0})`}
			actions={
				<SectionAddButton onPress={addPostEvent}>
					添加后继事件
				</SectionAddButton>
			}
		>
			<div className="flex flex-col gap-3">
				{(postEvents || []).map((pe, index) => (
					<div
						key={index}
						className="flex flex-col gap-3 rounded-lg border border-black/5 bg-black/5 p-4 dark:border-white/5 dark:bg-white/5"
					>
						<div className="flex flex-col gap-1">
							<label className="text-xs font-medium opacity-70">
								事件 Label
							</label>
							<div className="flex items-center justify-between gap-4">
								<Select<string>
									baseClassName="flex-1"
									value={pe}
									onChange={(value) =>
										updatePostEvent(index, value)
									}
									placeholder="请选择事件..."
									items={eventItems}
								/>
								<Button
									variant="light"
									size="sm"
									onPress={() => removePostEvent(index)}
									className="text-xs text-danger hover:bg-danger/10"
								>
									删除
								</Button>
							</div>
						</div>
					</div>
				))}
				{(!postEvents || postEvents.length === 0) && (
					<EmptyState variant="text" title="暂无后继事件配置" />
				)}
			</div>
		</EditorField>
	);
});
