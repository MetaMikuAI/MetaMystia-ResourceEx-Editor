import { memo, useCallback, useId } from 'react';

import { cn } from '@/lib';
import { ErrorBadge } from '@/components/ErrorBadge';
import type { Recipe, CookerType } from '@/types/resource';
import { INGREDIENT_NAMES } from '@/data/ingredients';
import { FOOD_NAMES } from '@/data/foods';

interface RecipeEditorProps {
	recipe: Recipe | null;
	recipeIndex: number | null;
	customIngredients: Array<{ id: number; name: string }>;
	customFoods: Array<{ id: number; name: string }>;
	onUpdate: (updates: Partial<Recipe>) => void;
}

const COOKER_TYPES: { value: CookerType; label: string }[] = [
	{ value: 'Pot', label: '煮锅 (Pot)' },
	{ value: 'Grill', label: '烧烤架 (Grill)' },
	{ value: 'Fryer', label: '油锅 (Fryer)' },
	{ value: 'Steamer', label: '蒸锅 (Steamer)' },
	{ value: 'CuttingBoard', label: '料理台 (CuttingBoard)' },
];

export const RecipeEditor = memo<RecipeEditorProps>(function RecipeEditor({
	recipe,
	customIngredients,
	customFoods,
	onUpdate,
}) {
	const idId = useId();
	const idFoodId = useId();
	const idCookTime = useId();
	const idCookerType = useId();

	const isIdTooSmall = recipe && recipe.id < 9000;

	const updateIngredient = useCallback(
		(index: number, value: string) => {
			if (!recipe) return;
			const newIngredients = [...recipe.ingredients];
			const numValue = parseInt(value);
			newIngredients[index] = isNaN(numValue) ? -1 : numValue;
			onUpdate({ ingredients: newIngredients });
		},
		[recipe, onUpdate]
	);

	const addIngredient = useCallback(() => {
		if (!recipe) return;
		if (recipe.ingredients.length >= 5) {
			alert('最多只能添加 5 个原料！');
			return;
		}
		onUpdate({ ingredients: [...recipe.ingredients, -1] });
	}, [recipe, onUpdate]);

	const removeIngredient = useCallback(
		(index: number) => {
			if (!recipe) return;
			const newIngredients = recipe.ingredients.filter(
				(_, i) => i !== index
			);
			onUpdate({ ingredients: newIngredients });
		},
		[recipe, onUpdate]
	);

	if (!recipe) {
		return (
			<div className="col-span-2 flex h-96 items-center justify-center rounded-lg bg-white/10 p-4 shadow-md backdrop-blur">
				<p className="text-center text-black/40 dark:text-white/40">
					请从左侧选择一个菜谱进行编辑
				</p>
			</div>
		);
	}

	return (
		<div className="col-span-2 flex flex-col gap-6 overflow-y-auto rounded-lg bg-white/10 p-6 shadow-md backdrop-blur">
			<div className="flex items-center justify-between border-b border-black/5 pb-4 dark:border-white/5">
				<h2 className="text-2xl font-bold">菜谱编辑</h2>
			</div>

			{/* 基本信息 */}
			<div className="flex flex-col gap-4 rounded-lg bg-white/20 p-4 dark:bg-white/5">
				<h3 className="text-sm font-bold uppercase tracking-wider opacity-60">
					基本信息
				</h3>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div className="flex flex-col gap-1">
						<div className="flex items-center justify-between">
							<label
								htmlFor={idId}
								className="text-xs font-medium uppercase opacity-60"
							>
								菜谱ID
							</label>
							{isIdTooSmall && (
								<ErrorBadge>ID需&ge;9000</ErrorBadge>
							)}
						</div>
						<input
							id={idId}
							type="number"
							value={isNaN(recipe.id) ? '' : recipe.id}
							onChange={(e) =>
								onUpdate({ id: parseInt(e.target.value) })
							}
							className={cn(
								'h-9 w-full rounded-lg border bg-white/40 px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-black/30 focus:ring-2 focus:ring-black/10 dark:bg-black/10 dark:focus:border-white/30 dark:focus:ring-white/10',
								isIdTooSmall
									? 'border-danger bg-danger text-white opacity-50 focus:border-danger'
									: 'border-black/10 dark:border-white/10'
							)}
						/>
					</div>

					<div className="flex flex-col gap-1">
						<label
							htmlFor={idFoodId}
							className="text-xs font-medium uppercase opacity-60"
						>
							料理ID (Food ID)
						</label>
						<select
							id={idFoodId}
							value={recipe.foodId}
							onChange={(e) =>
								onUpdate({ foodId: parseInt(e.target.value) })
							}
							className="h-9 w-full rounded-lg border border-black/10 bg-white/40 px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-black/30 focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-black/10 dark:focus:border-white/10 dark:focus:ring-white/10"
						>
							<optgroup label="游戏内料理">
								{FOOD_NAMES.map((food) => (
									<option key={food.id} value={food.id}>
										[{food.id}] {food.name}
									</option>
								))}
							</optgroup>
							{customFoods.length > 0 && (
								<optgroup label="自定义料理">
									{customFoods.map((food) => (
										<option key={food.id} value={food.id}>
											[{food.id}] {food.name}
										</option>
									))}
								</optgroup>
							)}
						</select>
					</div>

					<div className="flex flex-col gap-1">
						<label
							htmlFor={idCookTime}
							className="text-xs font-medium uppercase opacity-60"
						>
							烹饪时间 (Cook Time)
						</label>
						<input
							id={idCookTime}
							type="number"
							value={
								isNaN(recipe.cookTime) ? '' : recipe.cookTime
							}
							onChange={(e) =>
								onUpdate({ cookTime: parseInt(e.target.value) })
							}
							className="h-9 w-full rounded-lg border border-black/10 bg-white/40 px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-black/30 focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-black/10 dark:focus:border-white/10 dark:focus:ring-white/10"
						/>
					</div>

					<div className="flex flex-col gap-1">
						<label
							htmlFor={idCookerType}
							className="text-xs font-medium uppercase opacity-60"
						>
							厨具类型 (Cooker Type)
						</label>
						<select
							id={idCookerType}
							value={recipe.cookerType}
							onChange={(e) =>
								onUpdate({
									cookerType: e.target.value as CookerType,
								})
							}
							className="h-9 w-full rounded-lg border border-black/10 bg-white/40 px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-black/30 focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-black/10 dark:focus:border-white/10 dark:focus:ring-white/10"
						>
							{COOKER_TYPES.map((cooker) => (
								<option key={cooker.value} value={cooker.value}>
									{cooker.label}
								</option>
							))}
						</select>
					</div>
				</div>
			</div>

			{/* 原料配置 */}
			<div className="flex flex-col gap-4 rounded-lg bg-white/20 p-4 dark:bg-white/5">
				<div className="flex items-center justify-between">
					<h3 className="text-sm font-bold uppercase tracking-wider opacity-60">
						原料配置 (最多5个)
					</h3>
					<button
						onClick={addIngredient}
						disabled={recipe.ingredients.length >= 5}
						className={cn(
							'btn-mystia-primary rounded-full px-3 py-1 text-sm',
							recipe.ingredients.length >= 5 &&
								'cursor-not-allowed opacity-50'
						)}
					>
						添加原料
					</button>
				</div>
				<div className="flex flex-col gap-3">
					{recipe.ingredients.map((ingredientId, index) => (
						<div
							key={index}
							className="flex items-center gap-3 rounded-lg border border-black/10 bg-white/40 p-3 dark:border-white/10 dark:bg-black/10"
						>
							<span className="w-8 text-center text-sm font-medium opacity-60">
								#{index + 1}
							</span>
							<select
								value={ingredientId}
								onChange={(e) =>
									updateIngredient(index, e.target.value)
								}
								className="flex-1 rounded-lg border border-black/10 bg-white/40 px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-black/30 focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-black/10 dark:focus:border-white/10 dark:focus:ring-white/10"
							>
								<optgroup label="游戏内原料">
									{INGREDIENT_NAMES.map((ingredient) => (
										<option
											key={ingredient.id}
											value={ingredient.id}
										>
											[{ingredient.id}] {ingredient.name}
										</option>
									))}
								</optgroup>
								{customIngredients.length > 0 && (
									<optgroup label="自定义原料">
										{customIngredients.map((ingredient) => (
											<option
												key={ingredient.id}
												value={ingredient.id}
											>
												[{ingredient.id}]{' '}
												{ingredient.name}
											</option>
										))}
									</optgroup>
								)}
							</select>
							<button
								onClick={() => removeIngredient(index)}
								className="btn-mystia-danger rounded-full px-3 py-1 text-sm"
							>
								删除
							</button>
						</div>
					))}
					{recipe.ingredients.length === 0 && (
						<div className="rounded-lg border border-dashed border-black/10 p-8 text-center dark:border-white/10">
							<p className="text-sm text-black/40 dark:text-white/40">
								暂无原料配置
							</p>
							<p className="mt-1 text-xs text-black/30 dark:text-white/30">
								点击"添加原料"按钮开始配置
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
});
