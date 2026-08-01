interface ParentNode {
	querySelector(selectors: 'main' | '#modal-portal-container'): HTMLElement;
}

type ReactNodeWithoutBoolean = Exclude<React.ReactNode, boolean>;
type HTMLDivElementAttributes = import('react').HTMLAttributes<HTMLDivElement>;
type HTMLHeadingElementAttributes =
	import('react').HTMLAttributes<HTMLHeadingElement>;
type HTMLSpanElementAttributes =
	import('react').HTMLAttributes<HTMLSpanElement>;
