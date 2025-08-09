# app/routes/auth.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from app.models.user import get_user_by_username

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    user = get_user_by_username(username)
    if not user or user.password != password:
        return jsonify({'msg': 'Usuário ou senha inválidos'}), 401
    
    access_token = create_access_token(identity={'username': user.username, 'role': user.role})
    return jsonify(access_token=access_token)
