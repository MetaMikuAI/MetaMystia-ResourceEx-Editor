'use client';

import { ErrorBadge } from '@/features/resourceEditor/client/components/status/ErrorBadge';
import { WarningBadge } from '@/features/resourceEditor/client/components/status/WarningBadge';

import {
	ID_RANGE_STATUS_LABEL,
	useIdRangeValidation,
} from './useIdRangeValidation';

interface IProps {
	id: number;
}

export function IdRangeBadge({ id }: IProps) {
	const status = useIdRangeValidation(id);
	if (!status || status === 'valid') return null;
	if (status === 'unmanaged') {
		return <WarningBadge>{ID_RANGE_STATUS_LABEL[status]}</WarningBadge>;
	}
	return <ErrorBadge>{ID_RANGE_STATUS_LABEL[status]}</ErrorBadge>;
}
