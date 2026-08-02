import type { ResourceEx } from './contracts/resourceEx';

export function collectResourcePackAssetReferences(
	resourcePack: ResourceEx
): ReadonlySet<string> {
	const paths = new Set<string>();
	const addPath = (path: string | undefined) => {
		if (path?.trim()) paths.add(path);
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

export function remapResourcePackAssetReferences(
	resourcePack: ResourceEx,
	pathMap: ReadonlyMap<string, string>
): ResourceEx {
	let hasChanged = false;
	const remapPath = (path: string) => {
		const remapped = pathMap.get(path) ?? path;
		if (remapped !== path) hasChanged = true;
		return remapped;
	};
	const remapPaths = (paths: string[]) => {
		const remapped = paths.map(remapPath);
		return remapped.some((path, index) => path !== paths[index])
			? remapped
			: paths;
	};

	const ingredients = resourcePack.ingredients.map((ingredient) => {
		const spritePath = remapPath(ingredient.spritePath);
		return spritePath === ingredient.spritePath
			? ingredient
			: { ...ingredient, spritePath };
	});
	const foods = resourcePack.foods.map((food) => {
		const spritePath = remapPath(food.spritePath);
		return spritePath === food.spritePath ? food : { ...food, spritePath };
	});
	const beverages = resourcePack.beverages.map((beverage) => {
		const spritePath = remapPath(beverage.spritePath);
		return spritePath === beverage.spritePath
			? beverage
			: { ...beverage, spritePath };
	});
	const clothes = resourcePack.clothes.map((item) => {
		const spritePath = remapPath(item.spritePath);
		const portraitPath = remapPath(item.portraitPath);
		const pixelFullConfig = item.pixelFullConfig
			? {
					...item.pixelFullConfig,
					backSprite: remapPaths(item.pixelFullConfig.backSprite),
					eyeSprite: remapPaths(item.pixelFullConfig.eyeSprite),
					hairSprite: remapPaths(item.pixelFullConfig.hairSprite),
					mainSprite: remapPaths(item.pixelFullConfig.mainSprite),
				}
			: item.pixelFullConfig;
		if (
			spritePath === item.spritePath &&
			portraitPath === item.portraitPath &&
			pixelFullConfig?.backSprite === item.pixelFullConfig?.backSprite &&
			pixelFullConfig?.eyeSprite === item.pixelFullConfig?.eyeSprite &&
			pixelFullConfig?.hairSprite === item.pixelFullConfig?.hairSprite &&
			pixelFullConfig?.mainSprite === item.pixelFullConfig?.mainSprite
		) {
			return item;
		}
		return { ...item, pixelFullConfig, portraitPath, spritePath };
	});
	const characters = resourcePack.characters.map((character) => {
		const portraits = character.portraits?.map((portrait) => {
			const path = remapPath(portrait.path);
			return path === portrait.path ? portrait : { ...portrait, path };
		});
		const characterSpriteSetCompact = character.characterSpriteSetCompact
			? {
					...character.characterSpriteSetCompact,
					eyeSprite: remapPaths(
						character.characterSpriteSetCompact.eyeSprite
					),
					mainSprite: remapPaths(
						character.characterSpriteSetCompact.mainSprite
					),
				}
			: undefined;
		const hasPortraitChange = portraits?.some(
			(portrait, index) => portrait !== character.portraits?.[index]
		);
		const hasSpriteChange =
			characterSpriteSetCompact?.eyeSprite !==
				character.characterSpriteSetCompact?.eyeSprite ||
			characterSpriteSetCompact?.mainSprite !==
				character.characterSpriteSetCompact?.mainSprite;
		if (!hasPortraitChange && !hasSpriteChange) return character;
		return {
			...character,
			...(portraits === undefined ? {} : { portraits }),
			...(characterSpriteSetCompact === undefined
				? {}
				: { characterSpriteSetCompact }),
		};
	});
	const dialogPackages = resourcePack.dialogPackages.map((dialogPackage) => ({
		...dialogPackage,
		dialogList: dialogPackage.dialogList.map((dialog) => ({
			...dialog,
			...(dialog.actions === undefined
				? {}
				: {
						actions: dialog.actions.map((action) => {
							const sprite = action.sprite
								? remapPath(action.sprite)
								: action.sprite;
							const sound = action.sound
								? remapPath(action.sound)
								: action.sound;
							return sprite === action.sprite &&
								sound === action.sound
								? action
								: { ...action, sound, sprite };
						}),
					}),
		})),
	}));

	if (!hasChanged) return resourcePack;
	return {
		...resourcePack,
		beverages,
		characters,
		clothes,
		dialogPackages,
		foods,
		ingredients,
	};
}
