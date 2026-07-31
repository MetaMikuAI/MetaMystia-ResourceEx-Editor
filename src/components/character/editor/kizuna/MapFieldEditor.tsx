import { memo, useMemo } from 'react';

import { DAYSCENEMAP } from '@/data/daySceneMap';

import {
	Select,
	type SelectItem as SelectItemSpec,
} from '@/design/ui/components/select';

interface MapFieldEditorProps {
	label: string;
	value: string | undefined;
	onChange: (value: string) => void;
}

export const MapFieldEditor = memo<MapFieldEditorProps>(
	function MapFieldEditor({ label, value, onChange }) {
		const mapItems = useMemo<SelectItemSpec<string>[]>(() => {
			return [
				{ value: '', label: '无委托采集' }, // 空选项
				...DAYSCENEMAP.map((map) => ({
					value: map.label,
					label: `${map.label} (${map.name})`,
				})),
			];
		}, []);

		return (
			<div className="flex flex-col gap-2">
				<label className="text-sm font-bold opacity-70">{label}</label>
				<Select<string>
					value={value}
					onChange={onChange}
					placeholder="无委托采集"
					items={mapItems}
				/>
			</div>
		);
	}
);
