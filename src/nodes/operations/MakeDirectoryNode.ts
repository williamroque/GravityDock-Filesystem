import { ExecuteNode } from '@gravitydock/types';
import type { InputDefinition, OutputDefinition, PropertyDefinition } from '@gravitydock/types';

import type { GravityDockAPI } from '@gravitydock/types';

declare const gravityDock: GravityDockAPI;

export class MakeDirectoryNode extends ExecuteNode {
    readonly category = { name: 'Filesystem', accent: 'blue-500' } as any;
    readonly typeId = 'fs-mkdir';
    readonly displayName = 'Make Directory';
    readonly visible = true;

    readonly inputs: InputDefinition[] = [
        { name: 'Path', acceptsType: 'core:path' }
    ];

    readonly outputs: OutputDefinition[] = [
        { name: 'Success', outputType: 'core:boolean' }
    ];

    readonly properties: PropertyDefinition[] = [
        { name: 'recursive', label: 'Recursive', type: 'boolean' as const, defaultValue: true }
    ];

    async evaluate(inputs: Record<string, any>, properties: Record<string, any>): Promise<Record<string, any>> {
        const p = inputs['Path'] ? String(inputs['Path']) : '';
        const recursive = properties['recursive'] ?? true;
        
        if (!p) return { 'Success': false };
        
        try {
            await gravityDock.fs.mkdir(p, { recursive });
            return { 'Success': true };
        } catch (err) {
            console.error('MakeDirectory error', err);
            return { 'Success': false };
        }
    }
}
