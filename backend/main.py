import sys
import os
import subprocess
import time
from flask import Flask
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'py', 'db')))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'py', 'app')))
from todo_controller import TodoController
from db_utils import db_get_connection
from todo_model import TodoModel

server = Flask(__name__)
conn = db_get_connection()
todo_controller = TodoController(TodoModel(), conn)
server.register_blueprint(todo_controller.blueprint)

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