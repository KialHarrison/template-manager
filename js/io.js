import { setTemplates, getTemplates } from './data.js';
import { renderTemplates, showImportConfirmModal, showDropZone, hideDropZone, hideImportConfirmModal } from './ui.js';

export const initializeIO = () => {
    const exportBtn = document.getElementById('export-btn');
    const importBtn = document.getElementById('import-btn');
    const importFileInput = document.getElementById('import-file');
    const overwriteImportBtn = document.getElementById('overwrite-import-btn');
    const mergeImportBtn = document.getElementById('merge-import-btn');

    let fileToImport = null;

    const handleImport = (file) => {
        if (file && file.type === 'application/json') {
            fileToImport = file;
            showImportConfirmModal();
        } else {
            alert('Please drop a valid JSON file.');
        }
    };

    const processFile = (file, importType) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedTemplates = JSON.parse(event.target.result);
                if (typeof importedTemplates === 'object' && importedTemplates !== null) {
                    let currentTemplates = getTemplates();

                    if (importType === 'overwrite') {
                        setTemplates(importedTemplates);
                    } else if (importType === 'merge') {
                        importedTemplates.forEach(importedFolderObj => {
                            const existingFolder = currentTemplates.find(f => f.folder === importedFolderObj.folder);
                            if (existingFolder) {
                                importedFolderObj.templates.forEach(newTemplate => {
                                    const isDuplicate = existingFolder.templates.some(existingTemplate => existingTemplate.title === newTemplate.title);
                                    if (!isDuplicate) {
                                        existingFolder.templates.push(newTemplate);
                                    }
                                });
                            } else {
                                currentTemplates.push(importedFolderObj);
                            }
                        });
                        setTemplates(currentTemplates);
                    }
                    renderTemplates();
                } else {
                    alert('Invalid file format.');
                }
            } catch (error) {
                alert('Error parsing file. Please make sure it is a valid JSON file.');
            }
        };
        reader.readAsText(file);
    };

    exportBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const templates = getTemplates();
        if (templates) {
            const blob = new Blob([JSON.stringify(templates, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'email-templates.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    });

    importBtn.addEventListener('click', (e) => {
        e.preventDefault();
        importFileInput.click();
    });

    importFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleImport(file);
        }
        e.target.value = '';
    });

    let dragCounter = 0;

    window.addEventListener('dragenter', (e) => {
        if (e.dataTransfer.types.includes('Files')) {
            e.preventDefault();
            dragCounter++;
            showDropZone();
        }
    });

    document.getElementById('drop-zone').addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    document.getElementById('drop-zone').addEventListener('dragleave', (e) => {
        e.preventDefault();
        dragCounter--;
        if (dragCounter === 0) {
            hideDropZone();
        }
    });

    document.getElementById('drop-zone').addEventListener('drop', (e) => {
        e.preventDefault();
        dragCounter = 0;
        hideDropZone();
        const file = e.dataTransfer.files[0];
        handleImport(file);
    });

    overwriteImportBtn.addEventListener('click', () => {
        if (fileToImport) {
            processFile(fileToImport, 'overwrite');
        }
        fileToImport = null;
        hideImportConfirmModal();
    });

    mergeImportBtn.addEventListener('click', () => {
        if (fileToImport) {
            processFile(fileToImport, 'merge');
        }
        fileToImport = null;
        hideImportConfirmModal();
    });
};
