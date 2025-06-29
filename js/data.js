let templates = JSON.parse(localStorage.getItem('emailTemplates')) || [];

export const saveTemplates = () => {
    localStorage.setItem('emailTemplates', JSON.stringify(templates, null, 2));
};

export const getTemplates = () => templates;

export const setTemplates = (newTemplates) => {
    templates = newTemplates;
    saveTemplates();
};

export const addTemplate = (folderName, title, content) => {
    let folder = templates.find(f => f.folder === folderName);
    if (!folder) {
        folder = { folder: folderName, templates: [] };
        templates.push(folder);
    }
    folder.templates.push({ title, content });
    saveTemplates();
};

export const deleteTemplate = (folderName, index) => {
    const folder = templates.find(f => f.folder === folderName);
    if (folder) {
        folder.templates.splice(index, 1);
        if (folder.templates.length === 0) {
            templates = templates.filter(f => f.folder !== folderName);
        }
    }
    saveTemplates();
};

export const updateTemplate = (oldFolderName, oldIndex, newFolderName, newTitle, newContent) => {
    const oldFolder = templates.find(f => f.folder === oldFolderName);
    if (oldFolder) {
        const [movedTemplate] = oldFolder.templates.splice(oldIndex, 1);
        if (oldFolder.templates.length === 0) {
            templates = templates.filter(f => f.folder !== oldFolderName);
        }

        let newFolder = templates.find(f => f.folder === newFolderName);
        if (!newFolder) {
            newFolder = { folder: newFolderName, templates: [] };
            templates.push(newFolder);
        }
        newFolder.templates.push({ title: newTitle, content: newContent });
    }
    saveTemplates();
};

export const getFolders = () => templates.map(folder => folder.folder);

export const reorderFolders = (oldIndex, newIndex) => {
    const [movedFolder] = templates.splice(oldIndex, 1);
    templates.splice(newIndex, 0, movedFolder);
    saveTemplates();
};
