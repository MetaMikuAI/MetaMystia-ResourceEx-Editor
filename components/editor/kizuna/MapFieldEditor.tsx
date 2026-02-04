import { memo } from 'react';
import { DAYSCENEMAP } from '@/data/daySceneMap';

interface MapFieldEditorProps {
	label: string;
	value: string | undefined;
	onChange: (value: string) => void;
}

export const MapFieldEditor = memo<MapFieldEditorProps>(
	function MapFieldEditor({ label, value, onChange }) {
		return (
			<div className="flex flex-col gap-2">
				<label className="text-sm font-bold opacity-70">{label}</label>
				<select
					value={value || ''}
					onChange={(e) => onChange(e.target.value)}
					className="rounded-lg border border-white/10 bg-black/10 px-3 py-2 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
				>
					<option value="">无委托采集</option>
					{DAYSCENEMAP.map((map) => (
						<option key={map.label} value={map.label}>
							{map.label} ({map.name})
						</option>
					))}
				</select>
			</div>
		);
	}
);
