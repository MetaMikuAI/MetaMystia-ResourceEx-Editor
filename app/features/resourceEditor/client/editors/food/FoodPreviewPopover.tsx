'use client';

import { EyeIcon } from '@heroui/shared-icons';
import { memo, useMemo } from 'react';

import Button from '@/design/ui/components/button';
import Popover, {
	PopoverContent,
	PopoverTrigger,
} from '@/design/ui/components/popover';

import { FOOD_NAMES } from '@/domain/data/foods';
import { FOOD_TAGS } from '@/domain/data/tags';

import { TagBadge } from '@/features/resourceEditor/client/components/tags/TagButton';
import { useResourceEditor } from '@/features/resourceEditor/client/state/useResourceEditor';

import { CookerPreviewIcon, IngredientPreviewIcon } from './RecipePreviewIcons';

interface IProps {
	foodId: number;
}

function renderDescription(description: string) {
	return description
		.split(/(\r\n|\r|\n|<br\s*\/?>)/gi)
		.map((part, index) =>
			/^(\r\n|\r|\n|<br\s*\/?>)$/i.test(part) ? <br key={index} /> : part
		);
}

export const FoodPreviewPopover = memo<IProps>(function FoodPreviewPopover({
	foodId,
}) {
	const { getAssetUrl, resourcePack: data } = useResourceEditor();
	const food = useMemo(
		() => data.foods.find((item) => item.id === foodId),
		[data.foods, foodId]
	);
	const foodName =
		food?.name ??
		FOOD_NAMES.find((item) => item.id === foodId)?.name ??
		`未知料理（${foodId}）`;
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
	const previewButton = (
		<Button
			isIconOnly
			aria-label={`预览${foodName}`}
			title={`预览${foodName}`}
			color="primary"
			variant="flat"
			size="sm"
			className="h-10 w-10 rounded-medium sm:h-8 sm:w-8"
		>
			<EyeIcon className="h-4 w-4" />
		</Button>
	);

	return (
		<Popover showArrow>
			<PopoverTrigger>{previewButton}</PopoverTrigger>
			<PopoverContent className="w-80 max-w-[calc(100vw-1rem)] p-3">
				<div className="grid w-full gap-3 text-sm text-foreground">
					<div className="flex items-center gap-2">
						{foodSpriteUrl ? (
							<img
								src={foodSpriteUrl}
								alt={foodName}
								className="image-rendering-pixelated h-8 w-8 shrink-0 object-contain"
							/>
						) : null}
						<div className="min-w-0">
							<p className="truncate font-semibold">{foodName}</p>
							<p className="font-mono text-xs text-foreground-500">
								料理ID：{foodId}
							</p>
						</div>
					</div>

					{food ? (
						<>
							<div className="flex gap-4 text-xs text-foreground-600">
								<p>售价：{food.baseValue}</p>
								<p>等级：{food.level}</p>
							</div>
							{food.description ? (
								<p className="text-xs leading-5 text-foreground-600">
									{renderDescription(food.description)}
								</p>
							) : null}
							{food.tags.length > 0 || food.banTags.length > 0 ? (
								<div className="flex flex-wrap gap-1">
									{food.tags.map((id) => (
										<TagBadge
											key={`tag-${id}`}
											tone="positive"
										>
											{tagNames.get(id) ?? `#${id}`}
										</TagBadge>
									))}
									{food.banTags.map((id) => (
										<TagBadge
											key={`ban-tag-${id}`}
											tone="negative"
										>
											{tagNames.get(id) ?? `#${id}`}
										</TagBadge>
									))}
								</div>
							) : null}
						</>
					) : (
						<p className="text-xs text-foreground-500">
							游戏内料理；资源包未定义可编辑属性。
						</p>
					)}

					<div className="border-t border-divider pt-3">
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
													customIngredients.get(id);
												return (
													<IngredientPreviewIcon
														key={`${id}-${ingredientIndex}`}
														id={id}
														ingredient={ingredient}
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
								<p className="mt-1 font-mono text-xs text-foreground-500">
									食谱ID：{recipe.id} · {recipe.cookTime}秒
								</p>
							</div>
						))}
						{recipes.length === 0 ? (
							<p className="text-xs text-foreground-500">
								尚未关联食谱。
							</p>
						) : null}
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
});
