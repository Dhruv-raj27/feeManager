import { app, BrowserWindow } from "electron";
import path from "path";

let mainWindow: BrowserWindow | null = null;
let backendStarted = false;

function startBackend() {
  // In production (packaged app), require and run the backend directly
  // In development, you'll run the backend separately
  if (app.isPackaged) {
    const serverPath = path.join(__dirname, "..", "backend", "server.js");
    
    console.log("Starting backend server at:", serverPath);
    
    try {
      process.env.NODE_ENV = "production";
      require(serverPath);
      backendStarted = true;
      console.log("Backend server loaded successfully");
    } catch (err) {
      console.error("Failed to start backend:", err);
      console.error((err as Error).stack);
    }
  }
}

function createWindow() {
  // Prevent multiple windows
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.focus();
    return;
  }

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // In development, load from Vite dev server
  // In production, load from built files
  if (app.isPackaged) {
    const indexPath = path.join(__dirname, "..", "frontend", "index.html");
    mainWindow.loadFile(indexPath);
  } else {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  if (app.isPackaged) {
    startBackend();
    // Give backend time to initialize
    setTimeout(createWindow, 2000);
  } else {
    createWindow();
  }
});

app.on("window-all-closed", () => {
  app.quit();
});

app.on("activate", () => {
  if (!mainWindow || mainWindow.isDestroyed()) {
    createWindow();
  }
});
