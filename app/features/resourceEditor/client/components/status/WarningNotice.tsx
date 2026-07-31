import { cn } from '@heroui/theme';
import { type ReactNode } from 'react';

interface IProps {
	children: ReactNode;
	className?: string;
}

export function WarningNotice({ children, className }: IProps) {
	return (
		<div
			className={cn(
				'rounded bg-warning/10 p-2 text-xs text-warning-600 dark:text-warning-400',
				className
			)}
		>
			{children}
		</div>
	);
}
