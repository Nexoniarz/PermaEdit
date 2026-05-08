const manifestData = browser.runtime.getManifest();
document.getElementById('versionDisplay').textContent = manifestData.version;

function sendCommand(command) {
    browser.tabs.query({active: true, currentWindow: true}, function(tabs) {
        browser.tabs.sendMessage(tabs[0].id, {action: command});
    });
}

document.getElementById('saveBtn').addEventListener('click', () => sendCommand("saveState"));
document.getElementById('resetBtn').addEventListener('click', () => sendCommand("resetState"));

const infoModal = document.getElementById('infoModal');
const infoCloseBtn = document.getElementById('infoCloseBtn');

const manageBtn = document.getElementById('manageBtn');
const manageSection = document.getElementById('manageSection');
const searchInput = document.getElementById('searchInput');
const savedList = document.getElementById('savedList');

const renameModal = document.getElementById('renameModal');
const renameInput = document.getElementById('renameInput');
const renameCancelBtn = document.getElementById('renameCancelBtn');
const renameSaveBtn = document.getElementById('renameSaveBtn');

const deleteModal = document.getElementById('deleteModal');
const deleteCancelBtn = document.getElementById('deleteCancelBtn');
const deleteConfirmBtn = document.getElementById('deleteConfirmBtn');

let currentPages = [];
let currentNames = {};
let currentActionKey = null;

function hideModals() {
    infoModal.style.display = 'none';
    renameModal.style.display = 'none';
    deleteModal.style.display = 'none';
    currentActionKey = null;
}

document.getElementById('infoBtn').addEventListener('click', () => {
    infoModal.style.display = 'flex';
});

infoCloseBtn.addEventListener('click', hideModals);
renameCancelBtn.addEventListener('click', hideModals);
deleteCancelBtn.addEventListener('click', hideModals);

renameSaveBtn.addEventListener('click', () => {
    if (currentActionKey !== null) {
        currentNames[currentActionKey] = renameInput.value.trim();
        browser.storage.local.set({ permaEditNames: currentNames }).then(() => {
            hideModals();
            loadSavedPages();
        });
    }
});

deleteConfirmBtn.addEventListener('click', () => {
    if (currentActionKey !== null) {
        browser.storage.local.remove(currentActionKey).then(() => {
            hideModals();
            loadSavedPages();
        });
    }
});

manageBtn.addEventListener('click', () => {
    if (manageSection.style.display === 'none' || manageSection.style.display === '') {
        manageSection.style.display = 'block';
        loadSavedPages();
    } else {
        manageSection.style.display = 'none';
    }
});

searchInput.addEventListener('input', () => {
    renderList(searchInput.value);
});

function loadSavedPages() {
    browser.storage.local.get(null).then((items) => {
        currentPages = [];
        currentNames = items.permaEditNames || {};

        for (let key in items) {
            if (key.startsWith("permaEdit_") && key !== "permaEditNames") {
                currentPages.push({
                    key: key,
                    html: items[key],
                    urlPart: key.replace("permaEdit_", "")
                });
            }
        }
        renderList(searchInput.value);
    });
}

function renderList(filterText = "") {
    savedList.innerHTML = '';
    const lowerFilter = filterText.toLowerCase();

    currentPages.forEach(page => {
        const customName = currentNames[page.key] || page.urlPart;

        if (filterText && !customName.toLowerCase().includes(lowerFilter) && !page.urlPart.toLowerCase().includes(lowerFilter)) {
            return;
        }

        const itemDiv = document.createElement('div');
        itemDiv.className = 'saved-item';

        const titleDiv = document.createElement('div');
        titleDiv.className = 'item-title';
        titleDiv.textContent = currentNames[page.key] ? currentNames[page.key] : "Unnamed Page";

        const urlDiv = document.createElement('div');
        urlDiv.className = 'item-url';
        urlDiv.textContent = page.urlPart;

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'item-actions';

        const viewBtn = document.createElement('button');
        viewBtn.className = 'action-btn';
        viewBtn.textContent = '👁️';
        viewBtn.title = "Open Page";
        viewBtn.onclick = () => browser.tabs.create({url: 'https://' + page.urlPart});

        const dlBtn = document.createElement('button');
        dlBtn.className = 'action-btn';
        dlBtn.textContent = '💾';
        dlBtn.title = "Download HTML";
        dlBtn.onclick = () => downloadHTML(page.html, customName);

        const renameBtn = document.createElement('button');
        renameBtn.className = 'action-btn';
        renameBtn.textContent = '✏️';
        renameBtn.title = "Rename";
        renameBtn.onclick = () => renamePage(page.key, currentNames[page.key]);

        const delBtn = document.createElement('button');
        delBtn.className = 'action-btn';
        delBtn.textContent = '❌';
        delBtn.title = "Delete";
        delBtn.onclick = () => deletePage(page.key);

        actionsDiv.appendChild(viewBtn);
        actionsDiv.appendChild(dlBtn);
        actionsDiv.appendChild(renameBtn);
        actionsDiv.appendChild(delBtn);

        itemDiv.appendChild(titleDiv);
        itemDiv.appendChild(urlDiv);
        itemDiv.appendChild(actionsDiv);
        savedList.appendChild(itemDiv);
    });
}

function downloadHTML(htmlContent, fileNameBase) {
    const blob = new Blob([htmlContent], {type: "text/html"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileNameBase.replace(/[^a-z0-9]/gi, '_').toLowerCase() + ".html";
    a.click();
    URL.revokeObjectURL(url);
}

function renamePage(key, currentName) {
    currentActionKey = key;
    renameInput.value = currentName || "";
    renameModal.style.display = 'flex';
    renameInput.focus();
}

function deletePage(key) {
    currentActionKey = key;
    deleteModal.style.display = 'flex';
}
