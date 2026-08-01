import { memo, useCallback, useMemo } from 'react';

import type { EventNode } from '@/domain/resourcePack/contracts/event';

import { SectionAddButton } from '@/features/resourceEditor/client/components/actions/SectionAddButton';
import { SectionDeleteButton } from '@/features/resourceEditor/client/components/actions/SectionDeleteButton';
import { EditorSection } from '@/features/resourceEditor/client/components/layout/EditorSection';
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
			label: `${e.debugLabel || e.label}（${e.label}）`,
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
		<EditorSection
			title={`后继事件（postEvents）（${postEvents?.length || 0}）`}
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
						className="flex min-w-0 flex-col gap-3 rounded-large border border-divider bg-content1/40 p-3 sm:p-4"
					>
						<div className="flex flex-col gap-1">
							<p className="text-xs font-medium text-foreground-600">
								事件标签（Label）
							</p>
							<div className="flex min-w-0 items-center gap-3">
								<Select<string>
									baseClassName="flex-1"
									ariaLabel="事件标签（Label）"
									value={pe}
									onChange={(value) =>
										updatePostEvent(index, value)
									}
									placeholder="请选择事件…"
									items={eventItems}
								/>
								<SectionDeleteButton
									iconOnly
									className="shrink-0 sm:h-10 sm:w-10"
									aria-label={`删除后继事件${index + 1}`}
									onPress={() => removePostEvent(index)}
								/>
							</div>
						</div>
					</div>
				))}
				{(!postEvents || postEvents.length === 0) && (
					<EmptyState variant="text" title="暂无后继事件配置" />
				)}
			</div>
		</EditorSection>
	);
});
