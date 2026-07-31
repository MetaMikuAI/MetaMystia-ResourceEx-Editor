import { cn } from '@heroui/theme';
import { memo, useCallback, useState } from 'react';

import Switch from '@/design/ui/components/switch';

import type { KizunaInfo } from '@/domain/resourcePack/contracts/character';
import type { DialogPackage } from '@/domain/resourcePack/contracts/dialogue';
import type { EventNode } from '@/domain/resourcePack/contracts/event';

import { ConfirmPopover } from '@/features/resourceEditor/client/components/confirm/ConfirmPopover';
import { InfoTip } from '@/features/resourceEditor/client/components/fields/InfoTip';
import { ChevronRight } from '@/features/resourceEditor/client/components/icons/ChevronRight';
import { EmptyState } from '@/features/resourceEditor/client/components/layout/EmptyState';

import { DIALOG_FIELDS, EVENT_FIELDS, MAP_FIELD } from './kizuna/constants';
import { DialogArrayField } from './kizuna/DialogArrayField';
import { EventFieldEditor } from './kizuna/EventFieldEditor';
import { MapFieldEditor } from './kizuna/MapFieldEditor';

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
		const [isDisableConfirmationOpen, setIsDisableConfirmationOpen] =
			useState(false);

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
						<InfoTip>
							配置角色的羁绊相关信息，包括事件前置条件、对话包等
						</InfoTip>
					</div>
					<div className="flex items-center gap-2">
						<span className="whitespace-nowrap text-xs font-medium">
							{kizuna ? '已启用羁绊配置' : '启用羁绊配置'}
						</span>
						{kizuna ? (
							<ConfirmPopover
								title="确定要关闭羁绊配置吗？"
								description="关闭后将丢失已填写的所有羁绊数据（升级前置事件、各等级对话包、委托区域等），且不可恢复。"
								confirmLabel="确认关闭"
								isOpen={isDisableConfirmationOpen}
								onConfirm={onDisable}
								onOpenChange={setIsDisableConfirmationOpen}
								trigger={
									<Switch
										aria-label="关闭羁绊配置"
										isSelected
										onValueChange={(isSelected) => {
											if (!isSelected) {
												setIsDisableConfirmationOpen(
													true
												);
											}
										}}
										size="sm"
									/>
								}
							/>
						) : (
							<Switch
								size="sm"
								isSelected={false}
								onValueChange={(isSelected) => {
									if (isSelected) onEnable();
								}}
							/>
						)}
					</div>
				</div>

				{isExpanded && kizuna && (
					<div className="animate-in fade-in slide-in-from-top-2 flex flex-col gap-6 rounded-2xl border border-white/5 bg-black/5 p-6 duration-200">
						{/* Event Prerequisites Section */}
						<div className="flex flex-col gap-4">
							<h3 className="text-sm font-bold uppercase opacity-60">
								升级前置事件
								<InfoTip>
									“升级前置事件”用于检测稀客的羁绊进度是否已满。ResourceEx
									会检测稀客等级并自动触发对应的事件节点。您需要在“事件节点编辑”中设计羁绊事件
								</InfoTip>
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
								<InfoTip>
									配置与稀客相关的对话包，这些对话包会在与稀客对话时触发
								</InfoTip>
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
					<EmptyState
						title="暂未启用羁绊配置"
						description="点击右侧开关启用"
					/>
				)}
			</div>
		);
	}
);
