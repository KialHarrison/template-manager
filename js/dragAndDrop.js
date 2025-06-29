import { getTemplates, setTemplates, reorderFolders } from './data.js';
import { renderTemplates } from './ui.js';

export function initializeDragAndDrop(listElement, renderCallback, isFolderDrag = false) {
    new Sortable(listElement, {
        group: isFolderDrag ? 'folders' : 'templates',
        animation: 150,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        dragClass: 'sortable-drag',
        onEnd: (evt) => {
            if (isFolderDrag) {
                reorderFolders(evt.oldIndex, evt.newIndex);
            } else {
                const fromFolder = evt.from.dataset.folder;
                const toFolder = evt.to.dataset.folder;
                const oldIndex = evt.oldIndex;
                const newIndex = evt.newIndex;

                const templates = getTemplates();

                const fromFolderObj = templates.find(f => f.name === fromFolder);
                const toFolderObj = templates.find(f => f.name === toFolder);

                if (fromFolderObj && toFolderObj) {
                    const [movedItem] = fromFolderObj.templates.splice(oldIndex, 1);
                    toFolderObj.templates.splice(newIndex, 0, movedItem);
                } else if (fromFolderObj && !toFolderObj) {
                    // Moving to a new folder that doesn't exist yet (shouldn't happen with current UI, but for robustness)
                    const [movedItem] = fromFolderObj.templates.splice(oldIndex, 1);
                    const newFolder = { name: toFolder, templates: [movedItem] };
                    templates.splice(newIndex, 0, newFolder);
                }

                // Remove empty folder if applicable
                if (fromFolderObj && fromFolderObj.templates.length === 0) {
                    setTemplates(templates.filter(f => f.name !== fromFolder));
                } else {
                    setTemplates(templates);
                }
            }
            renderCallback();
        }
    });
}