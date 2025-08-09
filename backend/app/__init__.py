from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, verify_jwt_in_request, exceptions as jwt_exceptions
from .database import db, init_db
from .routes import register_routes

def create_app():
    app = Flask(__name__)
    #init_db(app)
    register_routes(app)

    excluded_routes = ['/auth/login', '/auth/register']

    '''
    @app.before_request
    def check_jwt():
        path = request.path
        # Liberar rotas públicas
        if any(path.startswith(route) for route in excluded_routes):
            return None  # libera o acesso
        
        # Para as outras rotas, verifica token JWT
        try:
            verify_jwt_in_request()
        except jwt_exceptions.NoAuthorizationError:
            return jsonify({"msg": "Token não enviado"}), 401
        except jwt_exceptions.ExpiredSignatureError:
            return jsonify({"msg": "Token expirado"}), 401
        except Exception:
            return jsonify({"msg": "Token inválido"}), 401
    '''
    
    return app
