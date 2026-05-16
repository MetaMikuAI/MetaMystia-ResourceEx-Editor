'use client';

import { memo, useCallback, useEffect, useRef, useState } from 'react';

import { Button, cn } from '@/design/ui/components';
import { ChevronDown } from '@/components/icons/ChevronDown';
import { ChevronUp } from '@/components/icons/ChevronUp';

// -----------------------------------------------------------------------------
// 常量
// -----------------------------------------------------------------------------

/** 超过此滚动高度时显示按钮 */
const SCROLL_THRESHOLD = 300;

/** 程序化滚动期间的冷却时间，期间不响应手动滚动判断 */
const SCROLL_COOLDOWN_MS = 1200;

// -----------------------------------------------------------------------------
// 组件
// -----------------------------------------------------------------------------

export const BackToTop = memo(function BackToTop() {
	const [show, setShow] = useState(false);
	const [isAtTop, setIsAtTop] = useState(true);

	const savedPositionRef = useRef<number | null>(null);
	const isProgrammaticRef = useRef(false);

	// -------------------------------------------------------------------------
	// 滚动监听
	// -------------------------------------------------------------------------

	useEffect(() => {
		const handleScroll = () => {
			const y = window.scrollY;
			setShow(y > SCROLL_THRESHOLD);
			setIsAtTop(y < 10);

			if (
				!isProgrammaticRef.current &&
				savedPositionRef.current !== null &&
				y > 10
			) {
				savedPositionRef.current = null;
			}
		};

		handleScroll();
		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	// -------------------------------------------------------------------------
	// 程序化滚动
	// -------------------------------------------------------------------------

	const scrollTo = useCallback((target: number) => {
		isProgrammaticRef.current = true;
		window.scrollTo({ top: target, behavior: 'smooth' });
		setTimeout(() => {
			isProgrammaticRef.current = false;
		}, SCROLL_COOLDOWN_MS);
	}, []);

	// -------------------------------------------------------------------------
	// 点击处理
	// -------------------------------------------------------------------------

	const handleClick = useCallback(() => {
		if (savedPositionRef.current !== null && window.scrollY < 10) {
			const pos = savedPositionRef.current;
			savedPositionRef.current = null;
			scrollTo(pos);
		} else {
			savedPositionRef.current = window.scrollY;
			scrollTo(0);
		}
	}, [scrollTo]);

	// -------------------------------------------------------------------------
	// 显隐判断
	// -------------------------------------------------------------------------

	const hasSavedPosition = savedPositionRef.current !== null;
	const isReturnMode = hasSavedPosition && isAtTop;
	const visible = show || hasSavedPosition;

	return (
		<div
			className={cn(
				'fixed bottom-6 right-6 z-50',
				'transition-all duration-200',
				visible
					? 'translate-y-0 opacity-100'
					: 'pointer-events-none translate-y-4 opacity-0'
			)}
		>
			<Button
				isIconOnly
				aria-label={isReturnMode ? '返回之前位置' : '回到顶部'}
				variant="solid"
				color="primary"
				radius="full"
				disableAnimation
				className="h-10 w-10 shadow-lg"
				tabIndex={visible ? undefined : -1}
				onPress={handleClick}
			>
				{isReturnMode ? (
					<ChevronDown width="22" height="22" />
				) : (
					<ChevronUp width="22" height="22" />
				)}
			</Button>
		</div>
	);
});
