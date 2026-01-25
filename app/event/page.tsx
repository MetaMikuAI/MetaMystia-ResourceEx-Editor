'use client';

import { useCallback, useState } from 'react';
import { useData } from '@/components/DataContext';
import { Header } from '@/components/Header';
import { EventList } from '@/components/EventList';
import EventEditor from '@/components/EventEditor';
import type { EventNode } from '@/types/resource';

const DEFAULT_EVENT: EventNode = {
	label: '',
	debugLabel: '新事件',
	scheduledEvent: { eventData: { eventType: 'Null' } },
	postMissionsAfterPerformance: [],
};

export default function EventPage() {
	const { data, setData, setHasUnsavedChanges } = useData();
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

	const addEvent = useCallback(() => {
		const newEvent = { ...DEFAULT_EVENT };
		const newEvents = [...(data.eventNodes || []), newEvent];
		setData({ ...data, eventNodes: newEvents });
		setSelectedIndex(newEvents.length - 1);
		setHasUnsavedChanges(true);
	}, [data, setData, setHasUnsavedChanges]);

	const updateEvent = useCallback(
		(index: number | null, updates: Partial<EventNode>) => {
			if (index === null) return;
			const newEvents = [...(data.eventNodes || [])];
			newEvents[index] = { ...newEvents[index], ...updates } as EventNode;
			setData({ ...data, eventNodes: newEvents });
			setHasUnsavedChanges(true);
		},
		[data, setData, setHasUnsavedChanges]
	);

	const removeEvent = useCallback(
		(index: number | null) => {
			if (index === null) return;
			if (!confirm('确定要删除这个事件节点吗？')) return;

			const newEvents = (data.eventNodes || []).filter(
				(_, i) => i !== index
			);
			setData({ ...data, eventNodes: newEvents });
			setSelectedIndex(null);
			setHasUnsavedChanges(true);
		},
		[data, setData, setHasUnsavedChanges]
	);

	const selectedEvent =
		selectedIndex !== null &&
		data.eventNodes &&
		data.eventNodes[selectedIndex]
			? data.eventNodes[selectedIndex]
			: null;

	return (
		<main className="flex min-h-screen flex-col">
			<Header />

			<div className="container mx-auto w-full max-w-7xl px-6 py-8 3xl:max-w-screen-2xl 4xl:max-w-screen-3xl">
				<div className="relative grid grid-cols-1 gap-8 lg:grid-cols-3">
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
							allDialogPackages={data.dialogPackages || []}
							onRemove={() => removeEvent(selectedIndex)}
							onUpdate={(updates) =>
								updateEvent(selectedIndex, updates)
							}
						/>
					</div>
				</div>
			</div>
		</main>
	);
}
