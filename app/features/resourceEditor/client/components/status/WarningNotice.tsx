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
				'rounded-medium border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-foreground-700',
				className
			)}
		>
			{children}
		</div>
	);
}
