import { BaseNode } from '@gravitydock/types';
import type { InputDefinition, OutputDefinition, PropertyDefinition, GravityDockAPI } from '@gravitydock/types';
import { dirname } from '../../utils/PathUtils';

declare const gravityDock: GravityDockAPI;

export class CurrentDirectoryNode extends BaseNode {
    readonly typeId = 'fs-current-directory';
    readonly displayName = 'Current Directory';
    readonly category = { name: 'Path', accent: 'indigo-500' as any };
    readonly visible = true;

    readonly inputs: InputDefinition[] = [];

    readonly outputs: OutputDefinition[] = [
        { name: 'Path', outputType: 'core:path' }
    ];

    readonly properties: PropertyDefinition[] = [];

    async evaluate(inputs: Record<string, any>, properties: Record<string, any>): Promise<Record<string, any>> {
        if (properties['_isGeneratedScript']) {
            const scriptDir = properties['_currentDirectory']
                || (properties['_currentFilePath'] ? dirname(String(properties['_currentFilePath'])) : '')
                || (typeof __dirname !== 'undefined' ? __dirname : '')
                || (typeof process !== 'undefined' && process.cwd ? process.cwd() : '');
            return {
                'Path': scriptDir
            };
        }

        if (properties['_homeDir']) {
            return {
                'Path': properties['_homeDir']
            };
        }

        if (typeof gravityDock !== 'undefined' && gravityDock.fs && typeof (gravityDock.fs as any).getHomeDir === 'function') {
            const home = await (gravityDock.fs as any).getHomeDir();
            if (home) {
                return {
                    'Path': home
                };
            }
        }

        const envHome = (typeof process !== 'undefined' && process.env)
            ? (process.env.HOME || process.env.USERPROFILE || '')
            : '';
        return {
            'Path': envHome
        };
    }
}
