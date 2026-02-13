import {
	useIdRangeValidation,
	ID_RANGE_STATUS_LABEL,
} from '@/components/common/useIdRangeValidation';
import { ErrorBadge } from '@/components/common/ErrorBadge';

interface IdRangeBadgeProps {
	id: number;
}

/**
 * Displays an {@link ErrorBadge} or warning badge based on the ID range
 * validation result. Renders nothing when the status is `valid` or `null`.
 */
export function IdRangeBadge({ id }: IdRangeBadgeProps) {
	const status = useIdRangeValidation(id);

	if (!status || status === 'valid') return null;

	if (status === 'unmanaged') {
		return (
			<span className="rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
				{ID_RANGE_STATUS_LABEL[status]}
			</span>
		);
	}

	return <ErrorBadge>{ID_RANGE_STATUS_LABEL[status]}</ErrorBadge>;
}
