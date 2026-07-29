'use client';

import { memo, useMemo } from 'react';

import { Modal } from '@/design/ui/components';
import { useData } from '@/components/context/DataContext';
import { FOOD_NAMES } from '@/data/foods';
import { FOOD_TAGS } from '@/data/tags';
import {
	CookerPreviewIcon,
	IngredientPreviewIcon,
} from '@/components/food/RecipePreviewIcons';

interface FoodPreviewDialogProps {
	foodId: number | null;
	isOpen: boolean;
	onClose: () => void;
}

function FoodTagChip({
	name,
	variant,
}: {
	name: string;
	variant: 'positive' | 'negative';
}) {
	const isNegative = variant === 'negative';
	return (
		<span
			className={
				isNegative
					? 'inline-block h-max w-max rounded border border-black bg-[#5d453a] px-1 text-xs text-[#e6b4a6]'
					: 'inline-block h-max w-max rounded border border-[#9d5437] bg-[#e6b4a6] px-1 text-xs text-[#830000] before:mr-1 before:content-["⦁"]'
			}
		>
			{name}
			{isNegative ? <span className="ml-1">✘</span> : null}
		</span>
	);
}

function renderDescription(description: string) {
	return description
		.split(/(\r\n|\r|\n|<br\s*\/?>)/gi)
		.map((part, index) =>
			/^(\r\n|\r|\n|<br\s*\/?>)$/i.test(part) ? <br key={index} /> : part
		);
}

export const FoodPreviewDialog = memo<FoodPreviewDialogProps>(
	function FoodPreviewDialog({ foodId, isOpen, onClose }) {
		const { data, getAssetUrl } = useData();
		const food = useMemo(
			() => data.foods.find((item) => item.id === foodId),
			[data.foods, foodId]
		);
		const foodName =
			food?.name ??
			FOOD_NAMES.find((item) => item.id === foodId)?.name ??
			`未知料理 (${foodId})`;
		const recipes = useMemo(
			() => data.recipes.filter((recipe) => recipe.foodId === foodId),
			[data.recipes, foodId]
		);
		const customIngredients = useMemo(
			() => new Map(data.ingredients.map((item) => [item.id, item])),
			[data.ingredients]
		);
		const tagNames = useMemo(
			() => new Map(FOOD_TAGS.map((item) => [item.id, item.name])),
			[]
		);
		const foodSpriteUrl = food ? getAssetUrl(food.spritePath) : undefined;
		if (foodId === null) return null;

		return (
			<Modal
				isOpen={isOpen}
				onClose={onClose}
				backdrop="blur"
				size="sm"
				scrollShadow={false}
				classNames={{ base: 'max-w-[22rem]', content: 'py-1' }}
			>
				<div>
					<div className="space-y-2 bg-background p-1 text-sm text-foreground dark:bg-content1">
						<div className="flex items-center gap-2">
							{foodSpriteUrl ? (
								<img
									src={foodSpriteUrl}
									alt={foodName}
									className="image-rendering-pixelated h-8 w-8 shrink-0 object-contain"
								/>
							) : null}
							<div className="min-w-0">
								<p className="truncate font-bold">{foodName}</p>
								<p className="font-mono text-xs text-foreground/60">
									Food ID: {foodId}
								</p>
							</div>
						</div>

						{food ? (
							<>
								<div className="flex gap-4 text-xs">
									<p>售价：{food.baseValue}</p>
									<p>等级：{food.level}</p>
								</div>
								{food.description ? (
									<p className="text-xs text-foreground/70">
										{renderDescription(food.description)}
									</p>
								) : null}
								{food.tags.length > 0 ||
								food.banTags.length > 0 ? (
									<div className="flex flex-wrap gap-1">
										{food.tags.map((id) => (
											<FoodTagChip
												key={`tag-${id}`}
												name={
													tagNames.get(id) ?? `#${id}`
												}
												variant="positive"
											/>
										))}
										{food.banTags.map((id) => (
											<FoodTagChip
												key={`ban-tag-${id}`}
												name={
													tagNames.get(id) ?? `#${id}`
												}
												variant="negative"
											/>
										))}
									</div>
								) : null}
							</>
						) : (
							<p className="text-xs text-foreground/60">
								游戏内料理；资源包未定义可编辑属性。
							</p>
						)}

						<div className="border-t border-divider pt-2">
							{recipes.map((recipe, recipeIndex) => (
								<div
									key={recipe.id}
									className={
										recipeIndex === 0
											? ''
											: 'mt-2 border-t border-divider pt-2'
									}
								>
									<div className="flex flex-wrap items-center gap-x-2 gap-y-1">
										<CookerPreviewIcon
											cookerType={recipe.cookerType}
										/>
										<div className="flex flex-wrap gap-1">
											{recipe.ingredients.map(
												(id, ingredientIndex) => {
													const ingredient =
														customIngredients.get(
															id
														);
													return (
														<IngredientPreviewIcon
															key={`${id}-${ingredientIndex}`}
															id={id}
															ingredient={
																ingredient
															}
															spriteUrl={
																ingredient
																	? getAssetUrl(
																			ingredient.spritePath
																		)
																	: undefined
															}
														/>
													);
												}
											)}
										</div>
									</div>
									<p className="mt-1 font-mono text-xs text-foreground/60">
										Recipe ID: {recipe.id} ·{' '}
										{recipe.cookTime} 秒
									</p>
								</div>
							))}
							{recipes.length === 0 ? (
								<p className="text-xs text-foreground/60">
									尚未关联食谱。
								</p>
							) : null}
						</div>
					</div>
				</div>
			</Modal>
		);
	}
);
