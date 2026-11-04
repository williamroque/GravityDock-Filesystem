import { ExecuteNode } from '@gravitydock/types';
import type { InputDefinition, OutputDefinition, PropertyDefinition } from '@gravitydock/types';

import type { GravityDockAPI } from '@gravitydock/types';

declare const gravityDock: GravityDockAPI;

export class MoveToTrashNode extends ExecuteNode {
    readonly category = { name: 'Filesystem', accent: 'blue-500' } as any;
    readonly typeId = 'fs-move-to-trash';
    readonly displayName = 'Move to Trash';
    readonly visible = true;

    readonly inputs: InputDefinition[] = [
        { name: 'Path', acceptsType: 'core:path' }
    ];

    readonly outputs: OutputDefinition[] = [
        { name: 'Success', outputType: 'core:boolean' }
    ];

    readonly properties: PropertyDefinition[] = [
        {
            name: 'path',
            label: 'Path',
            type: 'filepath' as const,
            defaultValue: '',
            dialogProperties: ['openFile', 'openDirectory']
        }
    ];

    async evaluate(inputs: Record<string, any>, properties: Record<string, any>): Promise<Record<string, any>> {
        const pathInput = inputs['Path'] || properties['path'];
        if (!pathInput) return { 'Success': false };
        
        const paths: string[] = Array.isArray(pathInput) ? pathInput : [String(pathInput)];

        try {
            for (const p of paths) {
                await gravityDock.fs.trash(String(p));
            }
            return { 'Success': true };
        } catch (err) {
            console.error('MoveToTrash error', err);
            return { 'Success': false };
        }
    }
}
