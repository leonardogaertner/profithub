from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    # Import routes after app creation to avoid circular imports
    from routes.investment_routes import configure_routes
    configure_routes(app)
    
    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)