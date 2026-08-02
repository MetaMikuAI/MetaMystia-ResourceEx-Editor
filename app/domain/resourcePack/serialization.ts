import { cloneJsonObject } from '@/shared/utilities/objects/cloneJsonObject';

import { collectResourcePackAssetReferences } from './assetReferences';
import type { Character } from './contracts/character';
import type { Dialog, DialogAction } from './contracts/dialogue';
import type { ResourceEx } from './contracts/resourceEx';

type TUnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is TUnknownRecord {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function assertFiniteNumbers(value: unknown, path: string): void {
	if (typeof value === 'number') {
		if (!Number.isFinite(value)) {
			throw new TypeError(`${path}必须是有限数字`);
		}
		return;
	}
	if (Array.isArray(value)) {
		value.forEach((item, index) =>
			assertFiniteNumbers(item, `${path}[${index}]`)
		);
		return;
	}
	if (!isRecord(value)) return;
	Object.entries(value).forEach(([key, child]) =>
		assertFiniteNumbers(child, `${path}.${key}`)
	);
}

function normalizeStrings(value: unknown): unknown {
	if (typeof value === 'string') return value.trim().replace(/\r\n/g, '\n');
	if (Array.isArray(value)) return value.map(normalizeStrings);
	if (!isRecord(value)) return value;

	for (const key of Object.keys(value)) {
		value[key] = normalizeStrings(value[key]);
	}
	return value;
}

function compareNumberField(left: unknown, right: unknown, key: string) {
	const leftRecord = isRecord(left) ? left : {};
	const rightRecord = isRecord(right) ? right : {};
	return Number(leftRecord[key]) - Number(rightRecord[key]);
}

function sortNumericArray(value: unknown) {
	if (Array.isArray(value)) value.sort((a, b) => Number(a) - Number(b));
}

function sortRecordArray(value: unknown, key: string) {
	if (Array.isArray(value)) {
		value.sort((a, b) => compareNumberField(a, b, key));
	}
}

function sortResourcePackValues(resourcePack: ResourceEx) {
	resourcePack.characters.sort((a, b) => a.id - b.id);
	resourcePack.characters.forEach((character) => {
		const guest = character.guest;
		if (!guest) return;
		sortRecordArray(guest.foodRequests, 'tagId');
		sortRecordArray(guest.bevRequests, 'tagId');
		sortNumericArray(guest.hateFoodTag);
		sortRecordArray(guest.likeFoodTag, 'tagId');
		sortRecordArray(guest.likeBevTag, 'tagId');
		sortRecordArray(guest.spawn, 'izakayaId');
	});
	resourcePack.ingredients.sort((a, b) => a.id - b.id);
	resourcePack.ingredients.forEach((ingredient) =>
		ingredient.tags.sort((a, b) => a - b)
	);
	resourcePack.foods.sort((a, b) => a.id - b.id);
	resourcePack.foods.forEach((food) => {
		food.tags.sort((a, b) => a - b);
		food.banTags.sort((a, b) => a - b);
	});
	resourcePack.beverages.sort((a, b) => a.id - b.id);
	resourcePack.beverages.forEach((beverage) =>
		beverage.tags.sort((a, b) => a - b)
	);
	resourcePack.recipes.sort((a, b) => a.id - b.id);
	resourcePack.clothes.sort((a, b) => a.id - b.id);
}

function cleanDialogAction(action: DialogAction): DialogAction {
	if (action.actionType === 'CameraShake') {
		return { actionType: action.actionType };
	}
	if (action.actionType === 'Sound') {
		return {
			actionType: action.actionType,
			...(action.sound ? { sound: action.sound } : {}),
		};
	}
	if (action.actionType === 'Branch') {
		return {
			actionType: action.actionType,
			options: (action.options ?? []).map((option) => ({
				text: option.text,
				jump: option.jump ?? 1,
				...(option.price === undefined ? {} : { price: option.price }),
			})),
		};
	}
	if (action.actionType === 'Goto') {
		return { actionType: action.actionType, index: action.index ?? 1 };
	}
	if (action.actionType === 'End') {
		return {
			actionType: action.actionType,
			exitCode: action.exitCode ?? 0,
		};
	}
	if (action.shouldSet === false) {
		return { actionType: action.actionType, shouldSet: false };
	}
	return {
		actionType: action.actionType,
		...(action.sprite ? { sprite: action.sprite } : {}),
	};
}

function cleanDialog(dialog: Dialog): Dialog {
	const cleanedActions = (dialog.actions ?? []).map(cleanDialogAction);
	const { actions: ignoredActions, ...rest } = dialog;
	void ignoredActions;
	return cleanedActions.length === 0
		? rest
		: { ...rest, actions: cleanedActions };
}

function cleanCharacter(character: Character): Character {
	if (!character.guest) return character;
	const activeLikeFoodTagIds = character.guest.likeFoodTag.map(
		(tag) => tag.tagId
	);
	const activeLikeBeverageTagIds = character.guest.likeBevTag.map(
		(tag) => tag.tagId
	);

	return {
		...character,
		guest: {
			...character.guest,
			foodRequests: character.guest.foodRequests
				.filter(({ tagId }) => activeLikeFoodTagIds.includes(tagId))
				.sort((a, b) => a.tagId - b.tagId),
			bevRequests: character.guest.bevRequests
				.filter(({ tagId }) => activeLikeBeverageTagIds.includes(tagId))
				.sort((a, b) => a.tagId - b.tagId),
			likeFoodTag: [...character.guest.likeFoodTag].sort(
				(a, b) => a.tagId - b.tagId
			),
			likeBevTag: [...character.guest.likeBevTag].sort(
				(a, b) => a.tagId - b.tagId
			),
			hateFoodTag: [...character.guest.hateFoodTag].sort((a, b) => a - b),
			spawn: character.guest.spawn
				? [...character.guest.spawn].sort(
						(a, b) => a.izakayaId - b.izakayaId
					)
				: undefined,
		},
	};
}

export interface IResourcePackExportView {
	resourcePack: ResourceEx;
	resourcePackJson: string;
	referencedPaths: ReadonlySet<string>;
}

export function createResourcePackExportView(
	resourcePack: ResourceEx
): IResourcePackExportView {
	assertFiniteNumbers(resourcePack, 'ResourceEx');
	const serialized = cloneJsonObject(resourcePack);
	serialized.dialogPackages = serialized.dialogPackages.map(
		(dialogPackage) => ({
			...dialogPackage,
			dialogList: dialogPackage.dialogList.map(cleanDialog),
		})
	);
	serialized.characters = serialized.characters.map(cleanCharacter);
	sortResourcePackValues(serialized);
	normalizeStrings(serialized);

	const packInfo = serialized.packInfo as typeof serialized.packInfo & {
		license?: string;
	};
	delete packInfo.license;

	return {
		resourcePack: serialized,
		resourcePackJson: `${JSON.stringify(serialized, null, 2)}\n`,
		referencedPaths: collectResourcePackAssetReferences(serialized),
	};
}

export function serializeResourcePack(resourcePack: ResourceEx): string {
	return createResourcePackExportView(resourcePack).resourcePackJson;
}
