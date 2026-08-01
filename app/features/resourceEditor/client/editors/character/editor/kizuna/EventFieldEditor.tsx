import { memo, useMemo } from 'react';

import type { EventNode } from '@/domain/resourcePack/contracts/event';

import { Label } from '@/features/resourceEditor/client/components/fields/Label';
import {
	Select,
	type SelectItem as SelectItemSpec,
} from '@/features/resourceEditor/client/components/select/Select';

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
				label: `${e.label}（${e.debugLabel}）`,
			}));
		}, [allEvents]);

		return (
			<div className="flex min-w-0 flex-col gap-2">
				<Label>{label}</Label>
				<Select<string>
					value={value}
					onChange={onChange}
					placeholder="请选择事件…"
					items={eventItems}
					size="sm"
				/>
			</div>
		);
	}
);
