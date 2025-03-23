# ProfitHub 

## Rentability Calculator and Comparison App

This application helps users calculate and compare the profitability of investments. It includes features for calculating the profitability of a single investment and comparing the profitability of two investments.

## Features
- **Calcular Rentabilidade**: Calculate the profitability of a single investment.
- **Comparar Rentabilidade**: Compare the profitability of two investments.
- **Taxa Fixa and CDI Support**: Choose between fixed rates or CDI-based calculations.
- **Imposto de Renda (IR) Calculation**: Automatically calculates the impact of income tax on profitability.

## Technologies Used
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Python (Flask)
- **Styling**: Bootstrap

---

## Prerequisites
Before running the application, ensure you have the following installed:
- **Python 3.x**: Download and install Python from [python.org](https://www.python.org/).
- **Pip**: Python's package installer (usually comes pre-installed with Python).
- **Git**: Download and install Git from [git-scm.com](https://git-scm.com/).

---

# How to Run the Application

## 1. Clone the Repository
1. Open a terminal or command prompt.
2. Run the following command to clone the repository:

```
git clone https://github.com/your-username/your-repo-name.git
```

3. Navigate to the project directory:
```
cd your-repo-name
```

## 2. Set Up the Backend
1. Install the required Python packages:

```
pip install flask flask-cors
```
This will install Flask (for the backend) and Flask-CORS (to handle cross-origin requests).

2. Run the Flask server:

```
python app.py
```
The backend will start running at http://127.0.0.1:5000.

## 3. Set Up the Frontend
### Using VS Code Live Server:

1. Open the project in Visual Studio Code.

2. Install the "Live Server" extension if you don't have it already.

3. Right-click on index.html and select "Open with Live Server."

### Using Python's Built-in HTTP Server:

1. Open a terminal in the project directory.

2. Run the following command:

```
python -m http.server 8000
```

3. Open your browser and navigate to http://localhost:8000

## 4. Project Structure

```
your-repo-name/
├── index.html          # Frontend HTML file
├── style.css           # Frontend CSS file
├── script.js           # Frontend JavaScript file
├── app.py              # Backend Flask application
├── README.md           # This README file
```

## 5. API Endpoints

### POST /calcular 
Calculate the profitability of a single investment.

#### Request Body:

```
{
  "valor": 1000,
  "taxa": 10,
  "cdi": 5,        // Optional (only for CDI-based calculations)
  "tempo": 2,
  "ir": 15
}
```

#### Response:

```
{
  "montante_bruto": 1210.00,
  "montante_liquido": 1178.50,
  "lucro_bruto": 210.00,
  "ir": 31.50
}
```
### POST /comparar: Compare the profitability of two investments.

#### Request Body:

```
{
  "investimentos": [
    {
      "valor": 1000,
      "taxa": 10,
      "cdi": 5,    // Optional (only for CDI-based calculations)
      "tempo": 2,
      "ir": 15
    },
    {
      "valor": 2000,
      "taxa": 8,
      "tempo": 3,
      "ir": 20
    }
  ]
}
```
#### Response:

```
{
  "resultados": [
    {
      "montante_bruto": 1210.00,
      "montante_liquido": 1178.50,
      "lucro_bruto": 210.00,
      "ir": 31.50
    },
    {
      "montante_bruto": 2597.12,
      "montante_liquido": 2477.70,
      "lucro_bruto": 597.12,
      "ir": 119.42
    }
  ]
}
```

Contact
If you have any questions or feedback, feel free to reach out:

Email: leonardo.gaertner@edu.udesc.br

GitHub: leonardogaertner
