'use client';

import { useCallback, useState } from 'react';

import type { EventNode } from '@/domain/resourcePack/contracts/event';
import { remapResourcePackLabelReferences } from '@/domain/resourcePack/entityReferences';

import { EditorWorkspace } from '@/features/resourceEditor/client/components/layout/EditorWorkspace';
import { findNextAvailableSuffixedValue } from '@/features/resourceEditor/client/editorValueAllocation';
import { useResourceEditor } from '@/features/resourceEditor/client/state/useResourceEditor';

import EventEditor from './EventEditor';
import { EventList } from './EventList';

const DEFAULT_EVENT = {
	debugLabel: '新事件',
	scheduledEvent: { eventData: { eventType: 'Null' as const } },
	postMissionsAfterPerformance: [] as string[],
};

export function EventEditorScreen() {
	const { resourcePack: data, updateResourcePack } = useResourceEditor();
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

	const addEvent = useCallback(() => {
		const packLabel = data.packInfo.label;
		const labelPrefix = packLabel ? `_${packLabel}_` : '_';
		const eventNodes = data.eventNodes ?? [];
		const newEvent: EventNode = {
			...DEFAULT_EVENT,
			label: findNextAvailableSuffixedValue(
				eventNodes.map((eventNode) => eventNode.label),
				`${labelPrefix}Event_`
			),
		};
		const newEvents = [...eventNodes, newEvent];
		updateResourcePack(() => ({ ...data, eventNodes: newEvents }));
		setSelectedIndex(newEvents.length - 1);
	}, [data, updateResourcePack]);

	const updateEvent = useCallback(
		(index: number | null, updates: Partial<EventNode>) => {
			if (index === null) return;
			const newEvents = [...(data.eventNodes || [])];
			const previousEvent = newEvents[index];
			if (!previousEvent) return;
			newEvents[index] = { ...previousEvent, ...updates } as EventNode;
			let nextData = { ...data, eventNodes: newEvents };
			if (
				updates.label !== undefined &&
				updates.label !== previousEvent.label
			) {
				nextData = remapResourcePackLabelReferences(
					nextData,
					'Event',
					previousEvent.label,
					updates.label
				);
			}
			updateResourcePack(() => nextData);
		},
		[data, updateResourcePack]
	);

	const removeEvent = useCallback(
		(index: number | null) => {
			if (index === null) return;
			const newEvents = (data.eventNodes || []).filter(
				(_, i) => i !== index
			);
			updateResourcePack(() => ({ ...data, eventNodes: newEvents }));
			setSelectedIndex(null);
		},
		[data, updateResourcePack]
	);

	const selectedEvent =
		selectedIndex !== null &&
		data.eventNodes &&
		data.eventNodes[selectedIndex]
			? data.eventNodes[selectedIndex]
			: null;

	return (
		<EditorWorkspace>
			<EventList
				events={data.eventNodes || []}
				selectedIndex={selectedIndex}
				onAdd={addEvent}
				onSelect={setSelectedIndex}
			/>

			<div className="lg:col-span-2">
				<EventEditor
					eventNode={selectedEvent}
					allMissions={data.missionNodes || []}
					allEvents={data.eventNodes || []}
					allCharacters={data.characters || []}
					beverages={data.beverages || []}
					foods={data.foods || []}
					ingredients={data.ingredients || []}
					recipes={data.recipes || []}
					allDialogPackages={data.dialogPackages || []}
					onRemove={() => removeEvent(selectedIndex)}
					onUpdate={(updates) => updateEvent(selectedIndex, updates)}
				/>
			</div>
		</EditorWorkspace>
	);
}
