'use client';

import { cn } from '@heroui/theme';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
	autoResize?: boolean;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
	function TextArea({ className, autoResize, value, ...props }, ref) {
		const innerRef = useRef<HTMLTextAreaElement>(null);
		useImperativeHandle(ref, () => innerRef.current!);

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
					'min-h-[120px] w-full rounded-lg border border-divider bg-background/40 px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-foreground/30 focus:ring-2 focus:ring-foreground/10',
					className
				)}
				value={value}
				{...props}
			/>
		);
	}
);
