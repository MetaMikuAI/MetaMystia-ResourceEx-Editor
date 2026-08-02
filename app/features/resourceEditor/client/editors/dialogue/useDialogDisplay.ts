import { useMemo } from 'react';

import { SPECIAL_GUESTS } from '@/domain/data/specialGuest';
import { SPECIAL_PORTRAITS } from '@/domain/data/specialPortraits';
import type { Character } from '@/domain/resourcePack/contracts/character';
import type { Dialog } from '@/domain/resourcePack/contracts/dialogue';

import { useResourceEditor } from '@/features/resourceEditor/client/state/useResourceEditor';

export function useDialogDisplay(
	dialog: Dialog,
	customCharacters: Character[]
) {
	const { getAssetUrl } = useResourceEditor();

	const portraitPath = useMemo(() => {
		const customChar = customCharacters.find(
			({ id, type }) =>
				id === dialog.characterId && type === dialog.characterType
		);
		const customPortrait = customChar?.portraits?.find(
			({ pid }) => pid === dialog.pid
		);
		if (customPortrait) {
			return (
				getAssetUrl(customPortrait.path) ?? `/${customPortrait.path}`
			);
		}
		if (dialog.characterType === 'Special') {
			const specialPortrait = SPECIAL_PORTRAITS.find(
				({ characterId, pid }) =>
					characterId === dialog.characterId && pid === dialog.pid
			);
			if (specialPortrait?.filename) {
				return `/assets/SpecialPortrait/${specialPortrait.filename}`;
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
				portraitName = portrait.label || `立绘${portrait.pid}`;
			}
		} else if (dialog.characterType === 'Special') {
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
