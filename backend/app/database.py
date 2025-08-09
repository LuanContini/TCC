from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS

db = SQLAlchemy()
jwt = JWTManager()

def init_db(app):
    '''
    app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://user:pass@host/dbname'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    '''
    app.config['JWT_SECRET_KEY'] = 'supersecretkey'  # altere para algo seguro

    #db.init_app(app)
    jwt.init_app(app)
    CORS(app)  # libera CORS para o frontend React acessar a API

    with app.app_context():
        db.create_all()  # cria tabelas do banco automaticamente
