import { useCallback, useEffect, useMemo, useState } from 'react';

import {
	MANAGED_ID_MAX,
	MANAGED_ID_MIN,
} from '@/domain/resourcePack/constants';

import {
	signIdRange,
	verifyIdRange,
} from '@/infrastructure/browser/crypto/idRangeSignature';

export type TIdRangeVerifyStatus = 'idle' | 'valid' | 'invalid' | 'verifying';

interface IOptions {
	idRangeEnd: number | undefined;
	idRangeStart: number | undefined;
	idSignature: string | undefined;
	label: string | undefined;
}

export function useIdRangeEditor({
	idRangeEnd,
	idRangeStart,
	idSignature,
	label,
}: IOptions) {
	const [verifyStatus, setVerifyStatus] =
		useState<TIdRangeVerifyStatus>('idle');

	useEffect(() => {
		if (
			!label ||
			idRangeStart == null ||
			idRangeEnd == null ||
			!idSignature
		) {
			setVerifyStatus('idle');
			return;
		}

		let isCancelled = false;
		setVerifyStatus('verifying');
		void verifyIdRange(label, idRangeStart, idRangeEnd, idSignature).then(
			(isValid) => {
				if (!isCancelled)
					setVerifyStatus(isValid ? 'valid' : 'invalid');
			}
		);
		return () => {
			isCancelled = true;
		};
	}, [idRangeEnd, idRangeStart, idSignature, label]);

	const rangeError = useMemo(() => {
		if (idRangeStart == null && idRangeEnd == null) return null;
		if (idRangeStart == null || idRangeEnd == null) {
			return '请同时填写起始和结束';
		}
		if (idRangeStart < MANAGED_ID_MIN) {
			return `起始ID不能小于${MANAGED_ID_MIN}`;
		}
		if (idRangeEnd > MANAGED_ID_MAX) {
			return `结束ID不能大于${MANAGED_ID_MAX}`;
		}
		if (idRangeStart > idRangeEnd) return '起始ID不能大于结束ID';
		return null;
	}, [idRangeEnd, idRangeStart]);

	const sign = useCallback(
		(privateKey: string) => {
			if (!label || idRangeStart == null || idRangeEnd == null) {
				throw new Error('请先填写有效的资源包标识符（Label）与ID段');
			}
			return signIdRange(privateKey, label, idRangeStart, idRangeEnd);
		},
		[idRangeEnd, idRangeStart, label]
	);

	return {
		canSign:
			Boolean(label) &&
			idRangeStart != null &&
			idRangeEnd != null &&
			rangeError === null,
		managedIdMax: MANAGED_ID_MAX,
		managedIdMin: MANAGED_ID_MIN,
		rangeError,
		sign,
		verifyStatus,
	};
}
