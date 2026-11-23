import { ExecuteNode } from '@gravitydock/types';
import type { InputDefinition, OutputDefinition, PropertyDefinition } from '@gravitydock/types';

import type { GravityDockAPI } from '@gravitydock/types';
import { normalizePathInput } from '../../utils/PathUtils';

declare const gravityDock: GravityDockAPI;

export class UnzipNode extends ExecuteNode {
    readonly category = { name: 'Filesystem', accent: 'blue-500' } as any;
    readonly typeId = 'fs-unzip';
    readonly displayName = 'Unzip';
    readonly visible = true;

    readonly inputs: InputDefinition[] = [
        { name: 'Zip File', acceptsType: ['core:path', 'core:string'] },
        { name: 'Destination Directory', acceptsType: ['core:path', 'core:string'] }
    ];

    readonly outputs: OutputDefinition[] = [
        { name: 'Success', outputType: 'core:boolean' }
    ];

    readonly properties: PropertyDefinition[] = [
        {
            name: 'zipFile',
            label: 'Zip File',
            type: 'filepath' as const,
            defaultValue: '',
            dialogProperties: ['openFile'],
            filters: [{ name: 'Zip Files', extensions: ['zip'] }]
        },
        {
            name: 'destinationDirectory',
            label: 'Destination Directory',
            type: 'filepath' as const,
            defaultValue: '',
            dialogProperties: ['openDirectory']
        },
        { name: 'overwrite', label: 'Overwrite', type: 'boolean' as const, defaultValue: false }
    ];

    async evaluate(inputs: Record<string, any>, properties: Record<string, any>): Promise<Record<string, any>> {
        const zipFile = await normalizePathInput(inputs['Zip File']) || await normalizePathInput(properties['zipFile']);
        const destDir = await normalizePathInput(inputs['Destination Directory']) || await normalizePathInput(properties['destinationDirectory']);
        const overwrite = properties['overwrite'] ?? false;
        
        if (!zipFile || !destDir) return { 'Success': false };
        
        try {
            await gravityDock.fs.unzip(zipFile, destDir, overwrite);
            return { 'Success': true };
        } catch (err) {
            console.error('Unzip error', err);
            return { 'Success': false };
        }
    }
}
