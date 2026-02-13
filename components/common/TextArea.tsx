import { forwardRef, useEffect, useRef, useImperativeHandle } from 'react';
import { cn } from '@/lib';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
	autoResize?: boolean;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
	function TextArea({ className, autoResize, value, ...props }, ref) {
		const innerRef = useRef<HTMLTextAreaElement>(null);
		useImperativeHandle(ref, () => innerRef.current!);

		// Auto-resize functionality
		useEffect(() => {
			if (autoResize && innerRef.current) {
				innerRef.current.style.height = 'auto';
				innerRef.current.style.height = `${innerRef.current.scrollHeight}px`;
			}
		}, [autoResize, value]);

		return (
			<textarea
				ref={innerRef}
				className={cn(
					'min-h-[120px] w-full rounded-lg border border-black/10 bg-white/40 px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-black/30 focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-black/10 dark:focus:border-white/30 dark:focus:ring-white/10',
					className
				)}
				value={value}
				{...props}
			/>
		);
	}
);
