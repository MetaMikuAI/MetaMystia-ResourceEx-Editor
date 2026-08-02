'use client';

import { memo, useMemo } from 'react';

import Input from '@/design/ui/components/input';

import { BEVERAGE_NAMES } from '@/domain/data/beverages';
import { FOOD_NAMES } from '@/domain/data/foods';
import { INGREDIENT_NAMES } from '@/domain/data/ingredients';
import { RECIPE_NAMES } from '@/domain/data/recipes';
import { SPECIAL_GUESTS } from '@/domain/data/specialGuest';
import type { Character } from '@/domain/resourcePack/contracts/character';
import type { DialogPackage } from '@/domain/resourcePack/contracts/dialogue';
import type { EventNode } from '@/domain/resourcePack/contracts/event';
import type {
	Beverage,
	Food,
	Ingredient,
	Recipe,
} from '@/domain/resourcePack/contracts/items';
import type { MissionNode } from '@/domain/resourcePack/contracts/mission';

import { SectionDeleteButton } from '@/features/resourceEditor/client/components/actions/SectionDeleteButton';
import { EditorField } from '@/features/resourceEditor/client/components/fields/EditorField';
import { EditorDetailEmptyState } from '@/features/resourceEditor/client/components/layout/EditorDetailEmptyState';
import { EditorDetailHeader } from '@/features/resourceEditor/client/components/layout/EditorDetailHeader';
import { EditorDetailPanel } from '@/features/resourceEditor/client/components/layout/EditorDetailPanel';
import { EditorSection } from '@/features/resourceEditor/client/components/layout/EditorSection';
import { ErrorBadge } from '@/features/resourceEditor/client/components/status/ErrorBadge';
import { WarningBadge } from '@/features/resourceEditor/client/components/status/WarningBadge';
import { MissionRewardList } from '@/features/resourceEditor/client/editors/mission/MissionRewardList';
import { PostMissionList } from '@/features/resourceEditor/client/editors/mission/PostMissionList';
import { useLabelPrefixValidation } from '@/features/resourceEditor/client/hooks/useLabelPrefixValidation';

import { PostEventList } from './PostEventList';
import { ScheduledEventEditor } from './ScheduledEventEditor';

interface EventEditorProps {
	eventNode: EventNode | null;
	allMissions: MissionNode[];
	allEvents: EventNode[];
	allCharacters: Character[];
	allDialogPackages: DialogPackage[];
	beverages: Beverage[];
	foods: Food[];
	ingredients: Ingredient[];
	recipes: Recipe[];
	onRemove: () => void;
	onUpdate: (updates: Partial<EventNode>) => void;
}

export default memo<EventEditorProps>(function EventEditor({
	eventNode,
	allMissions,
	allEvents,
	allCharacters,
	allDialogPackages,
	beverages,
	foods,
	ingredients,
	recipes,
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
		beverages.forEach((beverage) => {
			if (!result.find(({ id }) => id === beverage.id)) {
				result.push({ id: beverage.id, name: beverage.name });
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
				label: `[${g.id}] ${g.name}（${g.label}）`,
			});
		});
		// Add custom characters
		allCharacters.forEach((c) => {
			options.push({
				value: c.label,
				label: `[${c.id}] ${c.name}（${c.label}）`,
			});
		});
		return options;
	}, [allCharacters]);

	const {
		isValid: isLabelPrefixValid,
		prefix: expectedPrefix,
		hasPackLabel,
	} = useLabelPrefixValidation(eventNode?.label || '');
	const showPrefixWarning =
		hasPackLabel && eventNode && eventNode.label && !isLabelPrefixValid;
	const isLabelDuplicate =
		Boolean(eventNode?.label) &&
		allEvents.some(
			(candidate) =>
				candidate !== eventNode && candidate.label === eventNode?.label
		);

	if (!eventNode) {
		return <EditorDetailEmptyState itemLabel="事件节点" />;
	}

	return (
		<EditorDetailPanel>
			<EditorDetailHeader
				title="事件节点编辑"
				actions={
					<SectionDeleteButton
						confirmTitle="确定要删除这个事件节点吗？"
						onPress={onRemove}
					>
						删除事件
					</SectionDeleteButton>
				}
			/>

			<EditorSection title="基本信息">
				<EditorField label="调试标签（Debug Label）">
					<Input
						type="text"
						value={eventNode.debugLabel || ''}
						onChange={(e) =>
							onUpdate({ debugLabel: e.target.value })
						}
						placeholder="用于显示在编辑器左侧列表的名称"
					/>
				</EditorField>

				<EditorField
					label="标签（Label）"
					actions={
						isLabelDuplicate || showPrefixWarning ? (
							<div className="flex gap-2">
								{isLabelDuplicate && (
									<ErrorBadge>标签重复</ErrorBadge>
								)}
								{showPrefixWarning && (
									<WarningBadge>
										建议以{expectedPrefix}开头
									</WarningBadge>
								)}
							</div>
						) : undefined
					}
				>
					<Input
						type="text"
						value={eventNode.label || ''}
						onChange={(e) => onUpdate({ label: e.target.value })}
						placeholder="游戏内唯一标识符"
						isInvalid={isLabelDuplicate}
					/>
				</EditorField>
			</EditorSection>

			<EditorSection title="定时事件（Scheduled Event）">
				<ScheduledEventEditor
					scheduledEvent={eventNode.scheduledEvent || {}}
					allCharacters={allCharacters}
					allDialogPackages={allDialogPackages}
					onUpdate={(updatedScheduledEvent) =>
						onUpdate({ scheduledEvent: updatedScheduledEvent })
					}
				/>
			</EditorSection>
			<MissionRewardList
				title="奖励（Rewards）"
				rewards={eventNode.rewards || []}
				characterOptions={characterOptions}
				allBeverages={allBeverages}
				allFoods={allFoods}
				allIngredients={allIngredients}
				allRecipes={allRecipes}
				onUpdate={(rewards) => onUpdate({ rewards })}
			/>

			<MissionRewardList
				title="后置奖励（Post Rewards）"
				rewards={eventNode.postRewards || []}
				characterOptions={characterOptions}
				allBeverages={allBeverages}
				allFoods={allFoods}
				allIngredients={allIngredients}
				allRecipes={allRecipes}
				onUpdate={(postRewards) => onUpdate({ postRewards })}
			/>

			<PostMissionList
				postMissions={eventNode.postMissionsAfterPerformance}
				allMissions={allMissions}
				onUpdate={(pms) =>
					onUpdate({ postMissionsAfterPerformance: pms })
				}
			/>

			<PostEventList
				postEvents={eventNode.postEvents}
				allEvents={allEvents}
				onUpdate={(events) => onUpdate({ postEvents: events })}
			/>
		</EditorDetailPanel>
	);
});
