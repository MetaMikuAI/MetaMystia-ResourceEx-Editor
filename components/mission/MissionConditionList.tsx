import { memo, useCallback } from 'react';
import type {
	ConditionType,
	MissionCondition,
	MissionNode,
} from '@/types/resource';

const CONDITION_TYPES: { type: ConditionType; label: string }[] = [
	{ type: 'BillRepayment', label: '【未实现】还债' },
	{ type: 'TalkWithCharacter', label: '【未实现】和角色交谈' },
	{ type: 'InspectInteractable', label: '【未实现】调查白天交互物品' },
	{ type: 'SubmitItem', label: '【未实现】交付目标物品' },
	{ type: 'ServeInWork', label: '请角色品尝料理' },
	{ type: 'SubmitByTag', label: '【未实现】交付包含Tag的对应物品' },
	{ type: 'SubmitByTags', label: '【未实现】交付包含多个Tag的对应物品' },
	{ type: 'SellInWork', label: '【未实现】在工作中售卖料理' },
	{ type: 'SubmitByIngredients', label: '【未实现】交付包含食材的料理' },
	{
		type: 'CompleteSpecifiedFollowingTasks',
		label: '【未实现】完成以下任务中的几个',
	},
	{
		type: 'CompleteSpecifiedFollowingTasksSubCondition',
		label: '【未实现】(完成以下任务中的几个)操作的任务条件',
	},
	{
		type: 'ReachTargetCharacterKisunaLevel',
		label: '【未实现】达到目标角色的羁绊等级LV',
	},
	{
		type: 'FakeMission',
		label: '【未实现】表示某种事情发生(不会自动完成，需要手动完成或者取消计划)',
	},
	{
		type: 'SubmitByAnyOneTag',
		label: '【未实现】交付包含任意一个Tag的对应物品',
	},
	{
		type: 'CompleteSpecifiedFollowingEvents',
		label: '【未实现】完成以下事件中的X(指定数量)个',
	},
	{ type: 'SubmitByLevel', label: '【未实现】交付指定Level的对应物品' },
];

interface MissionConditionListProps {
	mission: MissionNode;
	characterOptions: { value: string; label: string }[];
	allFoods: { id: number; name: string }[];
	onUpdate: (updates: Partial<MissionNode>) => void;
}

export const MissionConditionList = memo<MissionConditionListProps>(
	function MissionConditionList({
		mission,
		characterOptions,
		allFoods,
		onUpdate,
	}) {
		const addCondition = useCallback(() => {
			const newConditions: MissionCondition[] = [
				...(mission.finishConditions || []),
				{ conditionType: 'ServeInWork', sellableType: 'Food' },
			];
			onUpdate({ finishConditions: newConditions });
		}, [mission, onUpdate]);

		const removeCondition = useCallback(
			(index: number) => {
				if (!mission.finishConditions) return;
				const newConditions = [...mission.finishConditions];
				newConditions.splice(index, 1);
				onUpdate({ finishConditions: newConditions });
			},
			[mission, onUpdate]
		);

		const updateCondition = useCallback(
			(index: number, updates: Partial<MissionCondition>) => {
				if (!mission.finishConditions) return;
				const newConditions = [...mission.finishConditions];
				newConditions[index] = {
					...newConditions[index],
					...updates,
				} as MissionCondition;
				onUpdate({ finishConditions: newConditions });
			},
			[mission, onUpdate]
		);

		return (
			<div className="flex flex-col gap-4">
				<div className="flex items-center justify-between">
					<label className="font-medium text-foreground">
						Finish Conditions (
						{mission.finishConditions?.length || 0})
					</label>
					<button
						onClick={addCondition}
						className="btn-mystia-primary h-8 px-3 text-sm"
					>
						+ 添加完成条件
					</button>
				</div>
				<div className="flex flex-col gap-3">
					{(mission.finishConditions || []).map(
						(condition, index) => (
							<div
								key={index}
								className="flex flex-col gap-3 rounded-lg border border-black/5 bg-black/5 p-4 dark:border-white/5 dark:bg-white/5"
							>
								<div className="flex items-center justify-between gap-4">
									<select
										value={condition.conditionType}
										onChange={(e) =>
											updateCondition(index, {
												conditionType: e.target
													.value as ConditionType,
											})
										}
										className="flex-1 rounded border border-black/10 bg-transparent px-2 py-1 text-sm focus:border-primary focus:outline-none dark:border-white/10"
									>
										{CONDITION_TYPES.map((t) => (
											<option key={t.type} value={t.type}>
												{t.label} ({t.type})
											</option>
										))}
									</select>
									<button
										onClick={() => removeCondition(index)}
										className="btn-mystia text-xs text-danger hover:bg-danger/10"
									>
										删除
									</button>
								</div>

								{condition.conditionType === 'ServeInWork' && (
									<div className="flex flex-col gap-3">
										<div className="flex flex-col gap-1">
											<label className="text-xs font-medium opacity-70">
												Sellable Type
											</label>
											<select
												value={
													condition.sellableType ||
													'Food'
												}
												disabled
												className="rounded border border-black/10 bg-white/50 px-2 py-1 text-sm opacity-50 focus:border-primary focus:outline-none dark:border-white/10 dark:bg-black/50"
											>
												<option value="Food">
													Food
												</option>
												<option value="Beverage">
													Beverage
												</option>
											</select>
										</div>

										<div className="flex flex-col gap-1">
											<label className="text-xs font-medium opacity-70">
												目标角色 (Label)
											</label>
											<select
												value={condition.label || ''}
												onChange={(e) =>
													updateCondition(index, {
														label: e.target.value,
													})
												}
												className="rounded border border-black/10 bg-white/50 px-2 py-1 text-sm focus:border-primary focus:outline-none dark:border-white/10 dark:bg-black/50"
											>
												<option value="">
													请选择角色...
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

										<div className="flex flex-col gap-1">
											<label className="text-xs font-medium opacity-70">
												指定料理 (Food ID)
											</label>
											<select
												value={condition.amount || ''}
												onChange={(e) =>
													updateCondition(index, {
														amount: Number(
															e.target.value
														),
													})
												}
												className="rounded border border-black/10 bg-white/50 px-2 py-1 text-sm focus:border-primary focus:outline-none dark:border-white/10 dark:bg-black/50"
											>
												<option value="">
													请选择料理...
												</option>
												{allFoods.map((f) => (
													<option
														key={f.id}
														value={f.id}
													>
														[{f.id}] {f.name}
													</option>
												))}
											</select>
										</div>
									</div>
								)}

								{condition.conditionType !== 'ServeInWork' && (
									<div className="rounded bg-yellow-500/10 p-2 text-xs text-yellow-600 dark:text-yellow-400">
										⚠ 当前编辑器尚未支持配置此条件的详细参数
									</div>
								)}
							</div>
						)
					)}
					{(!mission.finishConditions ||
						mission.finishConditions.length === 0) && (
						<p className="text-center text-sm text-black/40 dark:text-white/40">
							暂无完成条件
						</p>
					)}
				</div>
			</div>
		);
	}
);
