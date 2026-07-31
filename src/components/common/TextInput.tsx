'use client';

import { cn } from '@heroui/theme';
import { forwardRef } from 'react';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	error?: boolean;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
	function TextInput({ className, error, ...props }, ref) {
		return (
			<input
				ref={ref}
				className={cn(
					'h-9 w-full rounded-lg border bg-background/40 px-3 py-2 text-sm text-foreground outline-none transition-all focus:ring-2',
					error
						? 'border-danger focus:border-danger focus:ring-danger/20'
						: 'border-divider focus:border-foreground/30 focus:ring-foreground/10',
					className
				)}
				{...props}
			/>
		);
	}
);
