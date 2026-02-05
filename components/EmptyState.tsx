'use client';

import { type ReactNode } from 'react';
import { cn } from '@/lib';

interface EmptyStateProps {
	title: ReactNode;
	description?: ReactNode;
	className?: string;
	variant?: 'box' | 'text';
}

/**
 * 统一的空状态组件
 * @param title 主要提示文本
 * @param description 次要提示文本（可选）
 * @param variant 显示风格：'box' (默认，带虚线边框) | 'text' (纯文本)
 */
export function EmptyState({
	title,
	description,
	className,
	variant = 'box',
}: EmptyStateProps) {
	if (variant === 'text') {
		return (
			<div className={cn('text-center', className)}>
				<p className="text-sm text-black/40 dark:text-white/40">
					{title}
				</p>
				{description && (
					<p className="mt-1 text-xs text-black/30 dark:text-white/30">
						{description}
					</p>
				)}
			</div>
		);
	}

	return (
		<div
			className={cn(
				'rounded-lg border border-dashed border-black/10 p-8 text-center dark:border-white/10',
				className
			)}
		>
			<p className="text-sm text-black/40 dark:text-white/40">{title}</p>
			{description && (
				<p className="mt-1 text-xs text-black/30 dark:text-white/30">
					{description}
				</p>
			)}
		</div>
	);
}
