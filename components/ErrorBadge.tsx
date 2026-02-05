import { type ReactNode } from 'react';
import { cn } from '@/lib';

interface ErrorBadgeProps {
	children: ReactNode;
	className?: string;
}

/**
 * 用于显示错误或验证失败的标签（如 ID 冲突、命名重复等）
 */
export function ErrorBadge({ children, className }: ErrorBadgeProps) {
	return (
		<span
			className={cn(
				'rounded bg-danger px-1.5 py-0.5 text-[10px] font-medium text-white',
				className
			)}
		>
			{children}
		</span>
	);
}
