from flask import Flask
from routes import register_routes
from database import db, init_db
from models import *


app = Flask(__name__)
init_db(app)

register_routes(app)

if __name__ == "__main__":
    app.run(debug=True)
