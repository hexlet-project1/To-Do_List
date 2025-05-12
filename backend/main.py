import sys
import os
import time
from flask import Flask
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'py', 'db')))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'py', 'app')))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'py', 'utilities')))
from todo_controller import TodoController
from db_utils import db_get_connection
from todo_model import TodoModel
from ports import free_port

server = Flask(__name__)
conn = db_get_connection()
todo_controller = TodoController(TodoModel(), conn)
server.register_blueprint(todo_controller.blueprint)

if __name__ == '__main__':
    free_port(6432)
    time.sleep(3)
    server.run(port=6432)