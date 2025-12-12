const note = document.getElementById('note');
const saveBtn = document.getElementById('saveBtn');
const clearBtn = document.getElementById('clearBtn');
const downloadBtn = document.getElementById('downloadBtn');

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

downloadBtn.addEventListener('click', () => {
    const blob = new Blob([note.value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'note.txt';
    a.click();
    URL.revokeObjectURL(url);
});
