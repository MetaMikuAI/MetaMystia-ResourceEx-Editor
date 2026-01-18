'use client';

import { memo, useCallback, useMemo } from 'react';
import { FOOD_NAMES } from '@/data/foods';
import { INGREDIENT_NAMES } from '@/data/ingredients';
import { BEVERAGE_NAMES } from '@/data/beverages';
import { RECIPE_NAMES } from '@/data/recipes';
import { SPECIAL_GUESTS } from '@/data/specialGuest';
import type {
	Character,
	Food,
	Ingredient,
	Recipe,
	MissionCondition,
	MissionNode,
	MissionReward,
	MissionType,
	RewardType,
	ConditionType,
	ObjectType,
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

const REWARD_TYPES: { type: RewardType; label: string }[] = [
	{ type: 'UnlockNPC', label: '【未实现】解锁NPC' },
	{ type: 'ScheduleNews', label: '【未实现】计划新闻' },
	{ type: 'DismissNews', label: '【未实现】取消被计划的新闻' },
	{ type: 'ModifyPopSystem', label: '【未实现】修改流行系统' },
	{ type: 'ToggleResourcePoint', label: '【未实现】开关采集点' },
	{
		type: 'SetGlobalGuestFundModifier',
		label: '【未实现】设置全局客人携带金额因子',
	},
	{ type: 'SetObjectPriceModifier', label: '【未实现】设置具体物品价格因子' },
	{ type: 'DismissEvents', label: '【未实现】【已弃用】取消被计划的事件' },
	{ type: 'RequestNPC', label: '【未实现】移动NPC到给定位置' },
	{ type: 'DismissNPC', label: '【未实现】将NPC移动回原位置' },
	{ type: 'AddNPCDialog', label: '【未实现】将目标对话加入给定NPC的对话池' },
	{
		type: 'RemoveNPCDialog',
		label: '【未实现】将目标对话从给定NPC的对话池移除',
	},
	{
		type: 'ToggleInteractableEntity',
		label: '【未实现】设置可互动物品的可用性',
	},
	{ type: 'UnlockMap', label: '【未实现】解锁地图' },
	{
		type: 'SetEnableInteractablesUI',
		label: '【未实现】设置按钮是否可以互动',
	},
	{
		type: 'SetIzakayaIndex',
		label: '【未实现】【已弃用】设置覆写雀食堂的ID',
	},
	{ type: 'GiveItem', label: '获得给定物品' },
	{
		type: 'SetDaySpecialNPCVisibility',
		label: '【未实现】设置白天稀有NPC的',
	},
	{ type: 'SetNPCDialog', label: '【未实现】设置NPC的对话池' },
	{ type: 'UpgradeKizunaLevel', label: '将稀客的羁绊等级提升一级' },
	{
		type: 'SetCanHaveLevel5Kizuna',
		label: '【未实现】设置玩家是否能让稀客达到5级羁绊',
	},
	{ type: 'GetFund', label: '【未实现】获得目标数量的金钱' },
	{
		type: 'ToggleSwitchEntity',
		label: '【未实现】设置任务切换物品的开启状态',
	},
	{ type: 'SetLevelCap', label: '【未实现】设置等级限制' },
	{ type: 'CouldSpawnTewi', label: '【未实现】设置是否会生成因幡帝' },
	{
		type: 'TewiSpawnTonight',
		label: '【未实现】设置当天晚上因幡帝是否会被生成',
	},
	{ type: 'AskReimuProtectYou', label: '【未实现】获得灵梦的保护' },
	{
		type: 'AddToKourindoStaticMerchandise',
		label: '【未实现】将目标物品加入香霖堂',
	},
	{ type: 'EnableMultiPartnerMode', label: '【未实现】开启多伙伴模式' },
	{ type: 'SetPartnerCount', label: '【未实现】设置可用的最大伙伴数量' },
	{ type: 'MoveToChallenge', label: '【未实现】前往给定的挑战模式' },
	{ type: 'CancelEvent', label: '【未实现】取消被计划的目标事件' },
	{ type: 'MoveToStaff', label: '【未实现】前往制作人员名单场景' },
	{
		type: 'EnableSpecialGuestSpawnInNight',
		label: '【未实现】设置稀客是否生成',
	},
	{
		type: 'EnableSGuestSpawnInTargetIzakayaById',
		label: '【未实现】设置稀客在指定雀食堂生成（通过雀食堂Id）',
	},
	{
		type: 'EnableSGuestSpawnInTargetIzakayaByMap',
		label: '【未实现】设置稀客在指定地图对应的雀食堂生成（通过地图Label）',
	},
	{
		type: 'UnlockSGuestInNotebook',
		label: '【未实现】解锁对应稀客的笔记本图鉴',
	},
	{
		type: 'SetTargetMissionFulfilled',
		label: '【未实现】使对应任务的全部条件完成',
	},
	{ type: 'UnlockMusicGameChapter', label: '【未实现】解锁音游章节' },
	{
		type: 'RemoveKourindouMerchandise',
		label: '【未实现】尝试移除香霖堂的货物',
	},
	{ type: 'FinishFakeMission', label: '【未实现】完成伪造任务' },
	{ type: 'ForceCompleteMission', label: '【未实现】强制完成计划中的任务' },
	{ type: 'RefreshRandomSpawnNpc', label: '【未实现】刷新随机生成的NPC' },
	{ type: 'AddLockedRecipe', label: '【未实现】添加固定菜谱' },
	{ type: 'ClearLockedRecipe', label: '【未实现】移除固定菜谱' },
	{ type: 'AddEffectiveSGuestMapping', label: '【未实现】添加稀客映射' },
	{ type: 'RemoveEffectiveSGuestMapping', label: '【未实现】移除稀客映射' },
	{ type: 'FinishEvent', label: '【未实现】完成目标事件' },
	{
		type: 'StartOrContinueRogueLike',
		label: '【未实现】仅白天：开始或继续RogueLike',
	},
	{
		type: 'ControlSpecialGuestScheduled',
		label: '【未实现】随机选取一位稀客加入控制计划',
	},
	{
		type: 'CancelControlSpecialGuestScheduled',
		label: '【未实现】移除控制计划中尚未被控制的稀客',
	},
	{ type: 'IgnoreSpecialGuest', label: '【未实现】指定一位稀客今晚不会到店' },
	{ type: 'AddDLCLock', label: '【未实现】添加DLC锁' },
	{ type: 'RemoveDLCLock', label: '【未实现】移除DLC锁' },
	{
		type: 'StopAllUnmanagedMovingProcess',
		label: '【未实现】停止SceneDirector中所有非托管的协程',
	},
	{
		type: 'NotifySpecialGuestSpawnInNight',
		label: '【未实现】提示稀客开始全图刷新',
	},
	{ type: 'SetAndSavePlayerPref', label: '【未实现】设置PlayerPref' },
];

interface MissionEditorProps {
	mission: MissionNode | null;
	characters: Character[];
	foods: Food[];
	ingredients: Ingredient[];
	recipes: Recipe[];
	allMissions: MissionNode[];
	onRemove: () => void;
	onUpdate: (updates: Partial<MissionNode>) => void;
}

export default memo<MissionEditorProps>(function MissionEditor({
	mission,
	characters,
	foods,
	ingredients,
	recipes,
	allMissions,
	onRemove,
	onUpdate,
}) {
	const allFoods = useMemo(() => {
		const result = [...FOOD_NAMES];
		foods.forEach((f) => {
			if (!result.find((r) => r.id === f.id)) {
				result.push({ id: f.id, name: f.name });
			}
		});
		return result.sort((a, b) => a.id - b.id);
	}, [foods]);

	const allIngredients = useMemo(() => {
		const result = [...INGREDIENT_NAMES];
		ingredients.forEach((i) => {
			if (!result.find((r) => r.id === i.id)) {
				result.push({ id: i.id, name: i.name });
			}
		});
		return result.sort((a, b) => a.id - b.id);
	}, [ingredients]);

	const allRecipes = useMemo(() => {
		const result = [...RECIPE_NAMES];
		recipes.forEach((r) => {
			if (!result.find((existing) => existing.id === r.id)) {
				const targetFood = allFoods.find((f) => f.id === r.foodId);
				const name = targetFood ? targetFood.name : `Food_${r.foodId}`;
				result.push({ id: r.id, name });
			}
		});
		return result.sort((a, b) => a.id - b.id);
	}, [recipes, allFoods]);

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
		characters.forEach((c) => {
			options.push({
				value: c.label,
				label: `[${c.id}] ${c.name} (${c.label})`,
			});
		});
		return options;
	}, [characters]);

	const addCondition = useCallback(() => {
		if (!mission) return;
		const newConditions: MissionCondition[] = [
			...(mission.finishConditions || []),
			{ conditionType: 'ServeInWork', sellableType: 'Food' },
		];
		onUpdate({ finishConditions: newConditions });
	}, [mission, onUpdate]);

	const removeCondition = useCallback(
		(index: number) => {
			if (!mission || !mission.finishConditions) return;
			const newConditions = [...mission.finishConditions];
			newConditions.splice(index, 1);
			onUpdate({ finishConditions: newConditions });
		},
		[mission, onUpdate]
	);

	const updateCondition = useCallback(
		(index: number, updates: Partial<MissionCondition>) => {
			if (!mission || !mission.finishConditions) return;
			const newConditions = [...mission.finishConditions];
			newConditions[index] = {
				...newConditions[index],
				...updates,
			} as MissionCondition;
			onUpdate({ finishConditions: newConditions });
		},
		[mission, onUpdate]
	);

	const addReward = useCallback(() => {
		if (!mission) return;
		const newRewards: MissionReward[] = [
			...(mission.rewards || []),
			{ rewardType: 'UpgradeKizunaLevel' },
		];
		onUpdate({ rewards: newRewards });
	}, [mission, onUpdate]);

	const removeReward = useCallback(
		(index: number) => {
			if (!mission || !mission.rewards) return;
			const newRewards = [...mission.rewards];
			newRewards.splice(index, 1);
			onUpdate({ rewards: newRewards });
		},
		[mission, onUpdate]
	);

	const updateReward = useCallback(
		(index: number, updates: Partial<MissionReward>) => {
			if (!mission || !mission.rewards) return;
			const newRewards = [...mission.rewards];
			newRewards[index] = {
				...newRewards[index],
				...updates,
			} as MissionReward;
			onUpdate({ rewards: newRewards });
		},
		[mission, onUpdate]
	);

	const addPostMission = useCallback(() => {
		if (!mission) return;
		const newPostMissions = [
			...(mission.postMissionsAfterPerformance || []),
			'',
		];
		onUpdate({ postMissionsAfterPerformance: newPostMissions });
	}, [mission, onUpdate]);

	const removePostMission = useCallback(
		(index: number) => {
			if (!mission || !mission.postMissionsAfterPerformance) return;
			const newPostMissions = [...mission.postMissionsAfterPerformance];
			newPostMissions.splice(index, 1);
			onUpdate({ postMissionsAfterPerformance: newPostMissions });
		},
		[mission, onUpdate]
	);

	const updatePostMission = useCallback(
		(index: number, value: string) => {
			if (!mission || !mission.postMissionsAfterPerformance) return;
			const newPostMissions = [...mission.postMissionsAfterPerformance];
			newPostMissions[index] = value;
			onUpdate({ postMissionsAfterPerformance: newPostMissions });
		},
		[mission, onUpdate]
	);

	if (!mission) {
		return (
			<div className="flex h-full items-center justify-center rounded-lg bg-white/5 p-8 text-center backdrop-blur">
				<div className="text-black/40 dark:text-white/40">
					请在左侧列表选择一个任务节点，或点击 + 按钮创建新任务节点
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6 rounded-lg bg-white/10 p-6 shadow-md backdrop-blur">
			<div className="flex items-center justify-between border-b border-black/10 pb-4 dark:border-white/10">
				<h2 className="text-2xl font-bold">任务节点编辑(尚未完成)</h2>
				<button
					onClick={onRemove}
					className="btn-mystia-secondary bg-danger text-white hover:bg-danger/80"
				>
					删除任务
				</button>
			</div>

			<div className="grid grid-cols-1 gap-6">
				<div className="flex flex-col gap-2">
					<label className="font-medium text-foreground">Title</label>
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
						<button
							onClick={() => {
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
							className="btn-mystia h-8 px-3"
							title="根据第一个完成条件生成标题和描述"
						>
							🔄
						</button>
					</div>
				</div>

				<div className="flex flex-col gap-2">
					<label className="font-medium text-foreground">
						Description
					</label>
					<textarea
						rows={3}
						value={mission.description || ''}
						onChange={(e) =>
							onUpdate({ description: e.target.value })
						}
						className="rounded-lg border border-black/10 bg-black/5 px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-white/10 dark:bg-white/5"
						placeholder="任务描述（可选）"
					/>
				</div>

				<div className="flex flex-col gap-2">
					<label className="font-medium text-foreground">Label</label>
					<input
						type="text"
						value={mission.label || ''}
						onChange={(e) => onUpdate({ label: e.target.value })}
						className="rounded-lg border border-black/10 bg-black/5 px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-white/10 dark:bg-white/5"
						placeholder="例如：Kizuna_Rumia_LV3_Upgrade_001_Mission"
					/>
				</div>

				<div className="flex flex-col gap-2">
					<label className="font-medium text-foreground">
						Mission Type
					</label>
					<select
						value={mission.missionType}
						onChange={(e) =>
							onUpdate({
								missionType: e.target.value as MissionType,
							})
						}
						className="rounded-lg border border-black/10 bg-black/5 px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-white/10 dark:bg-white/5"
					>
						<option value="Kitsuna">Kitsuna</option>
						<option value="Main">Main</option>
						<option value="Side">Side</option>
					</select>
				</div>

				<div className="flex flex-col gap-2">
					<label className="font-medium text-foreground">
						委托自(Sender)
					</label>
					<select
						value={mission.sender || ''}
						onChange={(e) => onUpdate({ sender: e.target.value })}
						className="rounded-lg border border-black/10 bg-black/5 px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-white/10 dark:bg-white/5"
					>
						<option value="">请选择角色...</option>
						{characterOptions.map((opt) => (
							<option key={opt.value} value={opt.value}>
								{opt.label}
							</option>
						))}
					</select>
				</div>

				<div className="flex flex-col gap-2">
					<label className="font-medium text-foreground">
						交付至(Receiver)
					</label>
					<select
						value={mission.reciever || ''}
						onChange={(e) => onUpdate({ reciever: e.target.value })} // ignore: typo
						className="rounded-lg border border-black/10 bg-black/5 px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-white/10 dark:bg-white/5"
					>
						<option value="">请选择角色...</option>
						{characterOptions.map((opt) => (
							<option key={opt.value} value={opt.value}>
								{opt.label}
							</option>
						))}
					</select>
				</div>

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
												<option
													key={t.type}
													value={t.type}
												>
													{t.label} ({t.type})
												</option>
											))}
										</select>
										<button
											onClick={() =>
												removeCondition(index)
											}
											className="btn-mystia text-xs text-danger hover:bg-danger/10"
										>
											删除
										</button>
									</div>

									{condition.conditionType ===
										'ServeInWork' && (
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
													value={
														condition.label || ''
													}
													onChange={(e) =>
														updateCondition(index, {
															label: e.target
																.value,
														})
													}
													className="rounded border border-black/10 bg-white/50 px-2 py-1 text-sm focus:border-primary focus:outline-none dark:border-white/10 dark:bg-black/50"
												>
													<option value="">
														请选择角色...
													</option>
													{characterOptions.map(
														(opt) => (
															<option
																key={opt.value}
																value={
																	opt.value
																}
															>
																{opt.label}
															</option>
														)
													)}
												</select>
											</div>

											<div className="flex flex-col gap-1">
												<label className="text-xs font-medium opacity-70">
													指定料理 (Food ID)
												</label>
												<select
													value={
														condition.amount || ''
													}
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

									{condition.conditionType !==
										'ServeInWork' && (
										<div className="rounded bg-yellow-500/10 p-2 text-xs text-yellow-600 dark:text-yellow-400">
											⚠
											当前编辑器尚未支持配置此条件的详细参数
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

				<div className="flex flex-col gap-4">
					<div className="flex items-center justify-between">
						<label className="font-medium text-foreground">
							Rewards ({mission.rewards?.length || 0})
						</label>
						<button
							onClick={addReward}
							className="btn-mystia-primary h-8 px-3 text-sm"
						>
							+ 添加奖励
						</button>
					</div>
					<div className="flex flex-col gap-3">
						{(mission.rewards || []).map((reward, index) => (
							<div
								key={index}
								className="flex flex-col gap-3 rounded-lg border border-black/5 bg-black/5 p-4 dark:border-white/5 dark:bg-white/5"
							>
								<div className="flex items-center justify-between gap-4">
									<select
										value={reward.rewardType}
										onChange={(e) =>
											updateReward(index, {
												rewardType: e.target
													.value as RewardType,
											})
										}
										className="flex-1 rounded border border-black/10 bg-transparent px-2 py-1 text-sm focus:border-primary focus:outline-none dark:border-white/10"
									>
										{REWARD_TYPES.map((t) => (
											<option key={t.type} value={t.type}>
												{t.label} ({t.type})
											</option>
										))}
									</select>
									<button
										onClick={() => removeReward(index)}
										className="btn-mystia text-xs text-danger hover:bg-danger/10"
									>
										删除
									</button>
								</div>

								{reward.rewardType === 'GiveItem' && (
									<div className="flex flex-col gap-3 rounded bg-black/5 p-2 dark:bg-white/5">
										<div className="flex flex-col gap-1">
											<label className="text-xs font-medium opacity-70">
												物品类型 (Object Type)
											</label>
											<select
												value={
													reward.objectType || 'Food'
												}
												onChange={(e) =>
													updateReward(index, {
														objectType: e.target
															.value as ObjectType,
														rewardIntArray: [],
													})
												}
												className="rounded border border-black/10 bg-white/50 px-2 py-1 text-sm focus:border-primary focus:outline-none dark:border-white/10 dark:bg-black/50"
											>
												{[
													'Food',
													'Ingredient',
													'Beverage',
													'Recipe',
													'Item',
													'Izakaya',
													'Partner',
													'Badge',
													'Cooker',
												].map((type) => (
													<option
														key={type}
														value={type}
													>
														{type}
													</option>
												))}
											</select>
											{![
												'Food',
												'Ingredient',
												'Beverage',
												'Recipe',
											].includes(
												reward.objectType || 'Food'
											) && (
												<div className="text-xs text-yellow-600 dark:text-yellow-400">
													⚠{' '}
													此类型尚未完全支持，可能会出现不可预期的行为
												</div>
											)}
										</div>

										<div className="flex flex-col gap-1">
											<label className="text-xs font-medium opacity-70">
												物品列表 (Item List)
											</label>
											<div className="flex flex-wrap gap-2 text-xs">
												{(
													reward.rewardIntArray || []
												).map((itemId, i) => {
													let name = `ID: ${itemId}`;
													const type =
														reward.objectType ||
														'Food';
													if (type === 'Food') {
														name =
															allFoods.find(
																(f) =>
																	f.id ===
																	itemId
															)?.name || name;
													} else if (
														type === 'Ingredient'
													) {
														name =
															allIngredients.find(
																(ing) =>
																	ing.id ===
																	itemId
															)?.name || name;
													} else if (
														type === 'Beverage'
													) {
														name =
															BEVERAGE_NAMES.find(
																(bev) =>
																	bev.id ===
																	itemId
															)?.name || name;
													} else if (
														type === 'Recipe'
													) {
														const r =
															allRecipes.find(
																(x) =>
																	x.id ===
																	itemId
															);
														if (r) {
															name = `菜谱: ${r.name}`;
														}
													}

													return (
														<span
															key={i}
															className="flex items-center gap-1 rounded bg-primary/10 px-2 py-1 text-primary"
														>
															{name}
															<button
																onClick={() => {
																	const newArray =
																		[
																			...(reward.rewardIntArray ||
																				[]),
																		];
																	newArray.splice(
																		i,
																		1
																	);
																	updateReward(
																		index,
																		{
																			rewardIntArray:
																				newArray,
																		}
																	);
																}}
																className="ml-1 text-xs opacity-50 hover:opacity-100"
															>
																×
															</button>
														</span>
													);
												})}
											</div>
											<div className="mt-2 flex items-center gap-2">
												<select
													id={`add-item-select-${index}`}
													className="flex-1 rounded border border-black/10 bg-white/50 px-2 py-1 text-sm focus:border-primary focus:outline-none dark:border-white/10 dark:bg-black/50"
												>
													<option value="">
														选择物品...
													</option>
													{(reward.objectType ===
														'Food' ||
														!reward.objectType) &&
														allFoods.map((f) => (
															<option
																key={f.id}
																value={f.id}
															>
																[{f.id}]{' '}
																{f.name}
															</option>
														))}
													{reward.objectType ===
														'Ingredient' &&
														allIngredients.map(
															(ing) => (
																<option
																	key={ing.id}
																	value={
																		ing.id
																	}
																>
																	[{ing.id}]{' '}
																	{ing.name}
																</option>
															)
														)}
													{reward.objectType ===
														'Beverage' &&
														BEVERAGE_NAMES.map(
															(bev) => (
																<option
																	key={bev.id}
																	value={
																		bev.id
																	}
																>
																	[{bev.id}]{' '}
																	{bev.name}
																</option>
															)
														)}
													{reward.objectType ===
														'Recipe' &&
														allRecipes.map(
															(rec) => (
																<option
																	key={rec.id}
																	value={
																		rec.id
																	}
																>
																	[{rec.id}]{' '}
																	{rec.name}
																</option>
															)
														)}
												</select>
												<input
													type="number"
													id={`add-item-count-${index}`}
													className="w-16 rounded border border-black/10 bg-white/50 px-2 py-1 text-sm focus:border-primary focus:outline-none dark:border-white/10 dark:bg-black/50"
													placeholder="数量"
													defaultValue={1}
													min={1}
												/>
												<button
													onClick={() => {
														const select =
															document.getElementById(
																`add-item-select-${index}`
															) as HTMLSelectElement;
														const countInput =
															document.getElementById(
																`add-item-count-${index}`
															) as HTMLInputElement;
														const val = parseInt(
															select.value
														);
														const count =
															parseInt(
																countInput.value
															) || 1;

														if (!isNaN(val)) {
															const newItems =
																Array(
																	count
																).fill(val);
															updateReward(
																index,
																{
																	rewardIntArray:
																		[
																			...(reward.rewardIntArray ||
																				[]),
																			...newItems,
																		],
																}
															);
															// Reset count to 1 for convenience
															countInput.value =
																'1';
														}
													}}
													className="btn-mystia h-full px-3 text-sm"
												>
													添加
												</button>
											</div>
										</div>
									</div>
								)}

								{reward.rewardType === 'UpgradeKizunaLevel' && (
									<div className="flex flex-col gap-1">
										<label className="text-xs font-medium opacity-70">
											目标角色 (Reward ID)
										</label>
										<select
											value={reward.rewardId || ''}
											onChange={(e) =>
												updateReward(index, {
													rewardId: e.target.value,
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
								)}

								{reward.rewardType !== 'UpgradeKizunaLevel' &&
									reward.rewardType !== 'GiveItem' && (
										<div className="rounded bg-yellow-500/10 p-2 text-xs text-yellow-600 dark:text-yellow-400">
											⚠
											当前编辑器尚未支持配置此奖励类型的详细参数
										</div>
									)}
							</div>
						))}
						{(!mission.rewards || mission.rewards.length === 0) && (
							<p className="text-center text-sm text-black/40 dark:text-white/40">
								暂无奖励配置
							</p>
						)}
					</div>
				</div>

				{/* Post Missions */}
				<div className="flex flex-col gap-4">
					<div className="flex items-center justify-between">
						<label className="font-medium text-foreground">
							后继任务 (
							{mission.postMissionsAfterPerformance?.length || 0})
						</label>
						<button
							onClick={addPostMission}
							className="btn-mystia-primary h-8 px-3 text-sm"
						>
							+ 添加后继任务
						</button>
					</div>
					<div className="flex flex-col gap-3">
						{(mission.postMissionsAfterPerformance || []).map(
							(pm, index) => (
								<div
									key={index}
									className="flex flex-col gap-3 rounded-lg border border-black/5 bg-black/5 p-4 dark:border-white/5 dark:bg-white/5"
								>
									<div className="flex items-center justify-between gap-4">
										<div className="flex flex-1 flex-col gap-1">
											<label className="text-xs font-medium opacity-70">
												任务 Label
											</label>
											<select
												value={pm}
												onChange={(e) =>
													updatePostMission(
														index,
														e.target.value
													)
												}
												className="rounded border border-black/10 bg-transparent px-2 py-1 text-sm focus:border-primary focus:outline-none dark:border-white/10"
											>
												<option value="">
													请选择任务...
												</option>
												{allMissions.map((m) => (
													<option
														key={m.label}
														value={m.label}
													>
														{m.title || m.label} (
														{m.label})
													</option>
												))}
											</select>
										</div>
										<button
											onClick={() =>
												removePostMission(index)
											}
											className="btn-mystia text-xs text-danger hover:bg-danger/10"
										>
											删除
										</button>
									</div>
								</div>
							)
						)}
						{(!mission.postMissionsAfterPerformance ||
							mission.postMissionsAfterPerformance.length ===
								0) && (
							<p className="text-center text-sm text-black/40 dark:text-white/40">
								暂无后继任务配置
							</p>
						)}
					</div>
				</div>
			</div>
		</div>
	);
});
