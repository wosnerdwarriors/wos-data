#!/usr/bin/env python3
# this is not needed for the project. This just serves as a local web server for testing

import argparse
import os
from flask import Flask, send_from_directory, abort

app = Flask(__name__)

# Whitelisted extensions
WHITELISTED_EXTENSIONS = {'html', 'json','js', 'png','css','md'}

def is_allowed_file(filename):
    # Check if the file has an allowed extension
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in WHITELISTED_EXTENSIONS

@app.route('/<path:filename>')
def serve_file(filename):
    # Check if the path is a directory
    if os.path.isdir(filename):
        # If it's a directory, look for index.htm or index.html
        for index_file in ['index.html', 'index.htm']:
            index_path = os.path.join(filename, index_file)
            if os.path.exists(index_path):
                return send_from_directory(filename, index_file)
        # If no index file is found, return 404
        abort(404)
    
    # If it's a file, serve it if it's allowed
    if is_allowed_file(filename):
        return send_from_directory('.', filename)
    else:
        # Return a 404 if the extension is not allowed
        abort(404)

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Run the Flask server.")
    parser.add_argument('-p', '--port', type=int, default=7500, help='Port to run the server on')
    args = parser.parse_args()

    app.run(debug=True, port=args.port)

