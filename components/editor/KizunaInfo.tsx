import { memo, useState, useCallback } from 'react';
import type { KizunaInfo, EventNode, DialogPackage } from '@/types/resource';
import { cn } from '@/lib';
import { ChevronRight } from '@/components/icons/ChevronRight';
import { EventFieldEditor } from './kizuna/EventFieldEditor';
import { DialogArrayField } from './kizuna/DialogArrayField';
import { MapFieldEditor } from './kizuna/MapFieldEditor';
import { EVENT_FIELDS, DIALOG_FIELDS, MAP_FIELD } from './kizuna/constants';

interface KizunaInfoEditorProps {
	kizuna: KizunaInfo | undefined;
	allEvents: EventNode[];
	allDialogPackages: DialogPackage[];
	onUpdate: (updates: Partial<KizunaInfo>) => void;
	onEnable: () => void;
	onDisable: () => void;
}

export const KizunaInfoEditor = memo<KizunaInfoEditorProps>(
	function KizunaInfoEditor({
		kizuna,
		allEvents,
		allDialogPackages,
		onUpdate,
		onEnable,
		onDisable,
	}) {
		const [isExpanded, setIsExpanded] = useState(false);

		const handleDialogAdd = useCallback(
			(field: keyof KizunaInfo, dialogName: string) => {
				if (!dialogName) return;
				const current = (kizuna?.[field] as string[]) || [];
				if (current.includes(dialogName)) return;
				onUpdate({ [field]: [...current, dialogName] });
			},
			[kizuna, onUpdate]
		);

		const handleDialogRemove = useCallback(
			(field: keyof KizunaInfo, index: number) => {
				const current = (kizuna?.[field] as string[]) || [];
				onUpdate({ [field]: current.filter((_, i) => i !== index) });
			},
			[kizuna, onUpdate]
		);

		return (
			<div className="flex flex-col gap-4">
				<div className="ml-1 flex items-center justify-between">
					<div
						className="flex cursor-pointer select-none items-center gap-2"
						onClick={() => setIsExpanded(!isExpanded)}
					>
						<ChevronRight
							className={cn(
								'transition-transform duration-200',
								isExpanded && 'rotate-90'
							)}
						/>
						<label className="cursor-pointer font-semibold">
							羁绊配置 (Kizuna Info)
						</label>
					</div>
					<button
						onClick={() => {
							if (kizuna) {
								onDisable();
							} else {
								onEnable();
							}
						}}
						className={cn(
							'whitespace-nowrap rounded-full px-3 py-1 text-sm',
							kizuna ? 'btn-mystia-danger' : 'btn-mystia-primary'
						)}
					>
						{kizuna ? '禁用羁绊配置' : '启用羁绊配置'}
					</button>
				</div>

				{isExpanded && kizuna && (
					<div className="animate-in fade-in slide-in-from-top-2 flex flex-col gap-6 rounded-2xl border border-white/5 bg-black/5 p-6 duration-200">
						{/* Event Prerequisites Section */}
						<div className="flex flex-col gap-4">
							<h3 className="text-sm font-bold uppercase opacity-60">
								升级前置事件
							</h3>
							{EVENT_FIELDS.map((field) => (
								<EventFieldEditor
									key={field.key}
									label={field.label}
									value={kizuna[field.key]}
									allEvents={allEvents}
									onChange={(value) =>
										onUpdate({ [field.key]: value })
									}
								/>
							))}
						</div>

						{/* Dialog Packages Section */}
						<div className="flex flex-col gap-4">
							<h3 className="text-sm font-bold uppercase opacity-60">
								对话包配置
							</h3>
							{DIALOG_FIELDS.map((field) => (
								<DialogArrayField
									key={field.key}
									label={field.label}
									dialogs={
										(kizuna[field.key] as string[]) || []
									}
									allDialogPackages={allDialogPackages}
									onAdd={(dialogName) =>
										handleDialogAdd(field.key, dialogName)
									}
									onRemove={(index) =>
										handleDialogRemove(field.key, index)
									}
								/>
							))}
							<MapFieldEditor
								label={MAP_FIELD.label}
								value={kizuna[MAP_FIELD.key]}
								onChange={(value) =>
									onUpdate({ [MAP_FIELD.key]: value })
								}
							/>
						</div>
					</div>
				)}

				{isExpanded && !kizuna && (
					<div className="rounded-lg border border-dashed border-black/10 p-8 text-center dark:border-white/10">
						<p className="text-sm text-black/40 dark:text-white/40">
							暂未启用羁绊配置
						</p>
						<p className="mt-1 text-xs text-black/30 dark:text-white/30">
							点击右侧按钮启用
						</p>
					</div>
				)}
			</div>
		);
	}
);
