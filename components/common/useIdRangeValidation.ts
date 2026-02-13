import { useState, useEffect, useMemo } from 'react';
import { useData } from '@/components/context/DataContext';
import {
	verifyIdRange,
	GAME_ID_MAX,
	UNMANAGED_ID_MIN,
	UNMANAGED_ID_MAX,
} from '@/lib/crypto';

export type IdRangeStatus =
	/** ID is within the signed allocation – all good */
	| 'valid'
	/** ID is in managed range but no signature data is present */
	| 'no-signature'
	/** ID is in managed range but the signature failed verification */
	| 'invalid-signature'
	/** ID is in managed range but outside the signed allocation */
	| 'outside-allocation'
	/** ID is in the unmanaged range (1073741824–2147483647) */
	| 'unmanaged'
	/** ID is negative or > 2147483647 */
	| 'out-of-bounds';

/**
 * Returns an {@link IdRangeStatus} for the given resource ID.
 *
 * Returns `null` when the existing `id < 9000` check already covers the
 * situation (game-reserved IDs) or the id is NaN (empty field).
 */
export function useIdRangeValidation(id: number): IdRangeStatus | null {
	const { data } = useData();
	const { label, idRangeStart, idRangeEnd, idSignature } =
		data.packInfo || {};

	const [signatureValid, setSignatureValid] = useState<boolean | null>(null);

	useEffect(() => {
		if (
			label &&
			idRangeStart != null &&
			idRangeEnd != null &&
			idSignature
		) {
			let cancelled = false;
			verifyIdRange(label, idRangeStart, idRangeEnd, idSignature).then(
				(ok) => {
					if (!cancelled) setSignatureValid(ok);
				}
			);
			return () => {
				cancelled = true;
			};
		}
		setSignatureValid(null);
		return undefined;
	}, [label, idRangeStart, idRangeEnd, idSignature]);

	return useMemo(() => {
		if (isNaN(id)) return null; // empty field
		if (id < 0 || id > UNMANAGED_ID_MAX) return 'out-of-bounds';
		if (id <= GAME_ID_MAX) return null; // handled by existing "<9000" badge
		if (id >= UNMANAGED_ID_MIN) return 'unmanaged';

		// Managed range (9000 – 1073741823)
		if (signatureValid === null) return 'no-signature';
		if (!signatureValid) return 'invalid-signature';

		if (
			idRangeStart != null &&
			idRangeEnd != null &&
			id >= idRangeStart &&
			id <= idRangeEnd
		) {
			return 'valid';
		}

		return 'outside-allocation';
	}, [id, signatureValid, idRangeStart, idRangeEnd]);
}

/** Human-readable label for each status (used in ErrorBadge) */
export const ID_RANGE_STATUS_LABEL: Record<IdRangeStatus, string> = {
	valid: '',
	'no-signature': '未分配ID段',
	'invalid-signature': '签名无效',
	'outside-allocation': 'ID不在分配范围',
	unmanaged: '不受管理区ID',
	'out-of-bounds': 'ID超出有效范围',
};
