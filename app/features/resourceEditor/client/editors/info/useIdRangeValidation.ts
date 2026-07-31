import { useEffect, useMemo, useState } from 'react';

import {
	GAME_ID_MAX,
	UNMANAGED_ID_MAX,
	UNMANAGED_ID_MIN,
} from '@/domain/resourcePack/constants';

import { useResourceEditor } from '@/features/resourceEditor/client/state/useResourceEditor';

import { verifyIdRange } from '@/infrastructure/browser/crypto/idRangeSignature';

export type TIdRangeStatus =
	| 'valid'
	| 'no-signature'
	| 'invalid-signature'
	| 'outside-allocation'
	| 'unmanaged'
	| 'out-of-bounds';

export function useIdRangeValidation(id: number): TIdRangeStatus | null {
	const { resourcePack } = useResourceEditor();
	const { idRangeEnd, idRangeStart, idSignature, label } =
		resourcePack.packInfo;
	const [isSignatureValid, setIsSignatureValid] = useState<boolean | null>(
		null
	);

	useEffect(() => {
		if (
			!label ||
			idRangeStart == null ||
			idRangeEnd == null ||
			!idSignature
		) {
			setIsSignatureValid(null);
			return;
		}

		let isCancelled = false;
		void verifyIdRange(label, idRangeStart, idRangeEnd, idSignature).then(
			(isValid) => {
				if (!isCancelled) setIsSignatureValid(isValid);
			}
		);
		return () => {
			isCancelled = true;
		};
	}, [idRangeEnd, idRangeStart, idSignature, label]);

	return useMemo(() => {
		if (Number.isNaN(id)) return null;
		if (id < 0 || id > UNMANAGED_ID_MAX) return 'out-of-bounds';
		if (id <= GAME_ID_MAX) return null;
		if (id >= UNMANAGED_ID_MIN) return 'unmanaged';
		if (isSignatureValid === null) return 'no-signature';
		if (!isSignatureValid) return 'invalid-signature';
		if (
			idRangeStart != null &&
			idRangeEnd != null &&
			id >= idRangeStart &&
			id <= idRangeEnd
		) {
			return 'valid';
		}
		return 'outside-allocation';
	}, [id, idRangeEnd, idRangeStart, isSignatureValid]);
}

export const ID_RANGE_STATUS_LABEL = {
	valid: '',
	'no-signature': '未分配ID段',
	'invalid-signature': '签名无效',
	'outside-allocation': 'ID不在分配范围',
	unmanaged: '不受管理区ID',
	'out-of-bounds': 'ID超出有效范围',
} as const satisfies Record<TIdRangeStatus, string>;
