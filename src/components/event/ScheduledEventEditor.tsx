'use client';

import { memo } from 'react';

import type { Character } from '@/domain/resourcePack/contracts/character';
import type { DialogPackage } from '@/domain/resourcePack/contracts/dialogue';
import type { ScheduledEvent } from '@/domain/resourcePack/contracts/event';

import { EditorField } from '@/features/resourceEditor/client/components/fields/EditorField';

import { EventDataEditor } from './ScheduledEvent/EventDataEditor';
import { TriggerEditor } from './ScheduledEvent/TriggerEditor';

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
				<EditorField label="Trigger">
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
				</EditorField>

				<EditorField label="Event Data">
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
				</EditorField>
			</div>
		);
	}
);
