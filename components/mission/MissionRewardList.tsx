import { memo, useCallback } from 'react';
import { EditorField } from '@/components/EditorField';
import { WarningNotice } from '@/components/WarningNotice';
import type { MissionReward, ObjectType, RewardType } from '@/types/resource';
import { BEVERAGE_NAMES } from '@/data/beverages';

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

interface MissionRewardListProps {
	title?: string;
	rewards: MissionReward[];
	characterOptions: { value: string; label: string }[];
	allFoods: { id: number; name: string }[];
	allIngredients: { id: number; name: string }[];
	allRecipes: { id: number; name: string }[];
	onUpdate: (rewards: MissionReward[]) => void;
}

export const MissionRewardList = memo<MissionRewardListProps>(
	function MissionRewardList({
		title = 'Rewards',
		rewards,
		characterOptions,
		allFoods,
		allIngredients,
		allRecipes,
		onUpdate,
	}) {
		const addReward = useCallback(() => {
			const newRewards: MissionReward[] = [
				...(rewards || []),
				{ rewardType: 'UpgradeKizunaLevel' },
			];
			onUpdate(newRewards);
		}, [rewards, onUpdate]);

		const removeReward = useCallback(
			(index: number) => {
				if (!rewards) return;
				const newRewards = [...rewards];
				newRewards.splice(index, 1);
				onUpdate(newRewards);
			},
			[rewards, onUpdate]
		);

		const updateReward = useCallback(
			(index: number, updates: Partial<MissionReward>) => {
				if (!rewards) return;
				const newRewards = [...rewards];
				newRewards[index] = {
					...newRewards[index],
					...updates,
				} as MissionReward;
				onUpdate(newRewards);
			},
			[rewards, onUpdate]
		);

		return (
			<EditorField
				className="gap-4"
				label={`${title} (${rewards?.length || 0})`}
				actions={
					<button
						onClick={addReward}
						className="btn-mystia-primary h-8 px-3 text-sm"
					>
						+ 添加奖励
					</button>
				}
			>
				<div className="flex flex-col gap-3">
					{(rewards || []).map((reward, index) => (
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
											value={reward.objectType || 'Food'}
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
												<option key={type} value={type}>
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
											{(reward.rewardIntArray || []).map(
												(itemId, i) => {
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
												}
											)}
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
															[{f.id}] {f.name}
														</option>
													))}
												{reward.objectType ===
													'Ingredient' &&
													allIngredients.map(
														(ing) => (
															<option
																key={ing.id}
																value={ing.id}
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
																value={bev.id}
															>
																[{bev.id}]{' '}
																{bev.name}
															</option>
														)
													)}
												{reward.objectType ===
													'Recipe' &&
													allRecipes.map((rec) => (
														<option
															key={rec.id}
															value={rec.id}
														>
															[{rec.id}]{' '}
															{rec.name}
														</option>
													))}
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
															Array(count).fill(
																val
															);
														updateReward(index, {
															rewardIntArray: [
																...(reward.rewardIntArray ||
																	[]),
																...newItems,
															],
														});
														// Reset count to 1 for convenience
														countInput.value = '1';
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
										<option value="">请选择角色...</option>
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
									<WarningNotice>
										⚠
										当前编辑器尚未支持配置此奖励类型的详细参数
									</WarningNotice>
								)}
						</div>
					))}
					{(!rewards || rewards.length === 0) && (
						<p className="text-center text-sm text-black/40 dark:text-white/40">
							暂无奖励配置
						</p>
					)}
				</div>
			</EditorField>
		);
	}
);
