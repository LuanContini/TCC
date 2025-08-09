from flask import jsonify

class ValidationError(Exception):
    def __init__(self, message, status_code=400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code

def register_error_handlers(app):
    @app.errorhandler(ValidationError)
    def handle_validation_error(error):
        response = jsonify({
            "status": "error",
            "message": error.message
        })
        response.status_code = error.status_code
        return response

    @app.errorhandler(404)
    def handle_not_found(error):
        return jsonify({"status": "error", "message": "Recurso não encontrado"}), 404

    @app.errorhandler(500)
    def handle_internal_error(error):
        return jsonify({"status": "error", "message": "Erro interno no servidor"}), 500
