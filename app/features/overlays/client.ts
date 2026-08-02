export { default as CoordinatedModal } from './client/CoordinatedModal';
export type { ICoordinatedModalProps } from './client/CoordinatedModal';
export { default as OverlayCoordinatorHost } from './client/OverlayCoordinatorHost';
export {
	handoffOverlay,
	pushOverlayChild,
	requestOverlayClose,
	requestOverlayCloseAndWait,
	requestOverlayOpen,
	setExternallyOwnedOverlayRequested,
} from './client/store';
export { useCoordinatedOverlay } from './client/useCoordinatedOverlay';
export type * from './contracts';
