import { type ReactNode } from 'react';
import { cn } from '@/lib';

interface WarningBadgeProps {
	children: ReactNode;
	className?: string;
}

/**
 * 用于显示非阻断性的警告标签（如命名前缀不规范等）
 */
export function WarningBadge({ children, className }: WarningBadgeProps) {
	return (
		<span
			className={cn(
				'rounded bg-yellow-500 px-1.5 py-0.5 text-[10px] font-medium text-white',
				className
			)}
		>
			{children}
		</span>
	);
}
