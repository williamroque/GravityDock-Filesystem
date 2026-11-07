import { ExecuteNode } from '@gravitydock/types';
import type { InputDefinition, OutputDefinition, PropertyDefinition } from '@gravitydock/types';
import type { GravityDockAPI } from '@gravitydock/types';

declare const gravityDock: GravityDockAPI;

export class FilePickerNode extends ExecuteNode {
    readonly typeId = 'fs-file-picker';
    readonly displayName = 'File Picker';
    readonly category = { name: 'I/O', accent: 'fuchsia-500' as any };
    readonly visible = true;

    readonly inputs: InputDefinition[] = [];

    readonly outputs: OutputDefinition[] = [
        { name: 'Path', outputType: 'core:path' },
        { name: 'Is Directory', outputType: 'core:boolean' },
        { name: 'Extension', outputType: 'core:string' },
        { name: 'Exists', outputType: 'core:boolean' }
    ];

    readonly properties: PropertyDefinition[] = [
        {
            name: 'path',
            label: 'Path',
            type: 'filepath' as const,
            defaultValue: '',
            dialogProperties: ['openFile']
        },
        {
            name: 'mode',
            label: 'Mode',
            type: 'select' as const,
            defaultValue: 'open',
            options: [
                { label: 'Open', value: 'open' },
                { label: 'Save', value: 'save' }
            ]
        },
        {
            name: 'isDirectory',
            label: 'Directory',
            type: 'boolean' as const,
            defaultValue: false
        },
        {
            name: 'extensions',
            label: 'Extensions',
            type: 'string' as const,
            defaultValue: ''
        },
        {
            name: 'showHiddenFiles',
            label: 'Show Hidden Files',
            type: 'boolean' as const,
            defaultValue: false
        }
    ];

    async evaluate(inputs: Record<string, any>, properties: Record<string, any>): Promise<Record<string, any>> {
        const isSave = properties['mode'] === 'save' || properties['dialogType'] === 'save' || Boolean(properties['save']);
        const isDirectory = !isSave && Boolean(properties['isDirectory']);
        const showHidden = Boolean(properties['showHiddenFiles']);

        let filters: { name: string; extensions: string[] }[] | undefined;
        if (!isDirectory && typeof properties['extensions'] === 'string' && properties['extensions'].trim()) {
            const exts = properties['extensions']
                .split(',')
                .map((s: string) => s.trim().replace(/^\*\.?/, '').replace(/^\./, ''))
                .filter(Boolean);
            if (exts.length > 0) {
                filters = [{ name: 'Allowed Files', extensions: exts }];
            }
        }

        let selectedPath = '';

        if (isSave) {
            const showSaveDialogFn = (typeof gravityDock !== 'undefined' && (gravityDock.dialog?.showSaveDialog || gravityDock.fs?.showSaveDialog))
                || (typeof window !== 'undefined' && (window as any).api?.dialog?.showSaveDialog);

            if (showSaveDialogFn) {
                try {
                    const saveProps: string[] = [];
                    if (showHidden) {
                        saveProps.push('showHiddenFiles');
                    }
                    const result = await showSaveDialogFn({
                        properties: saveProps,
                        filters,
                        defaultPath: properties['path'] ? String(properties['path']) : undefined
                    });
                    if (result && !result.canceled && result.filePath) {
                        selectedPath = result.filePath;
                    }
                } catch (err) {
                    console.error('FilePicker save dialog error:', err);
                }
            }
        } else {
            const dialogProperties: string[] = isDirectory ? ['openDirectory'] : ['openFile'];
            if (showHidden) {
                dialogProperties.push('showHiddenFiles');
            }

            const showOpenDialogFn = (typeof gravityDock !== 'undefined' && (gravityDock.dialog?.showOpenDialog || gravityDock.fs?.showOpenDialog))
                || (typeof window !== 'undefined' && (window as any).api?.dialog?.showOpenDialog);

            if (showOpenDialogFn) {
                try {
                    const result = await showOpenDialogFn({
                        properties: dialogProperties,
                        filters,
                        defaultPath: properties['path'] ? String(properties['path']) : undefined
                    });
                    if (result && !result.canceled && result.filePaths && result.filePaths.length > 0) {
                        selectedPath = result.filePaths[0];
                    }
                } catch (err) {
                    console.error('FilePicker open dialog error:', err);
                }
            }
        }

        if (!selectedPath) {
            selectedPath = (inputs['Path'] ? String(inputs['Path']) : '') || (properties['path'] ? String(properties['path']) : '');
        }

        if (!selectedPath) {
            return {
                'Path': '',
                'Is Directory': isDirectory,
                'Extension': '',
                'Exists': false
            };
        }

        let isDir = isDirectory;
        let exists = false;
        try {
            const stat = await gravityDock.fs.stat(selectedPath);
            if (stat) {
                exists = true;
                isDir = Boolean(stat.isDirectory);
            }
        } catch (_) {
            exists = false;
        }

        const ext = selectedPath.includes('.') ? selectedPath.split('.').pop() || '' : '';

        return {
            'Path': selectedPath,
            'Is Directory': isDir,
            'Extension': ext,
            'Exists': exists
        };
    }
}
