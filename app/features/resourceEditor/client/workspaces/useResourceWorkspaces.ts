'use client';

import { createContext, useContext } from 'react';

import type { IResourceWorkspaceContext } from './contracts';

export const ResourceWorkspaceContext =
	createContext<IResourceWorkspaceContext | null>(null);

export function useResourceWorkspaces() {
	const context = useContext(ResourceWorkspaceContext);
	if (!context) {
		throw new Error(
			'useResourceWorkspaces must be used within a ResourceWorkspaceProvider'
		);
	}
	return context;
}
