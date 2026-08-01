'use client';

import { EyeIcon } from '@heroui/shared-icons';
import { memo, useMemo } from 'react';

import Button from '@/design/ui/components/button';
import Popover, {
	PopoverContent,
	PopoverTrigger,
} from '@/design/ui/components/popover';

import { getIngredientPrefixLabel } from '@/domain/data/ingredientPrefixes';
import { FOOD_TAGS } from '@/domain/data/tags';
import type { Ingredient } from '@/domain/resourcePack/contracts/items';

import { TagBadge } from '@/features/resourceEditor/client/components/tags/TagButton';
import { useResourceEditor } from '@/features/resourceEditor/client/state/useResourceEditor';

interface IProps {
	ingredient: Ingredient;
}

function renderDescription(description: string) {
	return description
		.split(/(\r\n|\r|\n|<br\s*\/?>)/gi)
		.map((part, index) =>
			/^(\r\n|\r|\n|<br\s*\/?>)$/i.test(part) ? <br key={index} /> : part
		);
}

export const IngredientPreviewPopover = memo<IProps>(
	function IngredientPreviewPopover({ ingredient }) {
		const { getAssetUrl } = useResourceEditor();
		const tagNames = useMemo(
			() => new Map(FOOD_TAGS.map((item) => [item.id, item.name])),
			[]
		);
		const ingredientName = ingredient.name || '未命名食材';
		const spriteUrl = getAssetUrl(ingredient.spritePath);
		const categories = [
			ingredient.isFish ? '鱼类' : null,
			ingredient.isMeat ? '肉类' : null,
			ingredient.isVeg ? '蔬菜' : null,
		].filter((category): category is string => category !== null);

		return (
			<Popover placement="right" showArrow>
				<PopoverTrigger>
					<Button
						isIconOnly
						aria-label={`预览${ingredientName}`}
						title={`预览${ingredientName}`}
						color="primary"
						variant="flat"
						size="sm"
						className="h-10 w-10 rounded-medium sm:h-8 sm:w-8"
					>
						<EyeIcon className="h-4 w-4" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-80 max-w-[calc(100vw-1rem)] p-3">
					<div className="grid w-full gap-3 text-sm text-foreground">
						<div className="flex items-center gap-2">
							{spriteUrl ? (
								<img
									src={spriteUrl}
									alt={ingredientName}
									className="image-rendering-pixelated h-8 w-8 shrink-0 object-contain"
								/>
							) : null}
							<div className="min-w-0">
								<p className="truncate font-semibold">
									{ingredientName}
								</p>
								<p className="font-mono text-xs text-foreground-500">
									食材ID：{ingredient.id}
								</p>
							</div>
						</div>

						<div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-foreground-600">
							<p>售价：{ingredient.baseValue}</p>
							<p>等级：{ingredient.level}</p>
							<p>
								前缀：
								{getIngredientPrefixLabel(ingredient.prefix)}
							</p>
							<p>
								分类：
								{categories.length > 0
									? categories.join('、')
									: '其他'}
							</p>
						</div>

						{ingredient.description ? (
							<p className="text-xs leading-5 text-foreground-600">
								{renderDescription(ingredient.description)}
							</p>
						) : null}

						{ingredient.tags.length > 0 ? (
							<div className="flex flex-wrap gap-1 border-t border-divider pt-3">
								{ingredient.tags.map((id) => (
									<TagBadge key={id} tone="ingredient">
										{tagNames.get(id) ?? `#${id}`}
									</TagBadge>
								))}
							</div>
						) : null}
					</div>
				</PopoverContent>
			</Popover>
		);
	}
);
