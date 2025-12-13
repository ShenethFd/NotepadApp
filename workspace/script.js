const emptyState = document.getElementById("emptyState");
const editorState = document.getElementById("editorState");
const notesGrid = document.getElementById("notesGrid");
const firstNoteBtn = document.getElementById("firstNoteBtn");
const saveBtn = document.getElementById("saveBtn");
const noteEditor = document.getElementById("noteEditor");
const noteTitleInput = document.getElementById("noteTitleInput");
const notesContainer = document.querySelector(".notes-container");
// Toolbar elements will be selected dynamically

let currentEditingNoteId = null;
let notes = [];
// Prevent initializing toolbar multiple times
let toolbarInitialized = false;
// Track last selection in textarea so toolbar clicks don't lose it
let lastSelectionStart = null;
let lastSelectionEnd = null;

// Note management variables

// Load notes from localStorage
function loadNotes() {
    const savedNotes = localStorage.getItem("notes");
    if (savedNotes) {
        notes = JSON.parse(savedNotes);
    }
    updateDisplay();
}

// Save notes to localStorage
function saveNotes() {
    localStorage.setItem("notes", JSON.stringify(notes));
}

// Update display based on notes state
function updateDisplay() {
    if (notes.length === 0) {
        // Show empty state
        emptyState.classList.remove("hidden");
        editorState.classList.add("hidden");
        notesGrid.classList.add("hidden");
    } else {
        // Show notes grid
        emptyState.classList.add("hidden");
        editorState.classList.add("hidden");
        notesGrid.classList.remove("hidden");
        displayNotes();
    }
}

// Display notes in grid
function displayNotes() {
    notesContainer.innerHTML = '';

    // Add existing notes
    notes.forEach((note, index) => {
        const noteBox = document.createElement('div');
        noteBox.className = 'note-box';
        noteBox.dataset.noteId = note.id;

        // Create note structure
        const titleDiv = document.createElement('div');
        titleDiv.className = 'note-title';
        titleDiv.textContent = note.title || 'Untitled Note';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'note-content';
        // Show first 100 characters as preview
        // If content contains HTML tags, render it as HTML so tags like <b> are applied.
        // Otherwise, show a plain-text preview (truncated to 100 chars).
        if (note.content && /</.test(note.content) && />/.test(note.content)) {
            // Render HTML content (simple rendering for local app). Replace newlines with <br>.
            contentDiv.innerHTML = note.content.replace(/\n/g, '<br>');
        } else {
            const previewText = note.content.length > 100
                ? note.content.substring(0, 100) + '...'
                : note.content;
            contentDiv.textContent = previewText || 'No content yet...';
        }

        const dateDiv = document.createElement('div');
        dateDiv.className = 'note-date';
        dateDiv.textContent = formatDate(note.updatedAt || note.createdAt);

        // Add subtle random rotation for visual variety
        const rotations = [-1, 0, 1];
        const randomRotation = rotations[Math.floor(Math.random() * rotations.length)];
        noteBox.style.transform = `rotate(${randomRotation}deg)`;

        noteBox.appendChild(titleDiv);
        noteBox.appendChild(contentDiv);
        noteBox.appendChild(dateDiv);

        // Event listeners
        noteBox.addEventListener('click', () => {
            editNote(note.id);
        });

        // Simple hover effects
        noteBox.addEventListener('mouseenter', () => {
            noteBox.style.transform = `translateY(-3px) rotate(0deg) scale(1.02)`;
            noteBox.style.zIndex = '10';
        });

        noteBox.addEventListener('mouseleave', () => {
            const rotations = [-1, 0, 1];
            const randomRotation = rotations[Math.floor(Math.random() * rotations.length)];
            noteBox.style.transform = `rotate(${randomRotation}deg)`;
            noteBox.style.zIndex = '1';
        });

        // Right-click context menu
        noteBox.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            showContextMenu(e, note.id);
        });

        // Double-click to rename
        noteBox.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            startRename(note.id);
        });

        notesContainer.appendChild(noteBox);
    });

    // Add "new note" box
    const newNoteBox = document.createElement('div');
    newNoteBox.className = 'note-box new-note';

    newNoteBox.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 10px; color: #9ca3af;">+</div>
        <div style="font-size: 16px; font-weight: bold; color: #6b7280;">Create new note</div>
    `;

    // Add subtle rotation for visual variety
    const rotations = [-1, 0, 1];
    const randomRotation = rotations[Math.floor(Math.random() * rotations.length)];
    newNoteBox.style.transform = `rotate(${randomRotation}deg)`;

    newNoteBox.addEventListener('click', () => {
        createNewNote();
    });

    notesContainer.appendChild(newNoteBox);
}

// Show editor for creating new note
function createNewNote() {
    currentEditingNoteId = null;
    noteTitleInput.value = '';
    noteEditor.value = '';
    emptyState.classList.add("hidden");
    notesGrid.classList.add("hidden");
    editorState.classList.remove("hidden");
    noteTitleInput.focus();

    // Initialize toolbar after editor is shown
    setTimeout(() => initToolbar(), 100);
}

// Show editor for editing existing note
function editNote(noteId) {
    const note = notes.find(n => n.id === noteId);
    if (note) {
        currentEditingNoteId = noteId;
        noteTitleInput.value = note.title || '';
        noteEditor.value = note.content;
        emptyState.classList.add("hidden");
        notesGrid.classList.add("hidden");
        editorState.classList.remove("hidden");
        noteTitleInput.focus();

        // Initialize toolbar after editor is shown
        setTimeout(() => initToolbar(), 100);
    }
}

// Save note
function saveNote() {
    const title = noteTitleInput.value.trim();
    const content = noteEditor.value.trim();

    if (!title) {
        alert("Please enter a title for your note!");
        noteTitleInput.focus();
        return;
    }

    if (!content) {
        alert("Please write some content for your note!");
        noteEditor.focus();
        return;
    }

    if (currentEditingNoteId) {
        // Update existing note
        const noteIndex = notes.findIndex(n => n.id === currentEditingNoteId);
        if (noteIndex !== -1) {
            notes[noteIndex].title = title;
            notes[noteIndex].content = content;
            notes[noteIndex].updatedAt = new Date().toISOString();
        }
    } else {
        // Create new note
        const newNote = {
            id: Date.now().toString(),
            title: title,
            content: content,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        notes.push(newNote);
    }

    saveNotes();
    updateDisplay();
    alert("Note saved!");
}

// Event listeners
firstNoteBtn.addEventListener("click", createNewNote);

saveBtn.addEventListener("click", saveNote);

// Update last selection whenever user selects in the textarea
function updateLastSelection() {
    try {
        lastSelectionStart = noteEditor.selectionStart;
        lastSelectionEnd = noteEditor.selectionEnd;
    } catch (e) {
        // ignore when not focusable
    }
}

noteEditor.addEventListener('select', updateLastSelection);
noteEditor.addEventListener('mouseup', updateLastSelection);
noteEditor.addEventListener('keyup', updateLastSelection);

// Toolbar functionality
function initToolbar() {
    // Only initialize once to avoid duplicated event handlers
    if (toolbarInitialized) return;

    // Select toolbar elements dynamically (they exist in the DOM once the editor is rendered)
    const toolbarButtons = document.querySelectorAll('.toolbar-btn');
    const toolbarSelects = document.querySelectorAll('.toolbar-select');

    // Button commands
    toolbarButtons.forEach(button => {
        // Prevent the mousedown on toolbar buttons from blurring the textarea (keeps selection)
        button.addEventListener('mousedown', (e) => {
            e.preventDefault();
        });
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const command = button.dataset.command;
            executeCommand(command);
        });
    });

    // Select commands
    toolbarSelects.forEach(select => {
        select.addEventListener('change', (e) => {
            const command = select.dataset.command;
            const value = select.value;
            executeCommand(command, value);
            // Keep the select value as chosen by the user (do not reset)
        });
    });

    // Keyboard shortcuts (attach once)
    document.addEventListener('keydown', handleKeyboardShortcuts);

    toolbarInitialized = true;
}

// Keyboard shortcuts for formatting
function handleKeyboardShortcuts(e) {
    // Only work when editor is focused and not in input fields
    if (document.activeElement !== noteEditor) return;

    const isCtrl = e.ctrlKey || e.metaKey;

    if (isCtrl) {
        switch(e.key.toLowerCase()) {
            case 'b':
                e.preventDefault();
                executeCommand('bold');
                break;
            case 'i':
                e.preventDefault();
                executeCommand('italic');
                break;
            case 'u':
                e.preventDefault();
                executeCommand('underline');
                break;
        }
    }
}

function executeCommand(command, value = null) {
    const textarea = noteEditor;
    let start = textarea.selectionStart;
    let end = textarea.selectionEnd;
    // If selection was lost because toolbar was clicked, fall back to last known selection
    if (start === end && typeof lastSelectionStart === 'number' && lastSelectionStart !== lastSelectionEnd) {
        start = lastSelectionStart;
        end = lastSelectionEnd;
        // restore selection in the textarea so setRangeText behaves correctly
        textarea.selectionStart = start;
        textarea.selectionEnd = end;
    }
    const selectedText = textarea.value.substring(start, end);
    let replacement = '';
    let opening = '';
    let closing = '';
    let innerText = '';

    switch(command) {
        case 'bold':
            opening = '<b>';
            closing = '</b>';
            innerText = selectedText || 'bold text';
            replacement = `${opening}${innerText}${closing}`;
            break;
        case 'italic':
            opening = '<i>';
            closing = '</i>';
            innerText = selectedText || 'italic text';
            replacement = `${opening}${innerText}${closing}`;
            break;
        case 'underline':
            opening = '<u>';
            closing = '</u>';
            innerText = selectedText || 'underlined text';
            replacement = `${opening}${innerText}${closing}`;
            break;
        case 'align-left':
            replacement = selectedText ? `[LEFT]${selectedText}[/LEFT]` : '[LEFT]left aligned text[/LEFT]';
            break;
        case 'align-center':
            replacement = selectedText ? `[CENTER]${selectedText}[/CENTER]` : '[CENTER]center aligned text[/CENTER]';
            break;
        case 'align-right':
            replacement = selectedText ? `[RIGHT]${selectedText}[/RIGHT]` : '[RIGHT]right aligned text[/RIGHT]';
            break;
        case 'heading':
            if (value) {
                if (value.startsWith('h') && value.length > 1) {
                    const level = value.substring(1);
                    opening = `<h${level}>`;
                    closing = `</h${level}>`;
                    innerText = selectedText || `Heading ${level}`;
                    replacement = `${opening}${innerText}${closing}`;
                }
            }
            break;
        case 'font-size':
            if (value) {
                const sizeMap = { small: '12px', normal: '16px', large: '20px', xlarge: '24px' };
                const size = sizeMap[value] || '16px';
                opening = `<span style="font-size: ${size};">`;
                closing = `</span>`;
                innerText = selectedText || `${value} text`;
                replacement = `${opening}${innerText}${closing}`;
            }
            break;
    }

    if (replacement) {
        // Replace text
        textarea.setRangeText(replacement, start, end, 'end');

        // Calculate new selection/caret position for better UX:
        if (opening && closing) {
            // Place selection inside the tags around the inner text
            const newStart = start + opening.length;
            const newEnd = newStart + innerText.length;
            textarea.selectionStart = newStart;
            textarea.selectionEnd = newEnd;
        } else {
            // Default: place caret after the inserted replacement
            const caretPos = start + replacement.length;
            textarea.selectionStart = textarea.selectionEnd = caretPos;
        }

        textarea.focus();

        // Provide visual feedback
        showToolbarFeedback(command);
    }
}

// Visual feedback for toolbar actions
function showToolbarFeedback(command) {
    // Find the button that was clicked
    const button = document.querySelector(`[data-command="${command}"]`);
    if (button) {
        // Add temporary active class
        button.classList.add('active');

        // Remove after a short delay
        setTimeout(() => {
            button.classList.remove('active');
        }, 200);
    }

    // Show a brief status message
    showStatusMessage(`Applied: ${command.replace('-', ' ').toUpperCase()}`);
}

// Status message display
function showStatusMessage(message) {
    // Remove any existing status message
    const existingStatus = document.querySelector('.status-message');
    if (existingStatus) {
        existingStatus.remove();
    }

    // Create new status message
    const statusDiv = document.createElement('div');
    statusDiv.className = 'status-message';
    statusDiv.textContent = message;
    statusDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #007bff;
        color: white;
        padding: 8px 16px;
        border-radius: 4px;
        font-size: 14px;
        z-index: 10000;
        opacity: 0;
        transform: translateY(-10px);
        transition: all 0.3s ease;
    `;

    document.body.appendChild(statusDiv);

    // Animate in
    setTimeout(() => {
        statusDiv.style.opacity = '1';
        statusDiv.style.transform = 'translateY(0)';
    }, 10);

    // Remove after 2 seconds
    setTimeout(() => {
        statusDiv.style.opacity = '0';
        statusDiv.style.transform = 'translateY(-10px)';
        setTimeout(() => statusDiv.remove(), 300);
    }, 2000);
}

// Apply text formatting styles (for display purposes)
function applyTextFormatting() {
    // This would be used if we were displaying formatted text
    // For now, the markdown/html tags remain visible in the textarea
    // In a real implementation, you'd parse and render the formatted text
}

// Helper function to format dates
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
        return 'Today';
    } else if (diffDays === 2) {
        return 'Yesterday';
    } else if (diffDays <= 7) {
        return `${diffDays - 1} days ago`;
    } else {
        return date.toLocaleDateString();
    }
}

// Show context menu
function showContextMenu(event, noteId) {
    // Remove any existing context menus
    const existingMenu = document.querySelector('.context-menu');
    if (existingMenu) {
        existingMenu.remove();
    }

    const contextMenu = document.createElement('div');
    contextMenu.className = 'context-menu';
    contextMenu.style.left = event.pageX + 'px';
    contextMenu.style.top = event.pageY + 'px';

    contextMenu.innerHTML = `
        <div class="context-menu-item" data-action="rename">Rename</div>
        <div class="context-menu-item" data-action="edit">Edit</div>
        <div class="context-menu-item delete" data-action="delete">Delete</div>
    `;

    document.body.appendChild(contextMenu);

    // Handle menu item clicks
    contextMenu.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        if (action === 'rename') {
            startRename(noteId);
        } else if (action === 'edit') {
            editNote(noteId);
        } else if (action === 'delete') {
            if (confirm('Are you sure you want to delete this note?')) {
                deleteNote(noteId);
            }
        }
        contextMenu.remove();
    });

    // Remove menu when clicking elsewhere
    document.addEventListener('click', function removeMenu() {
        contextMenu.remove();
        document.removeEventListener('click', removeMenu);
    }, { once: true });
}

// Start rename process
function startRename(noteId) {
    const noteBox = document.querySelector(`[data-note-id="${noteId}"]`);
    if (!noteBox) return;

    const titleDiv = noteBox.querySelector('.note-title');
    const currentTitle = titleDiv.textContent;

    // Create rename overlay
    const overlay = document.createElement('div');
    overlay.className = 'note-rename-overlay';

    const input = document.createElement('input');
    input.className = 'note-rename-input';
    input.value = currentTitle;
    input.maxLength = 50;

    overlay.appendChild(input);
    noteBox.appendChild(overlay);

    input.focus();
    input.select();

    // Handle save/cancel
    const saveRename = () => {
        const newTitle = input.value.trim();
        if (newTitle && newTitle !== currentTitle) {
            updateNoteTitle(noteId, newTitle);
        }
        overlay.remove();
    };

    const cancelRename = () => {
        overlay.remove();
    };

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveRename();
        } else if (e.key === 'Escape') {
            cancelRename();
        }
    });

    input.addEventListener('blur', saveRename);
}

// Update note title
function updateNoteTitle(noteId, newTitle) {
    const noteIndex = notes.findIndex(n => n.id === noteId);
    if (noteIndex !== -1) {
        notes[noteIndex].title = newTitle;
        notes[noteIndex].updatedAt = new Date().toISOString();
        saveNotes();
        displayNotes();
    }
}

// Delete note
function deleteNote(noteId) {
    notes = notes.filter(n => n.id !== noteId);
    saveNotes();
    displayNotes();
}

// Initialize
loadNotes();
