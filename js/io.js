import { setTemplates, getTemplates } from './data.js';
import { renderTemplates, showImportConfirmModal, showDropZone, hideDropZone, hideImportConfirmModal } from './ui.js';

export const initializeIO = () => {
    console.log('initializeIO called.');
    const exportJsonBtn = document.getElementById('export-json-btn');
    const exportCsvBtn = document.getElementById('export-csv-btn');
    const importBtn = document.getElementById('import-btn');
    const importFileInput = document.getElementById('import-file');
    const overwriteImportBtn = document.getElementById('overwrite-import-btn');
    const mergeImportBtn = document.getElementById('merge-import-btn');

    let fileToImport = null;
    let importFileType = null;

    const convertToCsv = (data) => {
        console.log('convertToCsv called with data:', data);
        const headers = ["folder", "title", "content"];
        let csv = headers.join(",") + "\n";
        data.forEach(folderObj => {
            folderObj.templates.forEach(template => {
                const folder = `"${folderObj.folder.replace(/"/g, '""')}"`;
                const title = `"${template.title.replace(/"/g, '""')}"`;
                const content = `"${template.content.replace(/"/g, '""')}"`;
                csv += `${folder},${title},${content}\n`;
            });
        });
        console.log('Generated CSV:', csv);
        return csv;
    };

    const convertFromCsv = (csv) => {
        console.log('convertFromCsv called with CSV:', csv);
        const lines = csv.split(/\r?\n/).filter(line => line.trim() !== '');
        if (lines.length === 0) {
            console.log('No lines found in CSV.');
            return [];
        }

        const headers = lines[0].split(',').map(header => header.trim().replace(/^"|"$/g, ''));
        console.log('CSV Headers:', headers);
        const templates = [];

        for (let i = 1; i < lines.length; i++) {
            const currentLine = lines[i];
            console.log('Processing CSV line:', currentLine);
            const regex = /(?:^|,)("(?:[^\"]+|\"\")*"|[^,]*)/g;
            let match;
            const values = [];
            while ((match = regex.exec(currentLine)) !== null) {
                let value = match[1];
                if (value.startsWith(',')) value = value.substring(1);
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.substring(1, value.length - 1).replace(/""/g, '"');
                }
                values.push(value);
            }
            console.log('Parsed values for line:', values);

            if (values.length === headers.length) {
                const item = {};
                for (let j = 0; j < headers.length; j++) {
                    item[headers[j]] = values[j];
                }
                console.log('Parsed item:', item);

                let folder = templates.find(f => f.folder === item.folder);
                if (!folder) {
                    folder = { folder: item.folder, templates: [] };
                    templates.push(folder);
                    console.log('New folder created:', folder.folder);
                }
                folder.templates.push({ title: item.title, content: item.content });
                console.log('Template added to folder:', item.title, folder.folder);
            } else {
                console.warn('Skipping malformed CSV line due to header/value mismatch:', currentLine);
            }
        }
        console.log('Converted templates from CSV:', templates);
        return templates;
    };

    const handleImport = (file) => {
        console.log('handleImport called with file:', file);
        if (!file) {
            alert('No file selected.');
            return;
        }

        const fileName = file.name.toLowerCase();
        if (file.type === 'application/json' || fileName.endsWith('.json')) {
            fileToImport = file;
            importFileType = 'json';
            showImportConfirmModal();
            console.log('File identified as JSON.');
        } else if (file.type === 'text/csv' || fileName.endsWith('.csv')) {
            fileToImport = file;
            importFileType = 'csv';
            showImportConfirmModal();
            console.log('File identified as CSV.');
        } else {
            alert('Please drop a valid JSON or CSV file.');
            console.warn('Invalid file type detected.', file.type, fileName);
        }
    };

    const processImportedFile = (file, type, importType) => {
        console.log('processImportedFile called with file, type, importType:', file, type, importType);
        const reader = new FileReader();
        reader.onload = (event) => {
            console.log('FileReader onload event fired.');
            try {
                let importedData;
                if (type === 'json') {
                    importedData = JSON.parse(event.target.result);
                    console.log('Parsed JSON data:', importedData);
                } else if (type === 'csv') {
                    importedData = convertFromCsv(event.target.result);
                    console.log('Parsed CSV data:', importedData);
                }

                if (typeof importedData === 'object' && importedData !== null) {
                    let currentTemplates = getTemplates();
                    console.log('Current templates:', currentTemplates);

                    if (importType === 'overwrite') {
                        setTemplates(importedData);
                        console.log('Templates overwritten.');
                    } else if (importType === 'merge') {
                        importedData.forEach(importedFolderObj => {
                            const existingFolder = currentTemplates.find(f => f.folder === importedFolderObj.folder);
                            if (existingFolder) {
                                importedFolderObj.templates.forEach(newTemplate => {
                                    const isDuplicate = existingFolder.templates.some(existingTemplate => existingTemplate.title === newTemplate.title);
                                    if (!isDuplicate) {
                                        existingFolder.templates.push(newTemplate);
                                        console.log('Merged new template:', newTemplate.title, 'into existing folder:', existingFolder.folder);
                                    }
                                });
                            } else {
                                currentTemplates.push(importedFolderObj);
                                console.log('Merged new folder:', importedFolderObj.folder);
                            }
                        });
                        setTemplates(currentTemplates);
                        console.log('Templates merged.');
                    }
                    renderTemplates();
                    console.log('Templates rendered.');
                } else {
                    alert('Invalid file format.');
                    console.error('Imported data is not a valid object.', importedData);
                }
            } catch (error) {
                alert('Error parsing file. Please make sure it is a valid JSON or CSV file.');
                console.error('Error during file processing:', error);
            }
        };
        reader.readAsText(file);
        console.log('FileReader started reading file.');
    };

    if (exportJsonBtn) {
        exportJsonBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Export JSON button clicked.');
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
                console.log('JSON export initiated.');
            } else {
                console.log('No templates to export (JSON).');
            }
        });
    }

    if (exportCsvBtn) {
        exportCsvBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Export CSV button clicked.');
            const templates = getTemplates();
            if (templates) {
                const csv = convertToCsv(templates);
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'email-templates.csv';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                console.log('CSV export initiated.');
            } else {
                console.log('No templates to export (CSV).');
            }
        });
    }

    if (importBtn) {
        importBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Import button clicked.');
            importFileInput.click();
        });
    }

    if (importFileInput) {
        importFileInput.addEventListener('change', (e) => {
            console.log('Import file input changed.');
            const file = e.target.files[0];
            if (file) {
                handleImport(file);
            }
            e.target.value = ''; // Clear the input so the same file can be imported again
        });
    }

    let dragCounter = 0;

    window.addEventListener('dragenter', (e) => {
        if (e.dataTransfer.types.includes('Files')) {
            e.preventDefault();
            dragCounter++;
            showDropZone();
            console.log('Drag enter event. Drag counter:', dragCounter);
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
        console.log('Drag leave event. Drag counter:', dragCounter);
    });

    document.getElementById('drop-zone').addEventListener('drop', (e) => {
        e.preventDefault();
        dragCounter = 0;
        hideDropZone();
        const file = e.dataTransfer.files[0];
        handleImport(file);
        console.log('Drop event. File:', file);
    });

    if (overwriteImportBtn) {
        overwriteImportBtn.addEventListener('click', () => {
            console.log('Overwrite import button clicked.');
            if (fileToImport && importFileType) {
                processImportedFile(fileToImport, importFileType, 'overwrite');
            }
            fileToImport = null;
            importFileType = null;
            hideImportConfirmModal();
        });
    }

    if (mergeImportBtn) {
        mergeImportBtn.addEventListener('click', () => {
            console.log('Merge import button clicked.');
            if (fileToImport && importFileType) {
                processImportedFile(fileToImport, importFileType, 'merge');
            }
            fileToImport = null;
            importFileType = null;
            hideImportConfirmModal();
        });
    }
};