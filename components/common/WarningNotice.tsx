import { type ReactNode } from 'react';
import { cn } from '@/lib';

interface WarningNoticeProps {
	children: ReactNode;
	className?: string;
}

/**
 * 用于显示警告或未实现功能的提示框
 */
export function WarningNotice({ children, className }: WarningNoticeProps) {
	return (
		<div
			className={cn(
				'rounded bg-yellow-500/10 p-2 text-xs text-yellow-600 dark:text-yellow-400',
				className
			)}
		>
			{children}
		</div>
	);
}
