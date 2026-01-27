'use client';

import { memo, useMemo } from 'react';
import { BEVERAGE_NAMES } from '@/data/beverages';
import { FOOD_NAMES } from '@/data/foods';
import { INGREDIENT_NAMES } from '@/data/ingredients';
import { RECIPE_NAMES } from '@/data/recipes';
import { SPECIAL_GUESTS } from '@/data/specialGuest';
import type {
	Character,
	Food,
	Ingredient,
	Beverage,
	Recipe,
	MissionNode,
	EventNode,
	DialogPackage,
} from '@/types/resource';
import { MissionBasicInfo } from './mission/MissionBasicInfo';
import { MissionConditionList } from './mission/MissionConditionList';
import { MissionRewardList } from './mission/MissionRewardList';
import { PostMissionList } from './PostMissionList';
import { PostEventList } from './PostEventList';
import { EventDataEditor } from './ScheduledEvent/EventDataEditor';

interface MissionEditorProps {
	mission: MissionNode | null;
	characters: Character[];
	foods: Food[];
	ingredients: Ingredient[];
	beverages: Beverage[];
	recipes: Recipe[];
	allMissions: MissionNode[];
	allEvents: EventNode[];
	allDialogPackages: DialogPackage[];
	onRemove: () => void;
	onUpdate: (updates: Partial<MissionNode>) => void;
}

export default memo<MissionEditorProps>(function MissionEditor({
	mission,
	characters,
	foods,
	ingredients,
	beverages,
	recipes,
	allMissions,
	allEvents,
	allDialogPackages,
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

	const allBeverages = useMemo(() => {
		const result = [...BEVERAGE_NAMES];
		beverages.forEach((b) => {
			if (!result.find((r) => r.id === b.id)) {
				result.push({ id: b.id, name: b.name });
			}
		});
		return result.sort((a, b) => a.id - b.id);
	}, [beverages]);

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
				<h2 className="text-2xl font-bold">任务节点编辑</h2>
				<button
					onClick={onRemove}
					className="btn-mystia-secondary bg-danger text-white hover:bg-danger/80"
				>
					删除任务
				</button>
			</div>

			<MissionBasicInfo
				mission={mission}
				characters={characters}
				allFoods={allFoods}
				characterOptions={characterOptions}
				onUpdate={onUpdate}
			/>

			<MissionConditionList
				mission={mission}
				characterOptions={characterOptions}
				allFoods={allFoods}
				allIngredients={allIngredients}
				allBeverages={allBeverages}
				onUpdate={onUpdate}
			/>

			<MissionRewardList
				rewards={mission.rewards}
				characterOptions={characterOptions}
				allFoods={allFoods}
				allIngredients={allIngredients}
				allRecipes={allRecipes}
				onUpdate={(rewards) => onUpdate({ rewards })}
			/>

			<label className="font-medium text-foreground">
				Mission Finish Event
			</label>
			<EventDataEditor
				eventData={mission.missionFinishEvent}
				allDialogPackages={allDialogPackages}
				onChange={(event) => onUpdate({ missionFinishEvent: event })}
			/>

			<PostMissionList
				postMissions={mission.postMissionsAfterPerformance}
				allMissions={allMissions}
				onUpdate={(pms) =>
					onUpdate({ postMissionsAfterPerformance: pms })
				}
			/>

			<PostEventList
				postEvents={mission.postEvents}
				allEvents={allEvents}
				onUpdate={(events) => onUpdate({ postEvents: events })}
			/>
		</div>
	);
});
