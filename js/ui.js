import { getTemplates, addTemplate, deleteTemplate, updateTemplate, getFolders, saveTemplates, setTemplates, reorderFolders } from './data.js';
import { initializeDragAndDrop } from './dragAndDrop.js';

const elements = {
    openModalBtn: document.getElementById('open-modal-btn'),
    addTemplateModal: document.getElementById('add-template-modal'),
    addTemplateModalContent: document.getElementById('add-template-modal-content'),
    cancelBtn: document.getElementById('cancel-btn'),
    addTemplateBtn: document.getElementById('add-template-btn'),
    newTemplateFolder: document.getElementById('new-template-folder'),
    newTemplateTitle: document.getElementById('new-template-title'),
    newTemplateContent: document.getElementById('new-template-content'),
    templateCategoriesDiv: document.getElementById('template-categories'),
    settingsBtn: document.getElementById('settings-btn'),
    settingsDropdown: document.getElementById('settings-dropdown'),
    viewTemplateModal: document.getElementById('view-template-modal'),
    viewTemplateModalContent: document.getElementById('view-template-modal-content'),
    closeViewBtn: document.getElementById('close-view-btn'),
    viewTemplateTitle: document.getElementById('view-template-title'),
    viewTemplateContent: document.getElementById('view-template-content'),
    deleteConfirmModal: document.getElementById('delete-confirm-modal'),
    deleteConfirmModalContent: document.getElementById('delete-confirm-modal-content'),
    cancelDeleteBtn: document.getElementById('cancel-delete-btn'),
    confirmDeleteBtn: document.getElementById('confirm-delete-btn'),
    emptyState: document.getElementById('empty-state'),
    emptyStateAddBtn: document.getElementById('empty-state-add-btn'),
    emptyStateImportBtn: document.getElementById('empty-state-import-btn'),
    editTemplateModal: document.getElementById('edit-template-modal'),
    editTemplateModalContent: document.getElementById('edit-template-modal-content'),
    cancelEditBtn: document.getElementById('cancel-edit-btn'),
    saveEditBtn: document.getElementById('save-edit-btn'),
    editTemplateFolder: document.getElementById('edit-template-folder'),
    editTemplateTitle: document.getElementById('edit-template-title'),
    editTemplateContent: document.getElementById('edit-template-content'),
    folderDatalist: document.getElementById('folder-list'),
    importConfirmModal: document.getElementById('import-confirm-modal'),
    importConfirmModalContent: document.getElementById('import-confirm-modal-content'),
    cancelImportBtn: document.getElementById('cancel-import-btn'),
    overwriteImportBtn: document.getElementById('overwrite-import-btn'),
    mergeImportBtn: document.getElementById('merge-import-btn'),
    dropZone: document.getElementById('drop-zone'),
};

let templateToDelete = null;
let templateToEdit = null;

const showModal = (modal, content) => {
    modal.classList.remove('hidden');
    setTimeout(() => {
        content.classList.remove('opacity-0', 'scale-95');
        content.classList.add('opacity-100', 'scale-100');
    }, 50);
};

const hideModal = (modal, content) => {
    content.classList.remove('opacity-100', 'scale-100');
    content.classList.add('opacity-0', 'scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
};

const populateCategoryDatalist = () => {
    elements.folderDatalist.innerHTML = '';
    const folders = getFolders();
    folders.forEach(folder => {
        const option = document.createElement('option');
        option.value = folder;
        elements.folderDatalist.appendChild(option);
    });
};

export const renderTemplates = () => {
    elements.templateCategoriesDiv.innerHTML = '';
    const templates = getTemplates();

    if (templates.length === 0) {
        elements.emptyState.classList.remove('hidden');
        elements.templateCategoriesDiv.classList.add('hidden');
    } else {
        elements.emptyState.classList.add('hidden');
        elements.templateCategoriesDiv.classList.remove('hidden');
    }

    populateCategoryDatalist();

    templates.forEach((folderObj, folderIndex) => {
        const folderDiv = document.createElement('div');
        folderDiv.className = 'bg-zinc-950 rounded-xl shadow-lg border border-zinc-800 folder-item overflow-hidden';
        folderDiv.dataset.folder = folderObj.folder;
        folderDiv.dataset.folderIndex = folderIndex;

        const folderHeader = document.createElement('div');
        folderHeader.className = 'flex justify-between items-center cursor-pointer p-4';
        folderHeader.innerHTML = `
            <h3 class="text-xl font-semibold text-white">${folderObj.folder}</h3>
            <span class="transform transition-transform duration-300 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </span>
        `;

        const templatesList = document.createElement('div');
        templatesList.className = 'space-y-2 template-list-container max-h-0 overflow-hidden transition-all duration-300 ease-in-out';
        templatesList.dataset.folder = folderObj.folder;

        folderHeader.addEventListener('click', () => {
            const isCollapsed = templatesList.classList.contains('max-h-0');
            if (isCollapsed) {
                templatesList.classList.remove('max-h-0');
                templatesList.classList.add('max-h-screen');
                folderHeader.querySelector('span svg').classList.add('rotate-180');
            } else {
                templatesList.classList.add('max-h-0');
                templatesList.classList.remove('max-h-screen');
                folderHeader.querySelector('span svg').classList.remove('rotate-180');
            }
        });

        folderObj.templates.forEach((template, index) => {
            const templateEl = document.createElement('div');
            templateEl.className = 'flex justify-between items-center p-3 rounded-lg cursor-pointer hover:bg-zinc-900 last:border-b-0 transition-all duration-150 ease-in-out transform hover:scale-[1.01] template-item';
            templateEl.dataset.index = index;

            templateEl.innerHTML = `
                <span class="font-semibold flex-grow text-gray-200">${template.title}</span>
                <div class="flex items-center gap-2">
                    <button class="edit-btn p-1 rounded-full hover:bg-gray-600 transition-all duration-150 transform hover:scale-110 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button class="copy-btn p-1 rounded-full hover:bg-gray-600 transition-all duration-150 transform hover:scale-110 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </button>
                    <button class="delete-btn p-1 rounded-full hover:bg-gray-600 transition-all duration-150 transform hover:scale-110 text-red-500">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
            `;

            templateEl.querySelector('.font-semibold').addEventListener('click', () => {
                elements.viewTemplateTitle.textContent = template.title;
                elements.viewTemplateContent.textContent = template.content;
                showModal(elements.viewTemplateModal, elements.viewTemplateModalContent);
            });

            const editBtn = templateEl.querySelector('.edit-btn');
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                templateToEdit = { folder: folderObj.folder, index, template };
                elements.editTemplateFolder.value = folderObj.folder;
                elements.editTemplateTitle.value = template.title;
                elements.editTemplateContent.value = template.content;
                showModal(elements.editTemplateModal, elements.editTemplateModalContent);
            });

            const copyBtn = templateEl.querySelector('.copy-btn');
            copyBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(template.content).then(() => {
                    copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>`;
                    setTimeout(() => {
                        copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>`;
                    }, 1500);
                }).catch(err => console.error('Failed to copy: ', err));
            });

            templateEl.querySelector('.delete-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                templateToDelete = { folder: folderObj.folder, index };
                showModal(elements.deleteConfirmModal, elements.deleteConfirmModalContent);
            });

            templatesList.appendChild(templateEl);
        });

        folderDiv.appendChild(folderHeader);
        folderDiv.appendChild(templatesList);
        elements.templateCategoriesDiv.appendChild(folderDiv);

        initializeDragAndDrop(templatesList, renderTemplates);
    });

    initializeDragAndDrop(elements.templateCategoriesDiv, renderTemplates, true);
};

export const initializeUI = () => {
    renderTemplates();

    elements.openModalBtn.addEventListener('click', () => showModal(elements.addTemplateModal, elements.addTemplateModalContent));
    elements.cancelBtn.addEventListener('click', () => hideModal(elements.addTemplateModal, elements.addTemplateModalContent));
    elements.addTemplateModal.addEventListener('click', (e) => {
        if (e.target === elements.addTemplateModal) {
            hideModal(elements.addTemplateModal, elements.addTemplateModalContent);
        }
    });

    elements.closeViewBtn.addEventListener('click', () => hideModal(elements.viewTemplateModal, elements.viewTemplateModalContent));
    elements.viewTemplateModal.addEventListener('click', (e) => {
        if (e.target === elements.viewTemplateModal) {
            hideModal(elements.viewTemplateModal, elements.viewTemplateModalContent);
        }
    });

    elements.cancelDeleteBtn.addEventListener('click', () => hideModal(elements.deleteConfirmModal, elements.deleteConfirmModalContent));
    elements.deleteConfirmModal.addEventListener('click', (e) => {
        if (e.target === elements.deleteConfirmModal) {
            hideModal(elements.deleteConfirmModal, elements.deleteConfirmModalContent);
        }
    });

    elements.cancelEditBtn.addEventListener('click', () => hideModal(elements.editTemplateModal, elements.editTemplateModalContent));
    elements.editTemplateModal.addEventListener('click', (e) => {
        if (e.target === elements.editTemplateModal) {
            hideModal(elements.editTemplateModal, elements.editTemplateModalContent);
        }
    });

    elements.saveEditBtn.addEventListener('click', () => {
        if (templateToEdit) {
            const { folder, index } = templateToEdit;
            const newFolder = elements.editTemplateFolder.value.trim();
            const newTitle = elements.editTemplateTitle.value.trim();
            const newContent = elements.editTemplateContent.value.trim();

            if (newFolder && newTitle && newContent) {
                updateTemplate(folder, index, newFolder, newTitle, newContent);
                renderTemplates();
                hideModal(elements.editTemplateModal, elements.editTemplateModalContent);
                templateToEdit = null;
            } else {
                alert('Please fill in all fields for editing.');
            }
        }
    });

    elements.emptyStateAddBtn.addEventListener('click', () => showModal(elements.addTemplateModal, elements.addTemplateModalContent));
    elements.emptyStateImportBtn.addEventListener('click', () => document.getElementById('import-file').click());

    elements.confirmDeleteBtn.addEventListener('click', () => {
        if (templateToDelete) {
            const { folder, index } = templateToDelete;
            deleteTemplate(folder, index);
            renderTemplates();
            templateToDelete = null;
            hideModal(elements.deleteConfirmModal, elements.deleteConfirmModalContent);
        }
    });

    elements.settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        elements.settingsDropdown.classList.toggle('hidden');
    });

    window.addEventListener('click', (e) => {
        if (!elements.settingsDropdown.classList.contains('hidden') && !elements.settingsBtn.contains(e.target)) {
            elements.settingsDropdown.classList.add('hidden');
        }
    });

    elements.addTemplateBtn.addEventListener('click', () => {
        const folder = elements.newTemplateFolder.value.trim();
        const title = elements.newTemplateTitle.value.trim();
        const content = elements.newTemplateContent.value.trim();

        if (folder && title && content) {
            addTemplate(folder, title, content);
            renderTemplates();
            elements.newTemplateFolder.value = '';
            elements.newTemplateTitle.value = '';
            elements.newTemplateContent.value = '';
            hideModal(elements.addTemplateModal, elements.addTemplateModalContent);
        } else {
            alert('Please fill in all fields.');
        }
    });

    elements.cancelImportBtn.addEventListener('click', () => hideModal(elements.importConfirmModal, elements.importConfirmModalContent));
    elements.importConfirmModal.addEventListener('click', (e) => {
        if (e.target === elements.importConfirmModal) {
            hideModal(elements.importConfirmModal, elements.importConfirmModalContent);
        }
    });
};

export const showImportConfirmModal = () => {
    showModal(elements.importConfirmModal, elements.importConfirmModalContent);
};

export const hideImportConfirmModal = () => {
    hideModal(elements.importConfirmModal, elements.importConfirmModalContent);
};

export const showDropZone = () => {
    elements.dropZone.classList.remove('hidden');
};

export const hideDropZone = () => {
    elements.dropZone.classList.add('hidden');
};
