'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';

import {
	getOverlayCoordinatorSnapshot,
	handleOverlayCoordinatorKeyDown,
	subscribeOverlayCoordinator,
} from './store';

function getOutsidePortalInteractionRoots(portalContainer: HTMLElement) {
	const roots = new Set<HTMLElement>();
	let currentElement = portalContainer;
	let { parentElement } = currentElement;

	while (parentElement !== null) {
		for (const sibling of parentElement.children) {
			if (sibling !== currentElement && sibling instanceof HTMLElement) {
				roots.add(sibling);
			}
		}

		if (parentElement === document.body) {
			break;
		}

		currentElement = parentElement;
		parentElement = parentElement.parentElement;
	}

	return roots;
}

export default function OverlayCoordinatorHost() {
	const snapshot = useSyncExternalStore(
		subscribeOverlayCoordinator,
		getOverlayCoordinatorSnapshot,
		getOverlayCoordinatorSnapshot
	);
	const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
		null
	);
	const hasBlockingState =
		snapshot.activeBlockerId !== null ||
		snapshot.pendingBlockerId !== null ||
		snapshot.isBlockingTransition;

	useEffect(() => {
		globalThis.addEventListener(
			'keydown',
			handleOverlayCoordinatorKeyDown,
			{ capture: true }
		);

		return () => {
			globalThis.removeEventListener(
				'keydown',
				handleOverlayCoordinatorKeyDown,
				{ capture: true }
			);
		};
	}, []);

	useEffect(() => {
		setPortalContainer(document.querySelector('#modal-portal-container'));
	}, []);

	useEffect(() => {
		if (portalContainer === null || !hasBlockingState) {
			return;
		}

		const previousInertStates = new Map<HTMLElement, boolean>();
		const applyInert = () => {
			for (const root of getOutsidePortalInteractionRoots(
				portalContainer
			)) {
				if (!previousInertStates.has(root)) {
					previousInertStates.set(root, root.inert);
					root.inert = true;
				}
			}
		};
		applyInert();

		const observer = new MutationObserver(applyInert);
		let currentElement = portalContainer;
		let { parentElement } = currentElement;
		while (parentElement !== null) {
			observer.observe(parentElement, { childList: true });
			if (parentElement === document.body) {
				break;
			}
			currentElement = parentElement;
			parentElement = currentElement.parentElement;
		}

		return () => {
			observer.disconnect();
			previousInertStates.forEach((wasInert, root) => {
				root.inert = wasInert;
			});
		};
	}, [hasBlockingState, portalContainer]);

	return null;
}
