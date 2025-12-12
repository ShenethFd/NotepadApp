const note = document.getElementById('note');
const saveBtn = document.getElementById('saveBtn');
const clearBtn = document.getElementById('clearBtn');
const downloadBtn = document.getElementById('downloadBtn');
const savedNotes = document.getElementById('savedNotes');

// Load saved note
note.value = localStorage.getItem('myNote') || '';

// Save note
saveBtn.addEventListener('click', () => {
    localStorage.setItem('myNote', note.value);
    alert('Note saved!');
});

// Clear notes
clearBtn.addEventListener('click', () => {
    note.value = '';
    localStorage.removeItem('myNote');
    alert('Notes cleared!');
});

// Download note
downloadBtn.addEventListener('click', () => {
    const blob = new Blob([note.value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'note.txt';
    a.click();
    URL.revokeObjectURL(url);
});

// Function to display saved notes
function displaySavedNotes() {
    const saved = localStorage.getItem('myNote');
    savedNotes.textContent = saved || 'No notes saved yet.';
}

// Load saved note in textarea and display
note.value = localStorage.getItem('myNote') || '';
displaySavedNotes();