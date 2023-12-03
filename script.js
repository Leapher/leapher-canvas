const brushSizeInput = document.getElementById("brush-size");
const brushLabel = document.getElementById("brush-label");
const saveButton = document.getElementById("save-button");
const gridToggle = document.getElementById("grid-toggle");
const sizeInput = document.getElementById("size-input");
const colorPicker = document.getElementById("color-picker");
const eraserCheckbox = document.getElementById("eraser");
const clearButton = document.getElementById("clear-button");
const resetButton = document.getElementById("reset-button");
const canvas = document.getElementById("canvas");
const savePreset = document.getElementById("save-preset");
const loadPreset = document.getElementById("load-preset");
const fileInput = document.getElementById('file-input');
var fileNameInput = document.getElementById('name-input');

const ctx = canvas.getContext("2d");

let selectedColor = "#ff0000";
let eraserMode = false;
let showGrid = true;
let gridSize = 30; // Изначальный размер холста 30 на 30
let cellSize = Math.ceil(canvas.height / gridSize);
let [prevX, prevY] = [0, 0];
var BrushSize = 1;

let isDrawing = false;
let mode = "draw";


// helpers
const rgbToHex = (r,g,b) => {
    const t = (c)=> {
        let hx = c.toString(16)
        return hx.length==1? "0"+hx : hx 
    }
    return `#${t(r)}${t(g)}${t(b)}`
}



// Modes

const setMode = (el, xmode) => {
    let c = document.getElementById("modes").children;
    for (let btn of c) {
        btn.style.backgroundColor = "#f0f0f0"
    }
    el.style.backgroundColor = "#bababa"
    mode = xmode
}

// Brush sizing

const changeBrushSize = (sz = 1) => {
    brushLabel.textContent = "Размер кисти: " + sz;
    BrushSize = sz;
}

brushSizeInput.addEventListener("input",  () => {
  changeBrushSize(brushSizeInput.value);
});

changeBrushSize();


// Toggle Grid

gridToggle.addEventListener("change", (event) => {
  if (confirm("Данное действие сбросит ваш текущий рисунок!")) {
    showGrid = !event.target.checked;
    drawGrid(showGrid);
  } else {
    gridToggle.checked = false;
    event.preventDefault();
  }
});




function drawGrid(show) {
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = "#fff";
    ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (show) {
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        ctx.strokeStyle = "#ccc";
        ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }
  // } else {
  //   for (let x = 0; x < gridSize; x++) {
  //     for (let y = 0; y < gridSize; y++) {
  //       let clr = ctx.getImageData(x * cellSize + (cellSize / 2), y * cellSize + (cellSize / 2), 1, 1).data
  //       clr = rgbToHex(clr[0], clr[1], clr[2])
  //       console.log(clr);
  //       if (clr === "#000000") {
  //         clr === "#ffffff";
  //       };
  //       ctx.strokeStyle = clr;
  //       ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
  //     }
  //   }
   }

  // Возвращаем цвет при использовании ластика
  if (eraserMode) {
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        if (ctx.fillStyle === "#fff") {
          ctx.fillStyle = "#ccc";
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
      }
    }
  }
}


function preCreate() {
  presize = sizeInput.value
  if (presize == null) {
    presize = 30
  }
  if (presize > 1024) {
    iziToast.error({
      // ERROR > 1024PX
      title: 'Ошибка! ',
      message: 'Максимальный размер холста 1024 пикселей',
      position: 'topCenter',
      transitionIn: 'bounceInUp',
      progressBar: false,
      balloon: true,
      timeout: 2500,
      transitionOut: 'flipOutX',
      close: false,
      icon: 'https://cdn.usesaturn.xyz/icons8-error-48.png',
      
    });
  } else {
    createGrid(parseInt(presize));
  }
}

function createGrid(size) {
  gridSize = size;
  let sz = Math.floor(window.innerHeight * 0.9);
  canvas.width = sz;
  canvas.height = sz;
  cellSize = (sz / gridSize);

  // Отрисовываем сетку
  drawGrid(showGrid);
}
function fillCanvas(color, show) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (show) {
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        ctx.strokeStyle = "#ccc";
        ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }
  }
}

function drawCell(x, y, brushSize, smode=null, fillClr="", color) {
    smode = smode || mode
    //console.log(x,y,brushSize)
    if (smode==="eraser") {
        // Исправленный ластик - возвращаем цвет и оставляем границу
        ctx.fillStyle = "#fff";
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        ctx.strokeStyle = "#ccc";
        ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
        return
    } 

    if (smode==="fill") {
        // Текущий цвет клетки
        let clr = ctx.getImageData(x*cellSize+(cellSize/2), y*cellSize+(cellSize/2), 1,1).data
        clr = rgbToHex(clr[0], clr[1], clr[2])

        // 
        if (fillClr=="") {
            drawCell(x,y,1,"brush", null, selectedColor)
            fillClr = clr
        }
        if (clr!=fillClr) {
            return
        }

        drawCell(x,y,1,"brush", null, selectedColor)
        // l
        x>0 && drawCell(x-1, y, 1, smode, clr, selectedColor)
        // r
        x<gridSize-1 && drawCell(x+1, y, 1, smode, clr, selectedColor)
        // t
        y>0 && drawCell(x, y-1, 1, smode, clr, selectedColor)
        // b
        y<gridSize-1 && drawCell(x, y+1, 1, smode, clr, selectedColor)


        return
    }
    if (smode=="fill") {
      ctx.fillcolor = clr;
    } else {
      ctx.fillStyle = color;
    }
    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    if (showGrid) {
        ctx.strokeStyle = "#ccc";
    } else {
        ctx.strokeStyle = color;
    }
    ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
}

canvas.addEventListener("click", function (event) {
  const rect = canvas.getBoundingClientRect();
  var x = Math.floor((event.clientX - rect.left) / cellSize);
  var y = Math.floor((event.clientY - rect.top) / cellSize);
  console.log(x, y);

  if (BrushSize == 1) {
    drawCell(x, y, BrushSize);
  } else {
    var RD = (BrushSize - 1) / 2;
    crX = x - RD;
    crY = y - RD;
    for (let i = 0; i < BrushSize; i++) {
      for (let j  = 0; j < BrushSize; j++) {
        console.log(RD, crX, crY)
        drawCell(crX + i, crY + j, BrushSize);
      }
    }
  }
 

});

colorPicker.addEventListener("input", function (event) {
  selectedColor = event.target.value;
});

// eraserCheckbox.addEventListener("change", function (event) {
  // eraserMode = event.target.checked;
// });

clearButton.addEventListener("click", function (event) {
  if (confirm("Данное действие сбросит ваш текущий рисунок!")) {
    drawGrid(showGrid), x, y;
  } else {
    event.preventDefault();
  }
});


// Painting process

canvas.addEventListener("mousedown", function (event) {
  isDrawing = true;
});

let previousX = null;
let previousY = null;

canvas.addEventListener("mousemove", function (event) {
  if (isDrawing) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / cellSize);
    const y = Math.floor((event.clientY - rect.top) / cellSize);
    
    if (previousX !== null && previousY !== null) {
      const dx = x - previousX;
      const dy = y - previousY;
      
      const steps = Math.max(Math.abs(dx), Math.abs(dy));
      const stepX = dx / steps;
      const stepY = dy / steps;
      
      for (let i = 0; i < steps; i++) {
        const interpX = previousX + stepX * i;
        const interpY = previousY + stepY * i;
        drawCell(Math.round(interpX), Math.round(interpY), BrushSize, null, null, selectedColor);
        console.log(BrushSize)
      }
    }
    
    if (BrushSize == 1) {
      drawCell(x, y, BrushSize, null, null, selectedColor);
    } else {
      var RD = (BrushSize - 1) / 2;
      crX = x - RD;
      crY = y - RD;
      for (let i = 0; i < BrushSize; i++) {
        for (let j  = 0; j < BrushSize; j++) {
          drawCell(crX + i, crY + j, BrushSize, null, null, selectedColor);
        }
      }
    }
    
    previousX = x;
    previousY = y;
  }
});

canvas.addEventListener("mouseup", function (event) {
  isDrawing = false;
  [prevX, prevY] = [0, 0];
  previousX = null;
  previousY = null;
});

resetButton.addEventListener("click", function (event) {
  if (confirm("Данное действие сбросит ваш текущий рисунок!")) {
    preCreate();
  } else {
    event.preventDefault();
  }
});

loadPreset.addEventListener("click", function () {
  var selectedFile = fileInput.files[0];
  let reader = new FileReader();
  reader.readAsText(selectedFile);
  reader.onload = function() {
    //console.log(reader.result);
    fileContent = reader.result;
    const lines = fileContent.split('\n');
    if (lines[0] != "THIS IS LEAPHER CANVAS PRESET") {
      console.log("Error: Provided file is not an LeapherCanvas Preset")
      return
    }
    console.log(`Succesfully loaded preset with name ${selectedFile.name}`);
    for (let i = 1; i < lines.length - 1; i++) {
      var line = lines[i];
      var line = String("\"" + line + "\"");
      //console.log(line);
      //console.log(`${i + 1}: ${line}`);
      var cellData = JSON.parse(JSON.parse(line));
      //console.log(cellData);
      //console.log(typeof(cellData))
      //var cellData = eval('(' + line + ')');
      x = cellData[0];
      y = cellData[1];
      clr = cellData[2];
      //console.log(x, y, clr)
      drawCell(x, y, 1, "brush", null, clr)
    }
  }
}
)


savePreset.addEventListener("click", function() {
  var fileContent = "THIS IS LEAPHER CANVAS PRESET\n";
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      let clr = ctx.getImageData(x * cellSize + (cellSize / 2), y * cellSize + (cellSize / 2), 1, 1).data
      clr = rgbToHex(clr[0], clr[1], clr[2]);
      color = "\\" + "\"" + String(clr) + "\\" + "\"";
      //console.log(color);
      contentPlus = "[" + String(x) + ", " + String(y) + ", " +  color + "]" + "\n";
      fileContent += contentPlus;
      //console.log(x, y, color);
    }
  }
  var blob = new Blob([fileContent], { type: "text/plain" });
  var downloadLink = document.createElement("a");
  downloadLink.href = URL.createObjectURL(blob);
  var fileName = fileNameInput.value;
  downloadLink.download = `${fileName}` + `Preset.txt`;
  downloadLink.click();
});


createGrid(gridSize); // Первоначальное создание

saveButton.addEventListener("click", () => {
    const link = document.createElement("a");
    link.href = canvas.toDataURL(); // Получение данных URL изображения с canvas
    var fileName = fileNameInput.value;
    link.download = `${fileName}` + `.png`;; // Имя файла для сохранения
    link.click(); // Эмуляция нажатия на ссылку для загрузки файла
});
