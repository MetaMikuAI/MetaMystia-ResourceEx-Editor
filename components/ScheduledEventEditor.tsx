'use client';

import { memo, useMemo } from 'react';
import type {
	ScheduledEvent,
	Character,
	DialogPackage,
} from '@/types/resource';
import { SPECIAL_GUESTS } from '@/data/specialGuest';

const TRIGGER_TYPES = [
	{
		value: 'OnEnterDaySceneMap',
		label: '【未实现】进入白天地图前(OnEnterDaySceneMap)',
	},
	{
		value: 'OnEnterDayScene',
		label: '【未实现】进入白天前(OnEnterDayScene)',
	},
	{ value: 'OnWorkEnd', label: '【未实现】工作结束前(OnWorkEnd)' },
	{
		value: 'OnTalkWithCharacter',
		label: '【未实现】和角色对话时(OnTalkWithCharacter)',
	},
	{
		value: 'OnBeforeWorkStart',
		label: '【未实现】工作开始之前(OnBeforeWorkStart)',
	},
	{ value: 'KizunaCheckPoint', label: '羁绊等级升级时(KizunaCheckPoint)' },
	{
		value: 'OnDayEnd',
		label: '【未实现】白天结束时，在夜雀的进入店面对话前(OnDayEnd)',
	},
	{
		value: 'LevelCheckPoint',
		label: '【未实现】等级升级时(LevelCheckPoint)',
	},
	{
		value: 'BuyCount',
		label: '【未实现】【未实现】购买了目标物品X个数量时(BuyCount)',
	},
	{
		value: 'OnBeforeChallengeStart',
		label: '【未实现】挑战开始前(OnBeforeChallengeStart)',
	},
	{ value: 'OnChallengeEnd', label: '【未实现】挑战结束前(OnChallengeEnd)' },
	{
		value: 'Obsolete_OnChallengePhaseChange',
		label: '【未实现】【已弃用】挑战阶段切换时(Obsolete_OnChallengePhaseChange)',
	},
	{
		value: 'OnChallengeFailed',
		label: '【未实现】挑战失败时(OnChallengeFailed)',
	},
	{
		value: 'OnChallengeSucceed',
		label: '【未实现】挑战成功时(OnChallengeSucceed)',
	},
	{
		value: 'OnAfterDayEnd',
		label: '【未实现】白天结束时，在夜雀的进入店面对话后(OnAfterDayEnd)',
	},
	{
		value: 'OnBeforeIzakayaConfigure',
		label: '【未实现】进入雀食堂配置前(OnBeforeIzakayaConfigure)',
	},
	{
		value: 'OnEnterDaySceneTriggerArea',
		label: '【未实现】进入白天触发区域(OnEnterDaySceneTriggerArea)',
	},
	{
		value: 'TriggerFinishImmediate',
		label: '【未实现】立刻获得该事件内包含的奖励以及后置信息(TriggerFinishImmediate)',
	},
	{
		value: 'OnAfterDayEndIzakayaSelectionOpen',
		label: '【未实现】在白天结束，雀食堂配置面板打开后(OnAfterDayEndIzakayaSelectionOpen)',
	},
	{
		value: 'CompleteSpecifiedFollowingEvents',
		label: '【未实现】完成以下事件中的X(指定数量)个(CompleteSpecifiedFollowingEvents)',
	},
	{
		value: 'ImpossibleFinish',
		label: '【未实现】表示某种事情发生(不会自动完成，需要手动完成或者取消计划)(ImpossibleFinish)',
	},
	{
		value: 'OnAnyKizunaExpFull',
		label: '【未实现】在羁绊经验到达当前等级最大值时(OnAnyKizunaExpFull)',
	},
];

interface ScheduledEventEditorProps {
	scheduledEvent?: ScheduledEvent;
	allCharacters: Character[];
	allDialogPackages: DialogPackage[];
	onUpdate: (updates: ScheduledEvent) => void;
}

export const ScheduledEventEditor = memo<ScheduledEventEditorProps>(
	function ScheduledEventEditor({
		scheduledEvent,
		allCharacters,
		allDialogPackages,
		onUpdate,
	}) {
		const characterOptions = useMemo(() => {
			const options: { value: string; label: string }[] = [];
			// Add built-in special guests
			SPECIAL_GUESTS.forEach((g) => {
				options.push({
					value: g.label,
					label: `[${g.id}] ${g.name} (${g.label})`,
				});
			});
			// Add custom characters
			allCharacters.forEach((c) => {
				options.push({
					value: c.label,
					label: `[${c.id}] ${c.name} (${c.label})`,
				});
			});
			return options;
		}, [allCharacters]);

		return (
			<div className="flex flex-col gap-4 rounded-lg border border-black/10 bg-black/5 p-4 dark:border-white/10 dark:bg-white/5">
				<div className="flex flex-col gap-2">
					<label className="font-medium text-foreground">
						Trigger
					</label>
					<div className="flex flex-col gap-2 rounded-lg border border-black/10 bg-black/5 p-4 dark:border-white/10 dark:bg-white/5">
						<div className="flex flex-col gap-1">
							<label className="text-xs font-medium opacity-70">
								Trigger Type
							</label>
							<select
								value={
									scheduledEvent?.trigger?.triggerType || ''
								}
								onChange={(e) => {
									const newType = e.target.value;
									const newTrigger: {
										triggerType: string;
										triggerId?: string;
									} = { triggerType: newType };
									if (
										newType === 'KizunaCheckPoint' &&
										scheduledEvent?.trigger?.triggerId
									) {
										newTrigger.triggerId =
											scheduledEvent.trigger.triggerId;
									}
									onUpdate({
										...scheduledEvent,
										trigger: newTrigger,
									});
								}}
								className="rounded border border-black/10 bg-transparent px-2 py-1 text-sm focus:border-primary focus:outline-none dark:border-white/10"
							>
								<option value="">None</option>
								{TRIGGER_TYPES.map((t) => (
									<option key={t.value} value={t.value}>
										{t.label}
									</option>
								))}
							</select>
						</div>

						{scheduledEvent?.trigger?.triggerType ===
							'KizunaCheckPoint' && (
							<div className="flex flex-col gap-1">
								<label className="text-xs font-medium opacity-70">
									Target Character (Trigger ID)
								</label>
								<select
									value={
										scheduledEvent?.trigger?.triggerId || ''
									}
									onChange={(e) =>
										onUpdate({
											...(scheduledEvent || {}),
											trigger: {
												...scheduledEvent?.trigger!,
												triggerId: e.target.value,
											},
										})
									}
									className="rounded-lg border border-black/10 bg-black/5 px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-white/10 dark:bg-white/5"
								>
									<option value="">
										Select Character...
									</option>
									{characterOptions.map((opt) => (
										<option
											key={opt.value}
											value={opt.value}
										>
											{opt.label}
										</option>
									))}
								</select>
							</div>
						)}

						{scheduledEvent?.trigger?.triggerType &&
							scheduledEvent.trigger.triggerType !==
								'KizunaCheckPoint' && (
								<div className="rounded bg-yellow-500/10 p-2 text-xs text-yellow-600 dark:text-yellow-400">
									⚠ 当前编辑器尚未支持配置此条件的详细参数
								</div>
							)}
					</div>
				</div>

				<div className="flex flex-col gap-2">
					<label className="font-medium text-foreground">
						Event Data
					</label>
					<div className="flex flex-col gap-2 rounded-lg border border-black/10 bg-black/5 p-4 dark:border-white/10 dark:bg-white/5">
						<div className="flex flex-col gap-1">
							<label className="text-xs font-medium opacity-70">
								Event Type
							</label>
							<select
								value={
									scheduledEvent?.eventData?.eventType ||
									'Null'
								}
								onChange={(e) => {
									const newType = e.target.value as any;
									const newEventData: any = {
										eventType: newType,
									};
									if (
										newType === 'Dialog' &&
										scheduledEvent?.eventData
											?.dialogPackageName
									) {
										newEventData.dialogPackageName =
											scheduledEvent.eventData.dialogPackageName;
									}
									onUpdate({
										...(scheduledEvent || {}),
										eventData: newEventData,
									});
								}}
								className="rounded border border-black/10 bg-transparent px-2 py-1 text-sm focus:border-primary focus:outline-none dark:border-white/10"
							>
								<option value="Null">Null</option>
								<option value="Timeline">Timeline</option>
								<option value="Dialog">Dialog</option>
							</select>
						</div>

						{scheduledEvent?.eventData?.eventType === 'Dialog' && (
							<div className="flex flex-col gap-1">
								<label className="text-xs font-medium opacity-70">
									Dialog Package Name
								</label>
								<select
									value={
										scheduledEvent?.eventData
											?.dialogPackageName || ''
									}
									onChange={(e) =>
										onUpdate({
											...(scheduledEvent || {}),
											eventData: {
												...scheduledEvent?.eventData!,
												dialogPackageName:
													e.target.value,
											},
										})
									}
									className="rounded-lg border border-black/10 bg-black/5 px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-white/10 dark:bg-white/5"
								>
									<option value="">Select Package...</option>
									{allDialogPackages.map((pkg, index) => (
										<option key={index} value={pkg.name}>
											{pkg.name ||
												`Dialog Package ${index}`}
										</option>
									))}
								</select>
							</div>
						)}

						{scheduledEvent?.eventData?.eventType ===
							'Timeline' && (
							<div className="rounded bg-yellow-500/10 p-2 text-xs text-yellow-600 dark:text-yellow-400">
								⚠ 暂不支持配置 Timeline
							</div>
						)}
					</div>
				</div>
			</div>
		);
	}
);
