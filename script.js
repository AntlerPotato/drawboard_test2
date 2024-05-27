// script.js
document.addEventListener("DOMContentLoaded", function() {
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    const colorPicker = document.getElementById('color');
    const eraser = document.getElementById('eraser');
    const undoButton = document.getElementById('undo');
    const redoButton = document.getElementById('redo');
    const saveButton = document.getElementById('save');
    const clearButton = document.getElementById('clear');
    const range = document.getElementById('range');
    let currentColor = '#000000';
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let history = [];
    let redoStack = [];

    function updateButtonStates() {
        undoButton.disabled = history.length === 0;
        redoButton.disabled = redoStack.length === 0;
    }

    // Initial button state update
    updateButtonStates();

    function startDrawing(e) {
        isDrawing = true;
        lastX = e.clientX - canvas.offsetLeft;
        lastY = e.clientY - canvas.offsetTop;

        // Start a new path
        context.beginPath();
        context.moveTo(lastX, lastY);
    }

    function draw(e) {
        if (!isDrawing) return;
        const newX = e.clientX - canvas.offsetLeft;
        const newY = e.clientY - canvas.offsetTop;

        context.strokeStyle = currentColor;
        context.lineWidth = range.value;

        // Draw a line to the new point
        context.lineTo(newX, newY);
        context.stroke();

        lastX = newX;
        lastY = newY;
    }

    function stopDrawing() {
        if (isDrawing) {
            history.push(context.getImageData(0, 0, canvas.width, canvas.height));
            redoStack = []; // Clear redo stack after new drawing
            updateButtonStates();
        }
        isDrawing = false;
    }

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

    // Add touch event listeners for mobile devices
    canvas.addEventListener('touchstart', (e) => startDrawing(e.touches[0]));
    canvas.addEventListener('touchmove', (e) => draw(e.touches[0]));
    canvas.addEventListener('touchend', stopDrawing);

    // Undo and redo logic
    undoButton.addEventListener('click', function() {
        if (history.length > 0) {
            redoStack.push(history.pop());
            if (history.length > 0) {
                context.putImageData(history[history.length - 1], 0, 0);
            } else {
                context.clearRect(0, 0, canvas.width, canvas.height);
            }
            updateButtonStates();
        }
    });

    redoButton.addEventListener('click', function() {
        if (redoStack.length > 0) {
            const imageData = redoStack.pop();
            history.push(imageData);
            context.putImageData(imageData, 0, 0);
            updateButtonStates();
        }
    });

    // Color selection logic
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.color-option').forEach(op => op.classList.remove('active'));
            this.classList.add('active');
            currentColor = this.getAttribute('data-color');
        });
    });

    colorPicker.addEventListener('change', function() {
        currentColor = this.value;
        const activeOption = document.querySelector('.color-option.active');
        if (activeOption) {
            activeOption.style.backgroundColor = currentColor;
            activeOption.setAttribute('data-color', currentColor);
        }
    });

    // Clear canvas logic
    clearButton.addEventListener('click', function() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        history.push(context.getImageData(0, 0, canvas.width, canvas.height));
        updateButtonStates();
    });

    // Save logic
    saveButton.addEventListener('click', function() {
        const dataUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = 'picture.png';
        a.click();
    });

    // Eraser logic
    eraser.addEventListener('click', function() {
        currentColor = '#FFFFFF'; // Assuming canvas background is white
    });
});