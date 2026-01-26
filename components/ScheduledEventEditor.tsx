'use client';

import { memo } from 'react';
import type {
	ScheduledEvent,
	Character,
	DialogPackage,
} from '@/types/resource';
import { TriggerEditor } from '@/components/ScheduledEvent/TriggerEditor';
import { EventDataEditor } from '@/components/ScheduledEvent/EventDataEditor';

interface ScheduledEventEditorProps {
	scheduledEvent?: ScheduledEvent;
	allCharacters: Character[];
	allDialogPackages: DialogPackage[];
	onUpdate: (updates: ScheduledEvent) => void;
}

export const ScheduledEventEditor = memo<ScheduledEventEditorProps>(
	function ScheduledEventEditor({
		scheduledEvent,
		allCharacters,
		allDialogPackages,
		onUpdate,
	}) {
		return (
			<div className="flex flex-col gap-4 rounded-lg border border-black/10 bg-black/5 p-4 dark:border-white/10 dark:bg-white/5">
				<div className="flex flex-col gap-2">
					<label className="font-medium text-foreground">
						Trigger
					</label>
					<TriggerEditor
						trigger={scheduledEvent?.trigger}
						allCharacters={allCharacters}
						onChange={(newTrigger) =>
							onUpdate({
								...(scheduledEvent || {}),
								trigger: newTrigger,
							})
						}
					/>
				</div>

				<div className="flex flex-col gap-2">
					<label className="font-medium text-foreground">
						Event Data
					</label>
					<EventDataEditor
						eventData={scheduledEvent?.eventData}
						allDialogPackages={allDialogPackages}
						onChange={(newEventData) =>
							onUpdate({
								...(scheduledEvent || {}),
								eventData: newEventData,
							})
						}
					/>
				</div>
			</div>
		);
	}
);
