// script.js
document.addEventListener("DOMContentLoaded", function() {
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    const colorPicker = document.getElementById('color');
    const eraser = document.getElementById('eraser');
    const undoButton = document.getElementById('undo');
    const redoButton = document.getElementById('redo');
    const clearButton = document.getElementById('clear');
    const saveButton = document.getElementById('save');
    const enableTouchButton = document.getElementById('enableTouch');
    const enablePenButton = document.getElementById('enablePen');

    let enableTouch = true;  // 默认启用手指触摸
    let enablePen = true;  // 默认启用电容笔
    const range = document.getElementById('range');
    const scale = canvas.width / parseInt(getComputedStyle(canvas).width);
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

    function preventBehavior(e) {
        if (e.target == canvas) {
            e.preventDefault();
        }
    }

    document.body.addEventListener('touchstart', preventBehavior, { passive: false });
    document.body.addEventListener('touchmove', preventBehavior, { passive: false });

    function startDrawing(e) {
        if ((e.touches && !enableTouch) || (e.pointerType === 'pen' && !enablePen)) return;
        isDrawing = true;
        if (e.type === 'touchstart') {
            e = e.touches[0];
        }
        lastX = (e.clientX - canvas.offsetLeft) * scale;
        lastY = (e.clientY - canvas.offsetTop) * scale;
        context.beginPath();
        context.moveTo(lastX, lastY);
    }

    function draw(e) {
        if ((e.touches && !enableTouch) || (e.pointerType === 'pen' && !enablePen)) return;
        if (!isDrawing) return;
        if (e.type === 'touchmove') {
            e = e.touches[0];
        }
        const newX = (e.clientX - canvas.offsetLeft) * scale;
        const newY = (e.clientY - canvas.offsetTop) * scale;
        context.strokeStyle = currentColor;
        context.lineWidth = range.value;
        context.lineTo(newX, newY);
        context.stroke();
        lastX = newX;
        lastY = newY;
    }

    function stopDrawing() {
        if (isDrawing) {
            history.push(context.getImageData(0, 0, canvas.width, canvas.height));
            redoStack = [];
            updateButtonStates();
        }
        isDrawing = false;
    }

    enableTouchButton.addEventListener('click', function() {
        enableTouch = !enableTouch;
        this.textContent = enableTouch ? '禁止手指触摸' : '启用手指触摸';
    });
    
    enablePenButton.addEventListener('click', function() {
        enablePen = !enablePen;
        this.textContent = enablePen ? '禁止电容笔' : '启用电容笔';
    });

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', stopDrawing);

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

    clearButton.addEventListener('click', function() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        history = [];
        redoStack = [];
        updateButtonStates();
    });

    saveButton.addEventListener('click', function() {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempContext = tempCanvas.getContext('2d');

        tempContext.fillStyle = '#FFFFFF';
        tempContext.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

        tempContext.drawImage(canvas, 0, 0);

        const dataUrl = tempCanvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = 'picture.png';
        a.click();
    });

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

    eraser.addEventListener('click', function() {
        currentColor = '#FFFFFF';
    });
});
