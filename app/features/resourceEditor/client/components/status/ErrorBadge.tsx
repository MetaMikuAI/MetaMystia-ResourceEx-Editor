import { cn } from '@heroui/theme';
import { type ReactNode } from 'react';

interface IProps {
	children: ReactNode;
	className?: string;
}

export function ErrorBadge({ children, className }: IProps) {
	return (
		<span
			className={cn(
				'rounded-small bg-danger px-1.5 py-0.5 text-[10px] font-medium text-danger-foreground',
				className
			)}
		>
			{children}
		</span>
	);
}
