import { forwardRef } from 'react';
import { cn } from '@/lib';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	error?: boolean;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
	function TextInput({ className, error, ...props }, ref) {
		return (
			<input
				ref={ref}
				className={cn(
					'h-9 w-full rounded-lg border bg-white/40 px-3 py-2 text-sm text-foreground outline-none transition-all focus:ring-2 dark:bg-black/10',
					error
						? 'border-danger focus:border-danger focus:ring-danger/20'
						: 'border-black/10 focus:border-black/30 focus:ring-black/10 dark:border-white/10 dark:focus:border-white/30 dark:focus:ring-white/10',
					className
				)}
				{...props}
			/>
		);
	}
);
