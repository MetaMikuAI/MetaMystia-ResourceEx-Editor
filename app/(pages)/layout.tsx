import { type PropsWithChildren } from 'react';

import { ResourceEditorRouteGuard } from '@/features/resourceEditor/client/workspaces/components/ResourceEditorRouteGuard';

export default function EditorPagesLayout({ children }: PropsWithChildren) {
	return <ResourceEditorRouteGuard>{children}</ResourceEditorRouteGuard>;
}
