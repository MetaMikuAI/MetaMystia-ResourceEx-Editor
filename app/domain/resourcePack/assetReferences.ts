import type { ResourceEx } from './contracts/resourceEx';

export function collectResourcePackAssetReferences(
	resourcePack: ResourceEx
): ReadonlySet<string> {
	const paths = new Set<string>();
	const addPath = (path: string | undefined) => {
		if (path) paths.add(path);
	};

	resourcePack.ingredients.forEach((ingredient) =>
		addPath(ingredient.spritePath)
	);
	resourcePack.foods.forEach((food) => addPath(food.spritePath));
	resourcePack.beverages.forEach((beverage) => addPath(beverage.spritePath));
	resourcePack.clothes.forEach((clothes) => {
		addPath(clothes.spritePath);
		addPath(clothes.portraitPath);
		clothes.pixelFullConfig?.mainSprite.forEach(addPath);
		clothes.pixelFullConfig?.eyeSprite.forEach(addPath);
		clothes.pixelFullConfig?.hairSprite.forEach(addPath);
		clothes.pixelFullConfig?.backSprite.forEach(addPath);
	});
	resourcePack.characters.forEach((character) => {
		character.portraits?.forEach((portrait) => addPath(portrait.path));
		character.characterSpriteSetCompact?.mainSprite.forEach(addPath);
		character.characterSpriteSetCompact?.eyeSprite.forEach(addPath);
	});
	resourcePack.dialogPackages.forEach((dialogPackage) => {
		dialogPackage.dialogList.forEach((dialog) => {
			dialog.actions?.forEach((action) => {
				if (
					(action.actionType === 'CG' ||
						action.actionType === 'BG') &&
					action.shouldSet !== false
				) {
					addPath(action.sprite);
				}
				if (action.actionType === 'Sound') addPath(action.sound);
			});
		});
	});

	return paths;
}
