import { useMemo } from 'react';

import { SPECIAL_GUESTS } from '@/data/specialGuest';
import { SPECIAL_PORTRAITS } from '@/data/specialPortraits';

import type { Character } from '@/domain/resourcePack/contracts/character';
import type { Dialog } from '@/domain/resourcePack/contracts/dialogue';

import { useResourceEditor } from '@/features/resourceEditor/client/state/useResourceEditor';

export function useDialogDisplay(
	dialog: Dialog,
	customCharacters: Character[]
) {
	const { getAssetUrl } = useResourceEditor();

	const portraitPath = useMemo(() => {
		if (dialog.characterType === 'Special') {
			const specialPortrait = SPECIAL_PORTRAITS.find(
				({ characterId, pid }) =>
					characterId === dialog.characterId && pid === dialog.pid
			);
			if (specialPortrait?.filename) {
				return `/assets/SpecialPortrait/${specialPortrait.filename}`;
			}
			const customChar = customCharacters.find(
				({ id, type }) =>
					id === dialog.characterId && type === dialog.characterType
			);
			if (customChar) {
				const portrait = customChar.portraits?.find(
					({ pid }) => pid === dialog.pid
				);
				if (portrait) {
					return getAssetUrl(portrait.path) ?? `/${portrait.path}`;
				}
			}
		}

		return null;
	}, [
		dialog.characterId,
		dialog.characterType,
		dialog.pid,
		customCharacters,
		getAssetUrl,
	]);

	const { charName, portraitName } = useMemo(() => {
		let charName = '未知角色';
		let portraitName = '未知立绘';

		if (dialog.characterType === 'Special') {
			const guest = SPECIAL_GUESTS.find(
				({ id }) => id === dialog.characterId
			);
			if (guest) {
				charName = guest.name;
			}

			const portrait = SPECIAL_PORTRAITS.find(
				({ characterId, pid }) =>
					characterId === dialog.characterId && pid === dialog.pid
			);
			if (portrait) {
				portraitName = portrait.name;
			}
		} else {
			const customChar = customCharacters.find(
				({ id, type }) =>
					id === dialog.characterId && type === dialog.characterType
			);
			if (customChar) {
				charName = customChar.name;
				const portrait = customChar.portraits?.find(
					({ pid }) => pid === dialog.pid
				);
				if (portrait) {
					portraitName = portrait.label || `立绘 ${portrait.pid}`;
				}
			}
		}

		return { charName, portraitName };
	}, [
		customCharacters,
		dialog.characterId,
		dialog.characterType,
		dialog.pid,
	]);

	return { portraitPath, charName, portraitName };
}
