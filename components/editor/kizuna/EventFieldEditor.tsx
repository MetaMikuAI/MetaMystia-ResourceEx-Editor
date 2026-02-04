import { memo } from 'react';
import type { EventNode } from '@/types/resource';

interface EventFieldEditorProps {
	label: string;
	value: string | undefined;
	allEvents: EventNode[];
	onChange: (value: string) => void;
}

export const EventFieldEditor = memo<EventFieldEditorProps>(
	function EventFieldEditor({ label, value, allEvents, onChange }) {
		return (
			<div className="flex flex-col gap-2">
				<label className="text-sm font-bold opacity-70">{label}</label>
				<select
					value={value || ''}
					onChange={(e) => onChange(e.target.value)}
					className="rounded-lg border border-white/10 bg-black/10 px-3 py-2 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
				>
					<option value="">请选择事件...</option>
					{allEvents.map((e) => (
						<option key={e.label} value={e.label}>
							{e.label} ({e.debugLabel})
						</option>
					))}
				</select>
			</div>
		);
	}
);
