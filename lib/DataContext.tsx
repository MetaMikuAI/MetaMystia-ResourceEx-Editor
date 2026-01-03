'use client';

import {
	createContext,
	useContext,
	useState,
	useEffect,
	type ReactNode,
} from 'react';
import type { ResourceEx } from '@/types/resource';

interface DataContextType {
	data: ResourceEx;
	setData: (data: ResourceEx) => void;
	hasUnsavedChanges: boolean;
	setHasUnsavedChanges: (value: boolean) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
	const [data, setData] = useState<ResourceEx>({
		characters: [],
		dialogPackages: [],
	});
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

	useEffect(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			if (hasUnsavedChanges) {
				e.preventDefault();
				e.returnValue = '';
			}
		};
		window.addEventListener('beforeunload', handleBeforeUnload);
		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	}, [hasUnsavedChanges]);

	return (
		<DataContext.Provider
			value={{ data, setData, hasUnsavedChanges, setHasUnsavedChanges }}
		>
			{children}
		</DataContext.Provider>
	);
}

export function useData() {
	const context = useContext(DataContext);
	if (!context) {
		throw new Error('useData must be used within a DataProvider');
	}
	return context;
}
