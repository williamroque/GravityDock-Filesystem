import { ExecuteNode } from '@gravitydock/types';
import type { InputDefinition, OutputDefinition, PropertyDefinition } from '@gravitydock/types';

import type { GravityDockAPI } from '@gravitydock/types';

declare const gravityDock: GravityDockAPI;

export class ZipNode extends ExecuteNode {
    readonly category = { name: 'Filesystem', accent: 'blue-500' } as any;
    readonly typeId = 'fs-zip';
    readonly displayName = 'Zip';
    readonly visible = true;

    readonly inputs: InputDefinition[] = [
        { name: 'Source', acceptsType: 'core:path' },
        { name: 'Destination Zip', acceptsType: 'core:path' }
    ];

    readonly outputs: OutputDefinition[] = [
        { name: 'Success', outputType: 'core:boolean' }
    ];

    readonly properties: PropertyDefinition[] = [
        {
            name: 'source',
            label: 'Source',
            type: 'filepath' as const,
            defaultValue: '',
            dialogProperties: ['openFile', 'openDirectory']
        },
        {
            name: 'destinationZip',
            label: 'Destination Zip',
            type: 'filepath' as const,
            defaultValue: '',
            filters: [{ name: 'Zip Files', extensions: ['zip'] }]
        },
        { name: 'overwrite', label: 'Overwrite', type: 'boolean' as const, defaultValue: false }
    ];

    async evaluate(inputs: Record<string, any>, properties: Record<string, any>): Promise<Record<string, any>> {
        const source = inputs['Source'] || properties['source'];
        const destZip = (inputs['Destination Zip'] ? String(inputs['Destination Zip']) : '') || (properties['destinationZip'] ? String(properties['destinationZip']) : '');
        const overwrite = properties['overwrite'] ?? false;
        
        if (!source || !destZip) return { 'Success': false };
        
        try {
            await gravityDock.fs.zip(source, destZip, overwrite);
            return { 'Success': true };
        } catch (err) {
            console.error('Zip error', err);
            return { 'Success': false };
        }
    }
}
