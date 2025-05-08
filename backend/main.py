import sys
import os
from flask import Flask, jsonify, request
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'py', 'db')))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'py', 'app')))
from todo_controller import todo_controller

server = Flask(__name__)
server.register_blueprint(todo_controller)

if __name__ == '__main__':
    server.run(port=6432)