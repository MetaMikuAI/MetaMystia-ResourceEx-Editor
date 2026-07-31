import { memo, useEffect, useMemo } from 'react';

import { EditorField } from '@/components/common/EditorField';
import { useLabelPrefixValidation } from '@/components/common/useLabelPrefixValidation';
import { WarningBadge } from '@/components/common/WarningBadge';

import Button from '@/design/ui/components/button';
import { Select } from '@/design/ui/components/select';

import type { Character } from '@/domain/resourcePack/contracts/character';
import type {
	MissionNode,
	MissionType,
} from '@/domain/resourcePack/contracts/mission';

interface MissionBasicInfoProps {
	mission: MissionNode;
	characters: Character[];
	allFoods: { id: number; name: string }[];
	characterOptions: { value: string; label: string }[];
	onUpdate: (updates: Partial<MissionNode>) => void;
}

export const MissionBasicInfo = memo<MissionBasicInfoProps>(
	function MissionBasicInfo({
		mission,
		characters,
		allFoods,
		characterOptions,
		onUpdate,
	}) {
		const {
			isValid: isLabelPrefixValid,
			prefix: expectedPrefix,
			hasPackLabel,
		} = useLabelPrefixValidation(mission.label || '');
		const showPrefixWarning =
			hasPackLabel && mission.label && !isLabelPrefixValid;

		const hasBillRepayment = useMemo(
			() =>
				(mission.finishConditions ?? []).some(
					(c) => c.conditionType === 'BillRepayment'
				),
			[mission.finishConditions]
		);

		// BillRepayment 条件存在时，强制 reciever 为空，并自动开启 isTimedMission
		useEffect(() => {
			if (hasBillRepayment) {
				if (mission.reciever) {
					onUpdate({ reciever: '' });
				}
				if (!mission.isTimedMission) {
					onUpdate({ isTimedMission: true });
				}
			} else if (mission.isTimedMission) {
				onUpdate({ isTimedMission: false });
			}
		}, [
			hasBillRepayment,
			mission.reciever,
			mission.isTimedMission,
			onUpdate,
		]);

		return (
			<div className="grid grid-cols-1 gap-6">
				<EditorField label="Title">
					<div className="flex items-center gap-2">
						<input
							type="text"
							value={mission.title || ''}
							onChange={(e) =>
								onUpdate({ title: e.target.value })
							}
							className="flex-1 rounded-lg border border-black/10 bg-black/5 px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-white/10 dark:bg-white/5"
							placeholder="自动或手动设置显示标题"
						/>
						<Button
							variant="light"
							size="sm"
							isIconOnly
							onPress={() => {
								const cond = (mission.finishConditions ||
									[])[0];
								if (
									!cond ||
									cond.conditionType !== 'ServeInWork'
								)
									return;
								const targetLabel = cond.label;
								const char = characters.find(
									(c) => c.label === targetLabel
								);
								const charName =
									char?.name || targetLabel || '目标角色';
								const food = allFoods.find(
									(f) => f.id === cond.amount
								);
								const foodName = food?.name || '料理';
								onUpdate({
									title: `请${charName}品尝一下「${foodName}」吧！`,
									description: `从${charName}那儿得到了新料理的灵感，做出来以后请她尝一尝吧！`,
								});
							}}
							className="h-8 w-8"
							title="根据第一个完成条件生成标题和描述"
						>
							🔄
						</Button>
					</div>
				</EditorField>

				<EditorField label="Description">
					<textarea
						rows={3}
						value={mission.description || ''}
						onChange={(e) =>
							onUpdate({ description: e.target.value })
						}
						className="rounded-lg border border-black/10 bg-black/5 px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-white/10 dark:bg-white/5"
						placeholder="任务描述（可选）"
					/>
				</EditorField>

				<EditorField
					label="Label"
					actions={
						showPrefixWarning ? (
							<WarningBadge>
								建议以 {expectedPrefix} 开头
							</WarningBadge>
						) : undefined
					}
				>
					<input
						type="text"
						value={mission.label || ''}
						onChange={(e) => onUpdate({ label: e.target.value })}
						className="rounded-lg border border-black/10 bg-black/5 px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-white/10 dark:bg-white/5"
						placeholder="例如：Kizuna_Rumia_LV3_Upgrade_001_Mission"
					/>
				</EditorField>

				<EditorField label="Mission Type">
					<Select<MissionType>
						ariaLabel="Mission Type"
						value={mission.missionType}
						onChange={(v) => onUpdate({ missionType: v })}
						items={[
							{ value: 'Kitsuna', label: 'Kitsuna' },
							{ value: 'Main', label: 'Main' },
							{ value: 'Side', label: 'Side' },
						]}
					/>
				</EditorField>

				<EditorField label="委托自(Sender)">
					<Select<string>
						ariaLabel="委托自"
						placeholder="请选择角色..."
						value={mission.sender ?? ''}
						onChange={(v) => onUpdate({ sender: v })}
						items={characterOptions.map((opt) => ({
							value: opt.value,
							label: opt.label,
						}))}
					/>
				</EditorField>

				<EditorField label="交付至(Receiver)">
					<div className="flex flex-col gap-1">
						<Select<string>
							ariaLabel="交付至"
							placeholder={
								hasBillRepayment
									? 'BillRepayment 条件存在时强制留空'
									: '请选择角色...'
							}
							isDisabled={hasBillRepayment}
							value={
								hasBillRepayment
									? '__FORCED_EMPTY__'
									: (mission.reciever ?? '')
							}
							onChange={(v) => onUpdate({ reciever: v })}
							items={
								hasBillRepayment
									? [
											{
												value: '__FORCED_EMPTY__',
												label: '（必须留空）',
											},
										]
									: characterOptions.map((opt) => ({
											value: opt.value,
											label: opt.label,
										}))
							}
						/>
						{hasBillRepayment && (
							<span className="text-xs text-warning">
								⚠ 存在 BillRepayment 条件时，Receiver
								必须为空字符串
							</span>
						)}
					</div>
				</EditorField>

				{/* ── 限时任务（仅 BillRepayment 条件存在时显示） ── */}
				{hasBillRepayment && (
					<>
						<EditorField label="任务失败处理 (Mission Failed Action)">
							<Select<'None' | 'BackToMainMenu' | 'Rewind'>
								ariaLabel="Mission Failed Action"
								value={mission.missionFailedAction ?? 'None'}
								onChange={(v) =>
									onUpdate({
										missionFailedAction: v as
											| 'None'
											| 'BackToMainMenu'
											| 'Rewind',
									})
								}
								items={[
									{ value: 'None', label: '无操作 (None)' },
									{
										value: 'BackToMainMenu',
										label: '返回主菜单 (BackToMainMenu)',
									},
									{
										value: 'Rewind',
										label: '时间回滚 (Rewind)',
									},
								]}
							/>
						</EditorField>

						<EditorField label="任务时限 (Mission Time Limit)">
							<div className="flex flex-col gap-3 rounded-lg border border-black/10 bg-black/5 p-4 dark:border-white/10 dark:bg-white/5">
								<div className="flex flex-col gap-1">
									<label className="text-xs font-medium opacity-70">
										Trigger Type
									</label>
									<div className="rounded border border-black/10 bg-white/50 px-2 py-1 text-sm opacity-60 dark:border-white/10 dark:bg-black/50">
										OnWorkEnd（固定）
									</div>
								</div>

								<div className="flex flex-col gap-1">
									<label className="text-xs font-medium opacity-70">
										Trigger ID
									</label>
									<input
										type="text"
										value={
											mission.missionTimeLimit
												?.triggerId ?? ''
										}
										onChange={(e) =>
											onUpdate({
												missionTimeLimit: {
													...(mission.missionTimeLimit ?? {
														triggerType:
															'OnWorkEnd',
													}),
													triggerId: e.target.value,
												},
											})
										}
										className="rounded border border-black/10 bg-white/50 px-2 py-1 text-sm focus:border-primary focus:outline-none dark:border-white/10 dark:bg-black/50"
										placeholder="建议留空"
									/>
								</div>

								<div className="flex flex-col gap-1">
									<label className="text-xs font-medium opacity-70">
										Day Type
									</label>
									<Select<string>
										ariaLabel="Day Type"
										value={
											mission.missionTimeLimit?.time
												?.dayType ?? 'Relative'
										}
										onChange={(v) =>
											onUpdate({
												missionTimeLimit: {
													...(mission.missionTimeLimit ?? {
														triggerType:
															'OnWorkEnd',
													}),
													time: {
														...(mission
															.missionTimeLimit
															?.time ?? {
															dayType: 'Relative',
															dayCalcType:
																'Constant',
														}),
														dayType: v as
															| 'Relative'
															| 'Absolute',
													},
												},
											})
										}
										items={[
											{
												value: 'Relative',
												label: '相对 (Relative)',
											},
											{
												value: 'Absolute',
												label: '绝对 (Absolute)',
											},
										]}
									/>
								</div>

								<div className="flex flex-col gap-1">
									<label className="text-xs font-medium opacity-70">
										Day Calc Type
									</label>
									<Select<string>
										ariaLabel="Day Calc Type"
										value={
											mission.missionTimeLimit?.time
												?.dayCalcType ?? 'Constant'
										}
										onChange={(v) =>
											onUpdate({
												missionTimeLimit: {
													...(mission.missionTimeLimit ?? {
														triggerType:
															'OnWorkEnd',
													}),
													time: {
														...(mission
															.missionTimeLimit
															?.time ?? {
															dayType: 'Relative',
															dayCalcType:
																'Constant',
														}),
														dayCalcType: v as
															| 'Constant'
															| 'Random',
													},
												},
											})
										}
										items={[
											{
												value: 'Constant',
												label: '固定 (Constant)',
											},
											{
												value: 'Random',
												label: '随机 (Random)',
											},
										]}
									/>
								</div>

								{mission.missionTimeLimit?.time?.dayCalcType ===
								'Random' ? (
									<>
										<div className="flex flex-col gap-1">
											<label className="text-xs font-medium opacity-70">
												最小天数
											</label>
											<input
												type="number"
												min={0}
												value={
													mission.missionTimeLimit
														?.time?.dayRangeMin ?? 0
												}
												onChange={(e) =>
													onUpdate({
														missionTimeLimit: {
															...(mission.missionTimeLimit ?? {
																triggerType:
																	'OnWorkEnd',
															}),
															time: {
																...(mission
																	.missionTimeLimit
																	?.time ?? {
																	dayType:
																		'Relative',
																	dayCalcType:
																		'Constant',
																}),
																dayRangeMin:
																	Number(
																		e.target
																			.value
																	),
															},
														},
													})
												}
												className="rounded border border-black/10 bg-white/50 px-2 py-1 text-sm focus:border-primary focus:outline-none dark:border-white/10 dark:bg-black/50"
											/>
										</div>
										<div className="flex flex-col gap-1">
											<label className="text-xs font-medium opacity-70">
												最大天数
											</label>
											<input
												type="number"
												min={0}
												value={
													mission.missionTimeLimit
														?.time?.dayRangeMax ?? 0
												}
												onChange={(e) =>
													onUpdate({
														missionTimeLimit: {
															...(mission.missionTimeLimit ?? {
																triggerType:
																	'OnWorkEnd',
															}),
															time: {
																...(mission
																	.missionTimeLimit
																	?.time ?? {
																	dayType:
																		'Relative',
																	dayCalcType:
																		'Constant',
																}),
																dayRangeMax:
																	Number(
																		e.target
																			.value
																	),
															},
														},
													})
												}
												className="rounded border border-black/10 bg-white/50 px-2 py-1 text-sm focus:border-primary focus:outline-none dark:border-white/10 dark:bg-black/50"
											/>
										</div>
									</>
								) : (
									<div className="flex flex-col gap-1">
										<label className="text-xs font-medium opacity-70">
											天数 (Day)
										</label>
										<input
											type="number"
											min={0}
											value={
												mission.missionTimeLimit?.time
													?.day ?? 1
											}
											onChange={(e) =>
												onUpdate({
													missionTimeLimit: {
														...(mission.missionTimeLimit ?? {
															triggerType:
																'OnWorkEnd',
														}),
														time: {
															...(mission
																.missionTimeLimit
																?.time ?? {
																dayType:
																	'Relative',
																dayCalcType:
																	'Constant',
															}),
															day: Number(
																e.target.value
															),
														},
													},
												})
											}
											className="rounded border border-black/10 bg-white/50 px-2 py-1 text-sm focus:border-primary focus:outline-none dark:border-white/10 dark:bg-black/50"
										/>
									</div>
								)}
							</div>
						</EditorField>
					</>
				)}
			</div>
		);
	}
);
