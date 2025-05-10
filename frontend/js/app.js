import { app, BrowserWindow } from 'electron'
import { fileURLToPath } from 'url'
import path from 'path'
import { spawn } from 'child_process'
import fs from 'fs'
import http from 'http'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let backendProcess = null

function startBackend() {
  const backendDir = path.resolve(__dirname, '../../backend')
  const mainPy = path.join(backendDir, 'main.py')

  const pyExecutable = process.platform === 'win32'
    ? path.join(backendDir, '.venv', 'Scripts', 'python.exe')
    : path.join(backendDir, '.venv', 'bin', 'python')

  backendProcess = spawn(pyExecutable, [mainPy], {
    cwd: backendDir,
    stdio: 'inherit',
    shell: false,
  })

  const pid = backendProcess.pid
  fs.writeFileSync(path.join(backendDir, 'backend.pid'), pid.toString())
}

function stopBackend() {
  const backendDir = path.resolve(__dirname, '../../backend')
  const pidFile = path.join(backendDir, 'backend.pid')
  const pid = fs.readFileSync(pidFile, 'utf8')
  process.kill(pid)
  fs.unlinkSync(pidFile)
}

function waitForBackendReady() {
  const maxRetries = 30
  const delay = 1000
  let attempts = 0
  return new Promise((resolve, reject) => {
    const check = () => {
      http.get('http://127.0.0.1:6432/todos', (res) => {
        if (res.statusCode === 200) {
          resolve()
        }
        else {
          retry()
        }
      }).on('error', retry)
    }

    const retry = () => {
      attempts += 1
      if (attempts >= maxRetries) {
        reject(new Error('Backend не запустился в пределах установленного времени'))
      }
      else {
        setTimeout(check, delay)
      }
    }
    check()
  })
}

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    show: false,
  })
  win.loadFile(path.join(__dirname, '../html/index.html'))
  win.removeMenu()
  win.once('ready-to-show', () => {
    win.show()
  })
}

app.whenReady().then(async () => {
  startBackend()
  await waitForBackendReady()
  createWindow()

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
    stopBackend()
  })
})
