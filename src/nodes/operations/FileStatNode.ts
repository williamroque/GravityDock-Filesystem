import { ExecuteNode } from '@gravitydock/types';
import type { InputDefinition, OutputDefinition, PropertyDefinition } from '@gravitydock/types';

import type { GravityDockAPI } from '@gravitydock/types';
import { normalizePathInput } from '../../utils/PathUtils';

declare const gravityDock: GravityDockAPI;

export class FileStatNode extends ExecuteNode {
    readonly category = { name: 'Filesystem', accent: 'blue-500' } as any;
    readonly typeId = 'fs-stat';
    readonly displayName = 'File Stat';
    readonly visible = true;

    readonly inputs: InputDefinition[] = [
        { name: 'Path', acceptsType: ['core:path', 'core:string'] }
    ];

    readonly outputs: OutputDefinition[] = [
        { name: 'Stat', outputType: 'fs:stat' }
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
        const p = await normalizePathInput(inputs['Path']) || await normalizePathInput(properties['path']);
        if (!p) return {};
        
        try {
            const stat = await gravityDock.fs.stat(p);
            return { 'Stat': stat };
        } catch (err) {
            console.error('FileStat error', err);
            return {};
        }
    }
}
