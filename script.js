// Global variables to track current drawing state
let currentMode = "color"; // 'color', 'shader', 'rainbow', or 'eraser'
let currentColor = "#4361ee"; // Modern blue as default
let isDrawing = false; // Track if user is actively drawing

function createGrid(size) {
  const container = document.querySelector("#container");

  // Clear any existing squares
  container.innerHTML = "";

  // Calculate square size based on container size
  const squareSize = 480 / size;

  // Update container width and height
  container.style.width = `${size * squareSize}px`;
  container.style.height = `${size * squareSize}px`;

  // Create the grid squares
  for (let i = 0; i < size * size; i++) {
    const square = document.createElement("div");
    square.classList.add("square");

    // Set the square size dynamically
    square.style.width = `${squareSize}px`;
    square.style.height = `${squareSize}px`;
    square.setAttribute("data-shade", "0"); // For shader mode

    // Add mouseover event listener for drawing
    square.addEventListener("mouseover", handleMouseOver);

    // Add click event for color picking
    square.addEventListener("click", handleSquareClick);

    container.appendChild(square);
  }
}

// Handle mouseover for drawing
function handleMouseOver(e) {
  // Only draw if isDrawing is true
  if (isDrawing) {
    drawOnSquare(e.target);
  }
}

// Handle click on square (for color picking or drawing)
function handleSquareClick(e) {
  if (currentMode === "picker" && e.target.style.backgroundColor) {
    // Pick color from the square
    pickColorFromSquare(e.target);
  } else if (isDrawing) {
    // Draw on the square if drawing is enabled
    drawOnSquare(e.target);
  }
}

// Draw on a square based on the current mode
function drawOnSquare(square) {
  // We've already checked isDrawing in the calling functions, so just check mode
  if (currentMode === "picker") {
    return;
  }

  switch (currentMode) {
    case "color":
      square.style.backgroundColor = currentColor;
      square.style.border = "none";
      break;
    case "rainbow":
      const randomColor = getRandomColor();
      square.style.backgroundColor = randomColor;
      square.style.border = "none";
      break;
    case "shader":
      shadeSquare(square);
      break;
    case "eraser":
      square.style.backgroundColor = "white";
      square.style.border = "1px solid #f0f0f0";
      square.setAttribute("data-shade", "0");
      break;
    default:
      break;
  }
}

// Function to generate a random color
function getRandomColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgb(${r}, ${g}, ${b})`;
}

// Apply progressive shading to a square
function shadeSquare(square) {
  const currentShade = parseInt(square.getAttribute("data-shade")) || 0;

  if (currentShade < 10) {
    const newShade = currentShade + 1;
    square.setAttribute("data-shade", newShade);

    if (
      square.style.backgroundColor &&
      square.style.backgroundColor !== "white" &&
      square.style.backgroundColor !== "rgb(255, 255, 255)"
    ) {
      // If square already has a color, darken it by 10%
      const color = parseColor(square.style.backgroundColor);
      const darkenedColor = darkenColor(color, 0.1);
      square.style.backgroundColor = `rgb(${darkenedColor.r}, ${darkenedColor.g}, ${darkenedColor.b})`;
    } else {
      // If square is white, apply current color at 10% * shade level
      const color = parseColor(currentColor);
      const darkenAmount = newShade * 0.1; // 10% per interaction
      const shadedColor = {
        r: Math.floor(255 - (255 - color.r) * darkenAmount),
        g: Math.floor(255 - (255 - color.g) * darkenAmount),
        b: Math.floor(255 - (255 - color.b) * darkenAmount),
      };
      square.style.backgroundColor = `rgb(${shadedColor.r}, ${shadedColor.g}, ${shadedColor.b})`;
    }

    // Remove border when shaded
    if (newShade > 0) {
      square.style.border = "none";
    }
  }
}

// Parse a color string to an RGB object
function parseColor(colorStr) {
  // Handle hex color
  if (colorStr.startsWith("#")) {
    const r = parseInt(colorStr.substring(1, 3), 16);
    const g = parseInt(colorStr.substring(3, 5), 16);
    const b = parseInt(colorStr.substring(5, 7), 16);
    return { r, g, b };
  }

  // Handle rgb/rgba color
  const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/i);
  if (match) {
    return {
      r: parseInt(match[1]),
      g: parseInt(match[2]),
      b: parseInt(match[3]),
    };
  }

  // Default to black if parsing fails
  return { r: 0, g: 0, b: 0 };
}

// Darken a color by a percentage
function darkenColor(color, percentage) {
  return {
    r: Math.max(0, Math.floor(color.r * (1 - percentage))),
    g: Math.max(0, Math.floor(color.g * (1 - percentage))),
    b: Math.max(0, Math.floor(color.b * (1 - percentage))),
  };
}

// Pick a color from a square
function pickColorFromSquare(square) {
  if (square.style.backgroundColor && square.style.backgroundColor !== "white") {
    // Convert RGB to HEX for the color picker
    const color = parseColor(square.style.backgroundColor);
    const hexColor = rgbToHex(color.r, color.g, color.b);

    // Update color picker and current color
    const colorPicker = document.querySelector("#colorPicker");
    colorPicker.value = hexColor;
    currentColor = hexColor;

    // Show a notification
    showNotification(`Color picked: ${hexColor}`);

    // Switch back to color mode after picking
    setMode("color");
  }
}

// Convert RGB components to HEX color
function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Set the current drawing mode
function setMode(mode) {
  currentMode = mode;

  // Update UI to reflect current mode
  document.querySelectorAll(".mode-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  const activeBtn = document.querySelector(`#${mode}Btn`);
  if (activeBtn) {
    activeBtn.classList.add("active");
  }

  // Update cursor based on current mode
  updateCursor();

  // Show notification
  let modeName = mode.charAt(0).toUpperCase() + mode.slice(1);
  showNotification(`${modeName} mode activated`);
}

// Reset the grid
function resetGrid() {
  const squares = document.querySelectorAll(".square");
  squares.forEach((square) => {
    square.style.backgroundColor = "white";
    square.style.border = "1px solid #f0f0f0";
    square.setAttribute("data-shade", "0");
  });

  // Show notification
  showNotification("Grid reset");
}

// Change grid size
function changeGridSize(size) {
  createGrid(size);

  // Show notification
  showNotification(`Grid size: ${size} × ${size}`);
}

// Toggle drawing state
function toggleDrawing() {
  isDrawing = !isDrawing;

  // Update button text
  const toggleDrawingBtn = document.querySelector("#toggleDrawingBtn");
  if (toggleDrawingBtn) {
    toggleDrawingBtn.textContent = isDrawing ? "Pause Drawing" : "Resume Drawing";
    toggleDrawingBtn.classList.toggle("active", isDrawing);
  }

  // Update cursor
  updateCursor();

  // Show notification
  showNotification(isDrawing ? "Drawing enabled" : "Drawing paused");
}

// Update cursor based on current state and mode
function updateCursor() {
  const container = document.querySelector("#container");

  if (!isDrawing) {
    container.style.cursor = "default";
    return;
  }

  switch (currentMode) {
    case "picker":
      container.style.cursor = "crosshair";
      break;
    case "eraser":
      container.style.cursor =
        'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" fill="white" stroke="black" stroke-width="1"/></svg>\') 10 10, auto';
      break;
    default:
      container.style.cursor =
        'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" fill="' +
        encodeURIComponent(currentColor) +
        '" stroke="white" stroke-width="1"/></svg>\') 10 10, auto';
      break;
  }
}

// Show a temporary notification
function showNotification(message) {
  let notification = document.querySelector(".notification");

  // Create notification element if it doesn't exist
  if (!notification) {
    notification = document.createElement("div");
    notification.classList.add("notification");
    document.body.appendChild(notification);
  }

  // Set message and show notification
  notification.textContent = message;
  notification.classList.add("show");

  // Hide after 2 seconds
  setTimeout(() => {
    notification.classList.remove("show");
  }, 2000);
}

// Add all controls to the page
function addControls() {
  const body = document.querySelector("body");

  // Create a title
  const title = document.createElement("h1");
  title.textContent = "Pixel Studio";
  title.classList.add("app-title");

  // Create app container
  const appContainer = document.createElement("div");
  appContainer.classList.add("app-container");

  // Create controls container
  const controlsPanel = document.createElement("div");
  controlsPanel.classList.add("controls-panel");

  // Create tools section
  const toolsSection = document.createElement("div");
  toolsSection.classList.add("control-section");

  const toolsTitle = document.createElement("h2");
  toolsTitle.textContent = "Tools";
  toolsTitle.classList.add("section-title");
  toolsSection.appendChild(toolsTitle);

  // Create tools container
  const toolsContainer = document.createElement("div");
  toolsContainer.classList.add("tools-container");

  // Color picker
  const colorPickerContainer = document.createElement("div");
  colorPickerContainer.classList.add("color-picker-container");

  const colorLabel = document.createElement("label");
  colorLabel.textContent = "Color";
  colorLabel.classList.add("tool-label");
  colorLabel.setAttribute("for", "colorPicker");

  const colorPicker = document.createElement("input");
  colorPicker.type = "color";
  colorPicker.id = "colorPicker";
  colorPicker.value = currentColor;
  colorPicker.classList.add("color-picker");
  colorPicker.addEventListener("input", (e) => {
    currentColor = e.target.value;
    setMode("color");
    updateCursor();
  });

  colorPickerContainer.appendChild(colorLabel);
  colorPickerContainer.appendChild(colorPicker);
  toolsContainer.appendChild(colorPickerContainer);

  // Drawing mode buttons
  const modeButtons = [
    { id: "colorBtn", text: "Color", icon: "🖌️", mode: "color" },
    { id: "rainbowBtn", text: "Rainbow", icon: "🌈", mode: "rainbow" },
    { id: "shaderBtn", text: "Shader", icon: "🎨", mode: "shader" },
    { id: "eraserBtn", text: "Eraser", icon: "🧽", mode: "eraser" },
    { id: "pickerBtn", text: "Pick Color", icon: "👆", mode: "picker" },
  ];

  modeButtons.forEach((btn) => {
    const button = document.createElement("button");
    button.id = btn.id;
    button.classList.add("mode-btn");
    if (btn.mode === currentMode) {
      button.classList.add("active");
    }

    const icon = document.createElement("span");
    icon.textContent = btn.icon;
    icon.classList.add("btn-icon");

    const text = document.createElement("span");
    text.textContent = btn.text;
    text.classList.add("btn-text");

    button.appendChild(icon);
    button.appendChild(text);
    button.addEventListener("click", () => setMode(btn.mode));

    toolsContainer.appendChild(button);
  });

  toolsSection.appendChild(toolsContainer);
  controlsPanel.appendChild(toolsSection);

  // Create grid controls section
  const gridSection = document.createElement("div");
  gridSection.classList.add("control-section");

  const gridTitle = document.createElement("h2");
  gridTitle.textContent = "Grid Settings";
  gridTitle.classList.add("section-title");
  gridSection.appendChild(gridTitle);

  // Grid size controls
  const gridControls = document.createElement("div");
  gridControls.classList.add("grid-controls");

  const sizeLabel = document.createElement("label");
  sizeLabel.textContent = "Grid Size: ";
  sizeLabel.setAttribute("for", "sizeSlider");

  const sizeValue = document.createElement("span");
  sizeValue.textContent = "16 × 16";
  sizeValue.classList.add("size-value");

  const sizeSlider = document.createElement("input");
  sizeSlider.type = "range";
  sizeSlider.id = "sizeSlider";
  sizeSlider.min = "8";
  sizeSlider.max = "64";
  sizeSlider.value = "16";
  sizeSlider.classList.add("size-slider");
  sizeSlider.addEventListener("input", (e) => {
    const size = e.target.value;
    sizeValue.textContent = `${size} × ${size}`;
    changeGridSize(size);
  });

  gridControls.appendChild(sizeLabel);
  gridControls.appendChild(sizeSlider);
  gridControls.appendChild(sizeValue);
  gridSection.appendChild(gridControls);

  // Action buttons
  const actionButtons = document.createElement("div");
  actionButtons.classList.add("action-buttons");

  // Reset button
  const resetButton = document.createElement("button");
  resetButton.textContent = "Reset Grid";
  resetButton.classList.add("action-btn");
  resetButton.addEventListener("click", resetGrid);

  // Toggle drawing button
  const toggleDrawingBtn = document.createElement("button");
  toggleDrawingBtn.id = "toggleDrawingBtn";
  toggleDrawingBtn.textContent = isDrawing ? "Pause Drawing" : "Resume Drawing";
  toggleDrawingBtn.classList.add("action-btn");
  if (isDrawing) {
    toggleDrawingBtn.classList.add("active");
  }
  toggleDrawingBtn.addEventListener("click", toggleDrawing);

  actionButtons.appendChild(resetButton);
  actionButtons.appendChild(toggleDrawingBtn);
  gridSection.appendChild(actionButtons);

  controlsPanel.appendChild(gridSection);

  // Create drawing container
  const drawingContainer = document.createElement("div");
  drawingContainer.classList.add("drawing-container");

  // Create canvas container with a title
  const canvasTitle = document.createElement("h2");
  canvasTitle.textContent = "Canvas";
  canvasTitle.classList.add("canvas-title");

  const container = document.createElement("div");
  container.id = "container";
  container.classList.add("pixel-canvas");

  drawingContainer.appendChild(canvasTitle);
  drawingContainer.appendChild(container);

  // Add all components to the app container
  appContainer.appendChild(controlsPanel);
  appContainer.appendChild(drawingContainer);

  // Clear body and add title and app container
  body.innerHTML = "";
  body.appendChild(title);
  body.appendChild(appContainer);

  // Create notification container
  const notification = document.createElement("div");
  notification.classList.add("notification");
  body.appendChild(notification);
}

// Add CSS directly using JavaScript
function addStyles() {
  const style = document.createElement("style");
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap');
    
    :root {
      --primary-color: #4361ee;
      --secondary-color: #3a0ca3;
      --background-color: #f8f9fa;
      --card-color: #ffffff;
      --text-color: #2b2d42;
      --border-color: #e9ecef;
      --shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
      --border-radius: 12px;
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: 'Poppins', sans-serif;
      background-color: var(--background-color);
      color: var(--text-color);
      line-height: 1.6;
      padding: 20px;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .app-title {
      font-size: 2.5rem;
      font-weight: 600;
      color: var(--primary-color);
      margin-bottom: 1.5rem;
      text-align: center;
    }
    
    .app-container {
      display: flex;
      flex-wrap: wrap;
      gap: 2rem;
      width: 100%;
      max-width: 1200px;
      justify-content: center;
    }
    
    .controls-panel {
      background-color: var(--card-color);
      padding: 1.5rem;
      border-radius: var(--border-radius);
      box-shadow: var(--shadow);
      width: 100%;
      max-width: 320px;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    
    .control-section {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
    }
    
    .section-title {
      font-size: 1.2rem;
      font-weight: 500;
      color: var(--text-color);
      margin-bottom: 0.5rem;
      position: relative;
      padding-bottom: 8px;
    }
    
    .section-title::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 40px;
      height: 3px;
      background-color: var(--primary-color);
      border-radius: 3px;
    }
    
    .drawing-container {
      background-color: var(--card-color);
      padding: 1.5rem;
      border-radius: var(--border-radius);
      box-shadow: var(--shadow);
      display: flex;
      flex-direction: column;
      gap: 1rem;
      align-items: center;
    }
    
    .canvas-title {
      font-size: 1.2rem;
      font-weight: 500;
      color: var(--text-color);
      margin-bottom: 0.5rem;
      align-self: flex-start;
      position: relative;
      padding-bottom: 8px;
    }
    
    .canvas-title::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 40px;
      height: 3px;
      background-color: var(--primary-color);
      border-radius: 3px;
    }
    
    .pixel-canvas {
      display: flex;
      flex-wrap: wrap;
      width: 480px;
      height: 480px;
      background-color: white;
      box-shadow: var(--shadow);
      border-radius: 4px;
      overflow: hidden;
    }
    
    .square {
      box-sizing: border-box;
      background-color: white;
      border: 1px solid #f0f0f0;
    }
    
    .color-picker-container {
      display: flex;
      flex-direction: column;
      gap: 5px;
      margin-bottom: 1rem;
    }
    
    .tool-label {
      font-size: 0.9rem;
      font-weight: 500;
    }
    
    .color-picker {
      width: 100%;
      height: 40px;
      padding: 0;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .tools-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 0.8rem;
    }
    
    .mode-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      background-color: var(--card-color);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-family: 'Poppins', sans-serif;
      font-weight: 400;
      font-size: 0.9rem;
    }
    
    .mode-btn:hover {
      border-color: var(--primary-color);
      transform: translateY(-2px);
    }
    
    .mode-btn.active {
      background-color: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
      box-shadow: 0 2px 5px rgba(67, 97, 238, 0.3);
    }
    
    .btn-icon {
      font-size: 1.2rem;
    }
    
    .grid-controls {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
    }
    
    .size-slider {
      width: 100%;
      height: 6px;
      border-radius: 3px;
      background: #e9ecef;
      outline: none;
      -webkit-appearance: none;
    }
    
    .size-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 18px;
      height: 18px;
      background: var(--primary-color);
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .size-slider::-webkit-slider-thumb:hover {
      transform: scale(1.2);
    }
    
    .size-value {
      font-weight: 500;
      font-size: 1rem;
      color: var(--primary-color);
    }
    
    .action-buttons {
      display: flex;
      gap: 0.8rem;
      margin-top: 1rem;
    }
    
    .action-btn {
      flex: 1;
      padding: 10px 16px;
      background-color: var(--card-color);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-family: 'Poppins', sans-serif;
      font-weight: 500;
      font-size: 0.9rem;
    }
    
    .action-btn:hover {
      background-color: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
    }
    
    .action-btn.active {
      background-color: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
    }
    
    .notification {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      background-color: var(--text-color);
      color: white;
      padding: 12px 24px;
      border-radius: 50px;
      box-shadow: var(--shadow);
      opacity: 0;
      transition: all 0.3s ease;
      font-size: 0.9rem;
      z-index: 1000;
    }
    
    .notification.show {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
      .app-container {
        flex-direction: column;
        align-items: center;
      }
      
      .controls-panel, .drawing-container {
        max-width: 100%;
      }
      
      .pixel-canvas {
        width: 320px;
        height: 320px;
      }
    }
  `;
  document.head.appendChild(style);
}

// Initialize with 16x16 grid and add controls
window.onload = function () {
  // Set drawing to true by default before adding any elements
  isDrawing = true;

  // Add meta viewport tag for better mobile experience
  const meta = document.createElement("meta");
  meta.author = "Ellis Walmsley";
  meta.name = "viewport";
  meta.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
  document.head.appendChild(meta);

  // Add title
  document.title = "Pixel Studio";

  // Add favicon
  const favicon = document.createElement("link");
  favicon.rel = "icon";
  favicon.href =
    'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="0.9em" font-size="90">🎨</text></svg>';
  document.head.appendChild(favicon);

  // Add styles first
  addStyles();

  // Add controls (will create the container)
  addControls();

  // Create the grid
  createGrid(16);

  // Set initial cursor
  updateCursor();

  // Show welcome notification
  setTimeout(() => {
    showNotification("Welcome to Pixel Studio! Start drawing...");
  }, 500);
};
