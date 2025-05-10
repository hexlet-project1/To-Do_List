import sys
import os
from flask import Flask
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'py', 'db')))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'py', 'app')))
from todo_controller import todo_controller
import subprocess
import time

server = Flask(__name__)
server.register_blueprint(todo_controller)


def free_port(port):
  cmd = f"lsof -ti :{port}"
  result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
  if result.stdout.strip():
    pids = result.stdout.strip().split('\n')
    for pid in pids:
      subprocess.run(['kill', '-9', pid])

if __name__ == '__main__':
    free_port(6432)
    time.sleep(3)
    server.run(port=6432)