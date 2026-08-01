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
					'min-h-32 rounded-large border border-dashed border-divider bg-content2/20 p-6 sm:p-8',
				className
			)}
		>
			<p className="text-sm font-semibold text-foreground-700">{title}</p>
			{description !== undefined && (
				<p className="max-w-prose text-xs font-normal leading-relaxed text-foreground-500">
					{description}
				</p>
			)}
		</Placeholder>
	);
}
