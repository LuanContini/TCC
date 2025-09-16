from app import create_app

app = create_app()

if __name__ == "__main__":
    # Rodar servidor Flask
    # host='0.0.0.0' permite acessar de fora, útil se precisar testar de outro dispositivo
    app.run(debug=True, host='0.0.0.0', port=5000)
