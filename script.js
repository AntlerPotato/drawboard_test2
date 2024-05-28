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

// 设置标志位，用于判断是否启用手指触摸或电容笔
    let enableTouch = false;
    let enablePen = false;
    const range = document.getElementById('range');
    const scale = canvas.width / parseInt(getComputedStyle(canvas).width); // 缩放比例
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
        e.preventDefault(); 
    }

    // 添加触摸事件监听，防止下拉刷新和画布外滑动
    document.body.addEventListener('touchstart', preventBehavior, { passive: false });

    function startDrawing(e) {
    // 如果用户尝试使用未启用的输入方式，则直接返回
        if ((e.touches && !enableTouch) || (e.pointerType === 'pen' && !enablePen)) return;

        isDrawing = true;
        if (e.type === 'touchstart') {
            e = e.touches[0];
        }
        lastX = (e.clientX - canvas.offsetLeft) * scale;
        lastY = (e.clientY - canvas.offsetTop) * scale;
        context.beginPath(); // 开始新路径
        context.moveTo(lastX, lastY);
    }

    function draw(e) {
    // 如果用户尝试使用未启用的输入方式，则直接返回
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
            history.push(context.getImageData(0, 0, canvas.width, canvas.height)); // 保存历史
            redoStack = []; // 清空重做栈
            updateButtonStates();
        }
        isDrawing = false;
    }

    enableTouchButton.addEventListener('click', function() {
        enableTouch = !enableTouch;
        this.textContent = enableTouch ? '禁用手指触摸' : '启用手指触摸';
    });
    
    enablePenButton.addEventListener('click', function() {
        enablePen = !enablePen;
        this.textContent = enablePen ? '禁用电容笔' : '启用电容笔';
    });

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

    // 添加触摸事件处理器
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
        history = []; // 清空历史
        redoStack = []; // 清空重做栈
        updateButtonStates();
    });

    saveButton.addEventListener('click', function() {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempContext = tempCanvas.getContext('2d');
    
        // 绘制白色背景
        tempContext.fillStyle = '#FFFFFF';
        tempContext.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
        // 绘制原始canvas的内容
        tempContext.drawImage(canvas, 0, 0);
    
        // 保存包含白色背景的图片
        const dataUrl = tempCanvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = 'picture.png';
        a.click();
    });

    // 颜色选择器逻辑
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

    // 橡皮擦逻辑
    eraser.addEventListener('click', function() {
        currentColor = '#FFFFFF'; // 假设画布背景为白色
    });
});