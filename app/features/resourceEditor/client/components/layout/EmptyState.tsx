import { cn } from '@heroui/theme';
import { type ReactNode } from 'react';

import Placeholder from '@/design/ui/components/placeholder';

interface IProps {
	title: ReactNode;
	description?: ReactNode;
	className?: string;
	variant?: 'box' | 'text';
}

export function EmptyState({
	className,
	description,
	title,
	variant = 'box',
}: IProps) {
	return (
		<Placeholder
			className={cn(
				variant === 'box' &&
					'rounded-large border border-dashed border-divider p-8',
				className
			)}
		>
			<p className="text-sm">{title}</p>
			{description !== undefined && (
				<p className="mt-1 text-xs font-normal opacity-70">
					{description}
				</p>
			)}
		</Placeholder>
	);
}
