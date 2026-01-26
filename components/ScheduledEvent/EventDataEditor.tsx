'use client';

import { memo } from 'react';
import type { ScheduledEvent, DialogPackage } from '@/types/resource';

interface EventDataEditorProps {
	eventData?: ScheduledEvent['eventData'];
	allDialogPackages: DialogPackage[];
	onChange: (eventData: NonNullable<ScheduledEvent['eventData']>) => void;
}

export const EventDataEditor = memo<EventDataEditorProps>(
	function EventDataEditor({ eventData, allDialogPackages, onChange }) {
		return (
			<div className="flex flex-col gap-2 rounded-lg border border-black/10 bg-black/5 p-4 dark:border-white/10 dark:bg-white/5">
				<div className="flex flex-col gap-1">
					<label className="text-xs font-medium opacity-70">
						Event Type
					</label>
					<select
						value={eventData?.eventType || 'Null'}
						onChange={(e) => {
							const newType = e.target.value as any;
							const newEventData: any = { eventType: newType };
							if (
								newType === 'Dialog' &&
								eventData?.dialogPackageName
							) {
								newEventData.dialogPackageName =
									eventData.dialogPackageName;
							}
							onChange(newEventData);
						}}
						className="rounded border border-black/10 bg-transparent px-2 py-1 text-sm focus:border-primary focus:outline-none dark:border-white/10"
					>
						<option value="Null">Null</option>
						<option value="Timeline">Timeline</option>
						<option value="Dialog">Dialog</option>
					</select>
				</div>

				{eventData?.eventType === 'Dialog' && (
					<div className="flex flex-col gap-1">
						<label className="text-xs font-medium opacity-70">
							Dialog Package Name
						</label>
						<select
							value={eventData?.dialogPackageName || ''}
							onChange={(e) =>
								onChange({
									...(eventData || { eventType: 'Dialog' }),
									dialogPackageName: e.target.value,
								})
							}
							className="rounded-lg border border-black/10 bg-black/5 px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-white/10 dark:bg-white/5"
						>
							<option value="">Select Package...</option>
							{allDialogPackages.map((pkg, index) => (
								<option key={index} value={pkg.name}>
									{pkg.name || `Dialog Package ${index}`}
								</option>
							))}
						</select>
					</div>
				)}

				{eventData?.eventType === 'Timeline' && (
					<div className="rounded bg-yellow-500/10 p-2 text-xs text-yellow-600 dark:text-yellow-400">
						⚠ 暂不支持配置 Timeline
					</div>
				)}
			</div>
		);
	}
);
