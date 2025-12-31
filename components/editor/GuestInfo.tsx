import { useState } from 'react';
import { GuestInfo, FoodRequest, SpawnConfig } from '@/types/resource';
import { BEVERAGE_TAGS, FOOD_TAGS, FOOD_TAG_MAP } from '@/data/tags';
import { IZAKAYAS } from '@/data/izakayas';
import { cn } from '@/lib';

interface GuestInfoProps {
	guest: GuestInfo | undefined;
	onUpdate: (updates: Partial<GuestInfo>) => void;
	onEnable: () => void;
	onDisable: () => void;
}

export function GuestInfoEditor({
	guest,
	onUpdate,
	onEnable,
	onDisable,
}: GuestInfoProps) {
	const [isExpanded, setIsExpanded] = useState(false);

	const toggleLikeTag = (
		field: 'likeFoodTag' | 'likeBevTag',
		tagId: number
	) => {
		if (!guest) return;

		const currentTags = guest[field] || [];
		const exists = currentTags.find((t) => t.tagId === tagId);

		let newTags;
		let newFoodRequests = [...(guest.foodRequests || [])];

		if (exists) {
			newTags = currentTags.filter((t) => t.tagId !== tagId);
		} else {
			newTags = [...currentTags, { tagId, weight: 1 }];
			if (field === 'likeFoodTag') {
				const existingReq = newFoodRequests.find(
					(r) => r.tagId === tagId
				);
				if (!existingReq) {
					newFoodRequests.push({ tagId, request: '', enabled: true });
				}
			}
		}

		onUpdate({ [field]: newTags, foodRequests: newFoodRequests });
	};

	const toggleHateTag = (tagId: number) => {
		if (!guest) return;

		const currentTags = guest.hateFoodTag || [];
		const exists = currentTags.includes(tagId);

		let newTags;
		if (exists) {
			newTags = currentTags.filter((id) => id !== tagId);
		} else {
			newTags = [...currentTags, tagId];
		}

		onUpdate({ hateFoodTag: newTags });
	};

	const updateFoodRequest = (
		requestIndex: number,
		updates: Partial<FoodRequest>
	) => {
		if (!guest) return;
		const newRequests = [...(guest.foodRequests || [])];
		newRequests[requestIndex] = {
			...newRequests[requestIndex],
			...updates,
		} as FoodRequest;
		onUpdate({ foodRequests: newRequests });
	};

	const updateEvaluation = (evalIndex: number, value: string) => {
		const currentEval = guest?.evaluation || Array(9).fill('');
		const newEval = [...currentEval];
		newEval[evalIndex] = value;
		onUpdate({ evaluation: newEval });
	};

	const addConversation = () => {
		if (!guest) return;
		const newConv = [...(guest.conversation || []), ''];
		onUpdate({ conversation: newConv });
	};

	const updateConversation = (convIndex: number, value: string) => {
		if (!guest || !guest.conversation) return;
		const newConv = [...guest.conversation];
		newConv[convIndex] = value;
		onUpdate({ conversation: newConv });
	};

	const removeConversation = (convIndex: number) => {
		if (!guest || !guest.conversation) return;
		const newConv = [...guest.conversation];
		newConv.splice(convIndex, 1);
		onUpdate({ conversation: newConv });
	};

	const toggleSpawn = (izakayaId: number) => {
		if (!guest) return;

		const currentSpawns = guest.spawn || [];
		const exists = currentSpawns.find((s) => s.izakayaId === izakayaId);

		let newSpawns;
		if (exists) {
			newSpawns = currentSpawns.filter((s) => s.izakayaId !== izakayaId);
		} else {
			newSpawns = [
				...currentSpawns,
				{
					izakayaId,
					relativeProb: 0,
					onlySpawnAfterUnlocking: false,
					onlySpawnWhenPlaceBeRecorded: false,
				},
			];
		}

		onUpdate({ spawn: newSpawns });
	};

	const updateSpawn = (izakayaId: number, updates: Partial<SpawnConfig>) => {
		if (!guest?.spawn) return;

		const newSpawns = guest.spawn.map((s) =>
			s.izakayaId === izakayaId ? { ...s, ...updates } : s
		);

		onUpdate({ spawn: newSpawns });
	};

	return (
		<div className="flex flex-col gap-4">
			<div className="ml-1 flex items-center justify-between">
				<div
					className="flex cursor-pointer select-none items-center gap-2"
					onClick={() => setIsExpanded(!isExpanded)}
				>
					<span
						className={cn(
							'transition-transform duration-200',
							isExpanded && 'rotate-90'
						)}
					>
						▶
					</span>
					<label className="cursor-pointer text-sm font-bold opacity-70">
						顾客配置 (Guest Info)
					</label>
				</div>
				<button
					onClick={() => {
						if (guest) {
							onDisable();
						} else {
							onEnable();
						}
					}}
					className={cn(
						'rounded-lg border px-3 py-1 text-xs transition-all active:scale-95',
						guest
							? 'border-danger/20 bg-danger/10 text-danger hover:bg-danger/20'
							: 'border-white/10 bg-white/10 hover:bg-white/20'
					)}
				>
					{guest ? '移除顾客配置' : '启用顾客配置'}
				</button>
			</div>

			{isExpanded && guest && (
				<div className="animate-in fade-in slide-in-from-top-2 flex flex-col gap-6 rounded-2xl border border-white/5 bg-black/5 p-6 duration-200">
					{guest.likeFoodTag.some((lt) =>
						guest?.hateFoodTag.includes(lt.tagId)
					) && (
						<div className="flex animate-pulse items-center gap-3 rounded-xl border border-danger/50 bg-danger/20 p-3 text-xs font-bold text-danger">
							<span className="text-lg">⚠️</span>
							检测到标签冲突：某些食物标签同时存在于“喜爱”和“厌恶”列表中。
						</div>
					)}
					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
						<div className="flex flex-col gap-2">
							<label className="ml-1 text-sm font-bold opacity-70">
								携带金钱下限 (Lower)
							</label>
							<input
								type="number"
								value={guest.fundRangeLower}
								onChange={(e) =>
									onUpdate({
										fundRangeLower:
											parseInt(e.target.value) || 0,
									})
								}
								className="rounded-xl border border-white/10 bg-black/20 p-3 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
							/>
						</div>
						<div className="flex flex-col gap-2">
							<label className="ml-1 text-sm font-bold opacity-70">
								携带金钱上限 (Upper)
							</label>
							<input
								type="number"
								value={guest.fundRangeUpper}
								onChange={(e) =>
									onUpdate({
										fundRangeUpper:
											parseInt(e.target.value) || 0,
									})
								}
								className="rounded-xl border border-white/10 bg-black/20 p-3 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
							/>
						</div>
					</div>

					<div className="flex flex-col gap-4">
						<label className="ml-1 text-sm font-bold opacity-70">
							评价文本 (Evaluations)
						</label>
						<div className="grid grid-cols-1 gap-3">
							{[
								'黑评',
								'紫评',
								'绿评',
								'橙评',
								'粉评',
								'大额爆预算',
								'小额爆预算',
								'被驱赶',
								'评价驱赶',
							].map((label, i) => (
								<div key={i} className="flex flex-col gap-1">
									<label className="ml-1 text-[10px] font-bold opacity-50">
										{label}
									</label>
									<input
										type="text"
										value={guest?.evaluation[i] || ''}
										onChange={(e) =>
											updateEvaluation(i, e.target.value)
										}
										placeholder={`请输入${label}文本...`}
										className="rounded-lg border border-white/10 bg-black/20 p-2 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-primary/50"
									/>
								</div>
							))}
						</div>
					</div>

					<div className="flex flex-col gap-4">
						<div className="ml-1 flex items-center justify-between">
							<label className="text-sm font-bold opacity-70">
								闲聊文本 (Conversations)
							</label>
							<button
								onClick={addConversation}
								className="rounded border border-white/10 bg-white/10 px-2 py-1 text-[10px] transition-all hover:bg-white/20"
							>
								+ 添加闲聊
							</button>
						</div>
						<div className="flex flex-col gap-2">
							{guest?.conversation?.map((conv, i) => (
								<div key={i} className="flex gap-2">
									<input
										type="text"
										value={conv}
										onChange={(e) =>
											updateConversation(
												i,
												e.target.value
											)
										}
										placeholder="请输入闲聊文本..."
										className="flex-1 rounded-lg border border-white/10 bg-black/20 p-2 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-primary/50"
									/>
									<button
										onClick={() => removeConversation(i)}
										className="flex h-9 w-9 items-center justify-center rounded-lg border border-danger/20 bg-danger/10 text-danger transition-all hover:bg-danger/20"
									>
										×
									</button>
								</div>
							))}
							{(guest?.conversation?.length || 0) === 0 && (
								<div className="rounded-xl border border-dashed border-white/5 py-4 text-center text-xs opacity-30">
									暂无闲聊文本
								</div>
							)}
						</div>
					</div>

					<div className="flex flex-col gap-6">
						<div className="flex flex-col gap-3">
							<div className="ml-1 flex items-center justify-between">
								<label className="text-sm font-bold opacity-70">
									喜爱食物标签 (Like Food Tags)
								</label>
							</div>
							<div className="flex flex-wrap gap-2 rounded-xl border border-white/10 bg-black/20 p-4">
								{FOOD_TAGS.map((tag) => {
									const isSelected = guest?.likeFoodTag.some(
										(t) => t.tagId === tag.id
									);
									const isConflict =
										isSelected &&
										guest?.hateFoodTag.includes(tag.id);
									return (
										<button
											key={tag.id}
											onClick={() =>
												toggleLikeTag(
													'likeFoodTag',
													tag.id
												)
											}
											className={cn(
												'relative flex items-center border px-1.5 py-0.5 text-[11px] font-bold transition-all',
												isSelected
													? isConflict
														? 'border-danger bg-danger/40 text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]'
														: 'border-[#9d5437] bg-[#e6b4a6] text-[#830000]'
													: 'border-white/20 bg-white/10 text-black hover:bg-white/20'
											)}
											title={
												isConflict
													? '冲突：该标签同时存在于喜爱和厌恶列表中'
													: ''
											}
										>
											<span
												className={cn(
													'mr-1 transition-opacity',
													isSelected
														? 'opacity-100'
														: 'opacity-40'
												)}
											>
												⦁
											</span>
											{tag.name}
											{isConflict && (
												<span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full border border-white/20 bg-danger text-[10px] text-white shadow-lg">
													!
												</span>
											)}
										</button>
									);
								})}
							</div>
						</div>

						<div className="flex flex-col gap-3">
							<label className="ml-1 text-sm font-bold text-danger opacity-70">
								厌恶食物标签 (Hate Food Tags)
							</label>
							<div className="flex flex-wrap gap-2 rounded-xl border border-white/10 bg-black/20 p-4">
								{FOOD_TAGS.map((tag) => {
									const isSelected =
										guest?.hateFoodTag.includes(tag.id);
									const isConflict =
										isSelected &&
										guest?.likeFoodTag.some(
											(t) => t.tagId === tag.id
										);
									return (
										<button
											key={tag.id}
											onClick={() =>
												toggleHateTag(tag.id)
											}
											className={cn(
												'relative flex items-center border px-1.5 py-0.5 text-[11px] font-bold transition-all',
												isSelected
													? isConflict
														? 'border-danger bg-danger/40 text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]'
														: 'border-danger bg-danger/10 text-danger'
													: 'border-white/20 bg-white/10 text-black hover:bg-white/20'
											)}
											title={
												isConflict
													? '冲突：该标签同时存在于喜爱和厌恶列表中'
													: ''
											}
										>
											{tag.name}
											<span
												className={cn(
													'ml-1 transition-opacity',
													isSelected
														? 'opacity-100'
														: 'opacity-40'
												)}
											>
												✘
											</span>
											{isConflict && (
												<span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full border border-white/20 bg-danger text-[10px] text-white shadow-lg">
													!
												</span>
											)}
										</button>
									);
								})}
							</div>
						</div>

						<div className="flex flex-col gap-3">
							<label className="ml-1 text-sm font-bold text-primary opacity-70">
								喜爱酒水标签 (Like Beverage Tags)
							</label>
							<div className="flex flex-wrap gap-2 rounded-xl border border-white/10 bg-black/20 p-4">
								{BEVERAGE_TAGS.map((tag) => {
									const isSelected = guest?.likeBevTag.some(
										(t) => t.tagId === tag.id
									);
									return (
										<button
											key={tag.id}
											onClick={() =>
												toggleLikeTag(
													'likeBevTag',
													tag.id
												)
											}
											className={cn(
												'relative flex items-center border px-1.5 py-0.5 text-[11px] font-bold transition-all',
												isSelected
													? 'border-[#6f929b] bg-[#b0cfd7] text-[#a45c22]'
													: 'border-white/20 bg-white/10 text-black hover:bg-white/20'
											)}
										>
											<span
												className={cn(
													'mr-1 transition-opacity',
													isSelected
														? 'opacity-100'
														: 'opacity-40'
												)}
											>
												⦁
											</span>
											{tag.name}
										</button>
									);
								})}
							</div>
						</div>
					</div>

					<div className="flex flex-col gap-4">
						<div className="ml-1 flex items-center justify-between">
							<label className="text-sm font-bold opacity-70">
								特殊食物请求 (Food Requests)
							</label>
							<span className="text-[10px] italic opacity-40">
								根据上方喜爱食物自动同步
							</span>
						</div>
						<div className="grid grid-cols-1 gap-3">
							{guest?.foodRequests
								.filter((req) =>
									guest?.likeFoodTag.some(
										(t) => t.tagId === req.tagId
									)
								)
								.sort((a, b) => a.tagId - b.tagId)
								.map((req) => (
									<div
										key={req.tagId}
										className={cn(
											'flex items-center gap-3 rounded-xl border p-3 transition-all',
											req.enabled !== false
												? 'border-white/5 bg-black/10'
												: 'border-transparent bg-black/5 opacity-50'
										)}
									>
										<div className="flex w-32 flex-shrink-0 items-center gap-3">
											<input
												type="checkbox"
												checked={req.enabled !== false}
												onChange={(e) => {
													const realIndex =
														guest!.foodRequests.findIndex(
															(r) =>
																r.tagId ===
																req.tagId
														);
													updateFoodRequest(
														realIndex,
														{
															enabled:
																e.target
																	.checked,
														}
													);
												}}
												className="h-4 w-4 rounded border-white/10 bg-black/20 text-primary focus:ring-primary/50"
											/>
											<div
												className={cn(
													'border px-1.5 py-0.5 text-[11px] font-medium transition-colors',
													req.enabled !== false
														? 'border-[#9d5437] bg-[#e6b4a6] text-[#830000]'
														: 'border-white/10 bg-white/5 text-white/40'
												)}
											>
												<span className="mr-1">⦁</span>
												{FOOD_TAG_MAP[req.tagId] ||
													req.tagId}
											</div>
										</div>
										<div className="flex flex-1 flex-col gap-1">
											<input
												type="text"
												value={req.request}
												disabled={req.enabled === false}
												onChange={(e) => {
													const realIndex =
														guest!.foodRequests.findIndex(
															(r) =>
																r.tagId ===
																req.tagId
														);
													updateFoodRequest(
														realIndex,
														{
															request:
																e.target.value,
														}
													);
												}}
												className="rounded-lg border border-white/10 bg-black/20 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 disabled:opacity-30"
												placeholder={
													req.enabled === false
														? '已禁用'
														: `请输入对“${FOOD_TAG_MAP[req.tagId]}”的请求文本...`
												}
											/>
										</div>
									</div>
								))}
							{(!guest?.foodRequests ||
								guest.foodRequests.filter((req) =>
									guest?.likeFoodTag.some(
										(t) => t.tagId === req.tagId
									)
								).length === 0) && (
								<div className="rounded-xl border-2 border-dashed border-white/5 py-4 text-center text-sm opacity-30">
									请先在上方选择喜爱食物标签
								</div>
							)}
						</div>
					</div>

					<div className="flex flex-col gap-4">
						<label className="ml-1 text-sm font-bold opacity-70">
							出没地点 (Spawn Locations)
						</label>
						<div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-black/20 p-4">
							<div className="flex flex-wrap gap-2">
								{IZAKAYAS.map((izakaya) => {
									const isSelected = guest?.spawn?.some(
										(s) => s.izakayaId === izakaya.id
									);
									return (
										<button
											key={izakaya.id}
											onClick={() =>
												toggleSpawn(izakaya.id)
											}
											className={cn(
												'flex items-center rounded-lg border px-3 py-1.5 text-[11px] font-medium transition-all',
												isSelected
													? 'border-primary bg-primary/20 text-black shadow-[0_0_10px_rgba(var(--primary-rgb),0.2)]'
													: 'border-white/10 bg-white/5 text-black hover:bg-white/10'
											)}
										>
											<span className="mr-1.5 opacity-50">
												({izakaya.id})
											</span>
											{izakaya.name}
										</button>
									);
								})}
							</div>

							{guest?.spawn && guest.spawn.length > 0 && (
								<div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-4">
									{guest.spawn.map((spawn) => {
										const izakaya = IZAKAYAS.find(
											(i) => i.id === spawn.izakayaId
										);
										return (
											<div
												key={spawn.izakayaId}
												className="flex items-center gap-4 rounded-lg border border-white/5 bg-white/5 p-3"
											>
												<div className="w-32 shrink-0 text-[11px] font-bold">
													<span className="mr-1 opacity-50">
														({spawn.izakayaId})
													</span>
													{izakaya?.name}
												</div>
												<div className="flex flex-1 items-center gap-6">
													<div className="flex flex-1 flex-col gap-1">
														<div className="flex items-center justify-between">
															<label className="text-[10px] opacity-70">
																相对概率
															</label>
															<span className="text-[10px] opacity-50">
																{
																	spawn.relativeProb
																}
															</span>
														</div>
														<div className="flex items-center gap-2">
															<input
																type="range"
																min="0"
																max="1"
																step="0.01"
																value={
																	spawn.relativeProb
																}
																onChange={(e) =>
																	updateSpawn(
																		spawn.izakayaId,
																		{
																			relativeProb:
																				parseFloat(
																					e
																						.target
																						.value
																				) ||
																				0,
																		}
																	)
																}
																className="h-1 flex-1 cursor-pointer appearance-none rounded-lg bg-white/10 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
															/>
															<input
																type="number"
																step="0.01"
																value={
																	spawn.relativeProb
																}
																onChange={(e) =>
																	updateSpawn(
																		spawn.izakayaId,
																		{
																			relativeProb:
																				parseFloat(
																					e
																						.target
																						.value
																				) ||
																				0,
																		}
																	)
																}
																className="w-12 rounded border border-white/10 bg-black/20 px-1 py-0.5 text-center text-[10px] focus:outline-none focus:ring-1 focus:ring-primary/50"
															/>
														</div>
													</div>
													<div className="flex gap-4">
														<div className="flex flex-col items-center gap-1">
															<label className="text-[10px] opacity-70">
																解锁后出现
															</label>
															<input
																type="checkbox"
																checked={
																	spawn.onlySpawnAfterUnlocking
																}
																onChange={(e) =>
																	updateSpawn(
																		spawn.izakayaId,
																		{
																			onlySpawnAfterUnlocking:
																				e
																					.target
																					.checked,
																		}
																	)
																}
																className="rounded border-white/20 bg-black/20 text-primary focus:ring-0"
															/>
														</div>
														<div className="flex flex-col items-center gap-1">
															<label className="text-[10px] opacity-70">
																记录后出现
															</label>
															<input
																type="checkbox"
																checked={
																	spawn.onlySpawnWhenPlaceBeRecorded
																}
																onChange={(e) =>
																	updateSpawn(
																		spawn.izakayaId,
																		{
																			onlySpawnWhenPlaceBeRecorded:
																				e
																					.target
																					.checked,
																		}
																	)
																}
																className="rounded border-white/20 bg-black/20 text-primary focus:ring-0"
															/>
														</div>
													</div>
												</div>
											</div>
										);
									})}
								</div>
							)}
						</div>
					</div>
				</div>
			)}
			{isExpanded && !guest && (
				<div className="rounded-xl border-2 border-dashed border-white/5 py-8 text-center text-sm opacity-30">
					该角色尚未启用顾客配置
				</div>
			)}
		</div>
	);
}
