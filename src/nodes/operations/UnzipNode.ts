import { ExecuteNode } from '@gravitydock/types';
import type { InputDefinition, OutputDefinition, PropertyDefinition } from '@gravitydock/types';

import type { GravityDockAPI } from '@gravitydock/types';

declare const gravityDock: GravityDockAPI;

export class UnzipNode extends ExecuteNode {
    readonly category = { name: 'Filesystem', accent: 'blue-500' } as any;
    readonly typeId = 'fs-unzip';
    readonly displayName = 'Unzip';
    readonly visible = true;

    readonly inputs: InputDefinition[] = [
        { name: 'Zip File', acceptsType: 'core:path' },
        { name: 'Destination Directory', acceptsType: 'core:path' }
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
        const zipFile = (inputs['Zip File'] ? String(inputs['Zip File']) : '') || (properties['zipFile'] ? String(properties['zipFile']) : '');
        const destDir = (inputs['Destination Directory'] ? String(inputs['Destination Directory']) : '') || (properties['destinationDirectory'] ? String(properties['destinationDirectory']) : '');
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
