'use client';

import { createContext, useContext } from 'react';

import type { IResourceEditorContext } from './contracts';

export const ResourceEditorContext =
	createContext<IResourceEditorContext | null>(null);

export function useResourceEditor() {
	const context = useContext(ResourceEditorContext);
	if (!context) {
		throw new Error(
			'useResourceEditor must be used within a ResourceEditorProvider'
		);
	}
	return context;
}
