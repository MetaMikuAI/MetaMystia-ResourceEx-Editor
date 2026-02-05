'use client';
import { memo, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib';

interface InfoTipProps {
	children: React.ReactNode;
	className?: string;
}

export const InfoTip = memo<InfoTipProps>(function InfoTip({
	children,
	className,
}) {
	const [isVisible, setIsVisible] = useState(false);
	const [coords, setCoords] = useState<{ left: number; top: number } | null>(
		null
	);
	const btnRef = useRef<HTMLButtonElement | null>(null);

	const updatePos = () => {
		const el = btnRef.current;
		if (!el) return setCoords(null);
		const r = el.getBoundingClientRect();
		setCoords({
			left: r.left + r.width / 2 + window.scrollX,
			top: r.top + window.scrollY,
		});
	};

	useEffect(() => {
		if (!isVisible) return;
		updatePos();
		const onScroll = () => updatePos();
		window.addEventListener('scroll', onScroll, true);
		window.addEventListener('resize', updatePos);
		return () => {
			window.removeEventListener('scroll', onScroll, true);
			window.removeEventListener('resize', updatePos);
		};
	}, [isVisible]);

	const popup = coords ? (
		<div
			style={{ left: coords.left, top: coords.top - 8 }}
			className="pointer-events-none"
		>
			<div
				className="fixed z-[9999] -translate-x-1/2 transform whitespace-nowrap rounded-lg border border-blue-500/20 bg-blue-50 px-3 py-2 text-xs text-blue-900 shadow-lg dark:border-blue-400/20 dark:bg-blue-950 dark:text-blue-100"
				style={{
					left: coords.left,
					top: coords.top - 8,
					transform: 'translateX(-50%) translateY(-100%)',
				}}
			>
				{children}
				<div className="absolute left-1/2 top-full -translate-x-1/2">
					<div className="-mt-1 h-0 w-0 border-8 border-transparent border-t-blue-50 dark:border-t-blue-950" />
				</div>
			</div>
		</div>
	) : null;

	return (
		<>
			<div className={cn('relative inline-flex', className)}>
				<button
					ref={btnRef}
					type="button"
					onMouseEnter={() => setIsVisible(true)}
					onMouseLeave={() => setIsVisible(false)}
					className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500/20 text-blue-600 transition-colors hover:bg-blue-500/30 dark:bg-blue-400/20 dark:text-blue-400 dark:hover:bg-blue-400/30"
				>
					<span className="text-xs font-bold">?</span>
				</button>
			</div>
			{isVisible && typeof document !== 'undefined'
				? createPortal(popup, document.body)
				: null}
		</>
	);
});
