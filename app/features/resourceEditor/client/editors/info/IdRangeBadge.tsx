'use client';

import { ErrorBadge } from '@/features/resourceEditor/client/components/status/ErrorBadge';

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
		return (
			<span className="rounded bg-warning px-1.5 py-0.5 text-[10px] font-medium text-white">
				{ID_RANGE_STATUS_LABEL[status]}
			</span>
		);
	}
	return <ErrorBadge>{ID_RANGE_STATUS_LABEL[status]}</ErrorBadge>;
}
