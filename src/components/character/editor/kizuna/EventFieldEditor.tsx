import { memo, useMemo } from 'react';

import {
	Select,
	type SelectItem as SelectItemSpec,
} from '@/design/ui/components/select';

import type { EventNode } from '@/domain/resourcePack/contracts/event';

interface EventFieldEditorProps {
	label: string;
	value: string | undefined;
	allEvents: EventNode[];
	onChange: (value: string) => void;
}

export const EventFieldEditor = memo<EventFieldEditorProps>(
	function EventFieldEditor({ label, value, allEvents, onChange }) {
		const eventItems = useMemo<SelectItemSpec<string>[]>(() => {
			return allEvents.map((e) => ({
				value: e.label,
				label: `${e.label} (${e.debugLabel})`,
			}));
		}, [allEvents]);

		return (
			<div className="flex flex-col gap-2">
				<label className="text-sm font-bold opacity-70">{label}</label>
				<Select<string>
					value={value}
					onChange={onChange}
					placeholder="请选择事件..."
					items={eventItems}
				/>
			</div>
		);
	}
);
