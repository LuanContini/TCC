import jwt
from datetime import datetime, timedelta
from flask import current_app, request, jsonify
from functools import wraps


# Gera o token JWT com id e role do usuário
def gerar_token(usuario):
    payload = {
        "id": usuario.id,
        "role": usuario.role,
        "exp": datetime.utcnow() + timedelta(hours=2),
    }
    token = jwt.encode(payload, current_app.config["JWT_SECRET_KEY"], algorithm="HS256")
    return token


# Verifica se o token é válido e retorna id + role
def verificar_token(token):
    try:
        payload = jwt.decode(
            token, current_app.config["JWT_SECRET_KEY"], algorithms=["HS256"]
        )
        return {"id": payload["id"], "role": payload["role"]}
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


# Decorator para exigir login
def login_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return jsonify({"error": "Token não fornecido"}), 401
        try:
            token = auth_header.split(" ")[1]
        except IndexError:
            return jsonify({"error": "Formato do token inválido"}), 401

        usuario = verificar_token(token)
        if not usuario:
            return jsonify({"error": "Token inválido ou expirado"}), 401

        request.usuario_id = usuario["id"]
        request.usuario_role = usuario["role"]
        return f(*args, **kwargs)

    return wrapper


# Decorator para proteger rotas por role(s) específica(s)
def role_required(*roles):
    """
    Exemplo de uso:
    @login_required
    @role_required("admin", "atendente")
    def criar_profissional(...):
        ...
    """

    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            # Verifica se o login_required já definiu o role
            if not hasattr(request, "usuario_role"):
                return jsonify({"error": "Token não fornecido"}), 401

            if request.usuario_role not in roles:
                return jsonify({"error": "Acesso negado"}), 403
            return f(*args, **kwargs)

        return wrapper

    return decorator
