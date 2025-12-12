const note = document.getElementById('note');
const saveBtn = document.getElementById('saveBtn');
const clearBtn = document.getElementById('clearBtn');

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
