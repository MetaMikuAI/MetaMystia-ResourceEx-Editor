'use client';

import { cn } from '@heroui/theme';
import { type ReactNode } from 'react';

interface EmptyStateProps {
	title: ReactNode;
	description?: ReactNode;
	className?: string;
	variant?: 'box' | 'text';
}

export function EmptyState({
	title,
	description,
	className,
	variant = 'box',
}: EmptyStateProps) {
	if (variant === 'text') {
		return (
			<div className={cn('text-center', className)}>
				<p className="text-sm text-foreground/40">{title}</p>
				{description && (
					<p className="mt-1 text-xs text-foreground/30">
						{description}
					</p>
				)}
			</div>
		);
	}

	return (
		<div
			className={cn(
				'rounded-lg border border-dashed border-divider p-8 text-center',
				className
			)}
		>
			<p className="text-sm text-foreground/40">{title}</p>
			{description && (
				<p className="mt-1 text-xs text-foreground/30">{description}</p>
			)}
		</div>
	);
}
