import { cn } from '@heroui/theme';
import { type ReactNode } from 'react';

interface WarningBadgeProps {
	children: ReactNode;
	className?: string;
}

export function WarningBadge({ children, className }: WarningBadgeProps) {
	return (
		<span
			className={cn(
				'rounded bg-warning px-1.5 py-0.5 text-[10px] font-medium text-white',
				className
			)}
		>
			{children}
		</span>
	);
}
