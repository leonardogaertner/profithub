from flask import request, jsonify, render_template
from utils.calculations import calcular_rentabilidade
from services.pdf_service import generate_pdf
import requests

def calcular_aliquota_ir(tempo_dias, ir_especifico=None):
    """Calcula a alíquota de IR com base no tempo em dias"""
    if ir_especifico is not None:
        return float(ir_especifico)
    
    if tempo_dias <= 180:
        return 22.5
    elif tempo_dias <= 360:
        return 20.0
    elif tempo_dias <= 720:
        return 17.5
    else:
        return 15.0

def configure_routes(app):
    @app.route('/')
    def index():
        return render_template('index.html')

    @app.route('/api/cdi', methods=['GET'])
    def get_cdi():
        try:
            data_inicial = request.args.get('dataInicial')
            data_final = request.args.get('dataFinal')
            
            if not data_inicial or not data_final:
                return jsonify({"error": "Missing date parameters"}), 400
                
            url = f'https://api.bcb.gov.br/dados/serie/bcdata.sgs.1178/dados?formato=json&dataInicial={data_inicial}&dataFinal={data_final}'
            
            response = requests.get(url)
            if response.status_code != 200:
                return jsonify({"error": f"API error: {response.status_code}"}), response.status_code
                
            return jsonify(response.json())
        except Exception as e:
            return jsonify({"error": f"Error fetching CDI data: {str(e)}"}), 500

    @app.route('/calcular_ir', methods=['POST'])
    def calcular_ir_endpoint():
        try:
            dados = request.json
            if not dados:
                return jsonify({"error": "No data provided"}), 400

            required_fields = ['tempo', 'periodo']
            for field in required_fields:
                if field not in dados:
                    return jsonify({"error": f"Missing required field: {field}"}), 400

            tempo_dias = float(dados['tempo'])
            if dados['periodo'] == 'meses':
                tempo_dias *= 30
            elif dados['periodo'] == 'anos':
                tempo_dias *= 365

            isento = dados.get('isento_ir', False)
            ir_percentual = 0.0 if isento else calcular_aliquota_ir(tempo_dias)

            return jsonify({
                "ir_percentual": ir_percentual,
                "tempo_dias": tempo_dias
            })
        except Exception as e:
            return jsonify({"error": f"Internal server error: {str(e)}"}), 500

    @app.route('/calcular', methods=['POST'])
    def calcular():
        try:
            dados = request.json
            if not dados:
                return jsonify({"error": "No data provided"}), 400

            required_fields = ['valor', 'tempo', 'periodo', 'ir']
            for field in required_fields:
                if field not in dados:
                    return jsonify({"error": f"Missing required field: {field}"}), 400

            tempo_anos = float(dados['tempo'])
            if dados['periodo'] == 'meses':
                tempo_anos /= 12
            elif dados['periodo'] == 'dias':
                tempo_anos /= 365

            montante_bruto, montante_liquido, lucro_bruto, imposto = calcular_rentabilidade(
                float(dados['valor']),
                float(dados.get('taxa', 0)),
                tempo_anos,
                float(dados['ir']),
                float(dados.get('cdi')) if dados.get('cdi') else None,
                float(dados.get('percentual_rendimento')) if dados.get('percentual_rendimento') else None
            )
            
            return jsonify({
                "montante_bruto": round(montante_bruto, 2),
                "montante_liquido": round(montante_liquido, 2),
                "lucro_bruto": round(lucro_bruto, 2),
                "ir": round(imposto, 2),
                "ir_percentual": float(dados['ir'])
            })
        except ValueError as e:
            return jsonify({"error": str(e)}), 400
        except Exception as e:
            return jsonify({"error": f"Internal server error: {str(e)}"}), 500

    @app.route('/comparar', methods=['POST'])
    def comparar():
        try:
            dados = request.json
            if not dados or 'investimentos' not in dados:
                return jsonify({"error": "No investments data provided"}), 400

            resultados = []
            for investimento in dados['investimentos']:
                required_fields = ['valor', 'tempo', 'periodo', 'ir']
                for field in required_fields:
                    if field not in investimento:
                        return jsonify({"error": f"Missing required field in investment: {field}"}), 400

                tempo_anos = float(investimento['tempo'])
                if investimento['periodo'] == 'meses':
                    tempo_anos /= 12
                elif investimento['periodo'] == 'dias':
                    tempo_anos /= 365

                montante_bruto, montante_liquido, lucro_bruto, imposto = calcular_rentabilidade(
                    float(investimento['valor']),
                    float(investimento.get('taxa', 0)),
                    tempo_anos,
                    float(investimento['ir']),
                    float(investimento.get('cdi')) if investimento.get('cdi') else None,
                    float(investimento.get('percentual_rendimento')) if investimento.get('percentual_rendimento') else None
                )
                resultados.append({
                    "montante_bruto": round(montante_bruto, 2),
                    "montante_liquido": round(montante_liquido, 2),
                    "lucro_bruto": round(lucro_bruto, 2),
                    "ir": round(imposto, 2),
                    "ir_percentual": float(investimento['ir'])
                })

            return jsonify({"resultados": resultados})
        except ValueError as e:
            return jsonify({"error": str(e)}), 400
        except Exception as e:
            return jsonify({"error": f"Internal server error: {str(e)}"}), 500

    @app.route('/exportar_pdf', methods=['POST'])
    def exportar_pdf():
        try:
            data = request.json
            if not data:
                return jsonify({"error": "No data provided"}), 400

            return generate_pdf(data)

        except Exception as e:
            return jsonify({"error": f"Erro ao gerar PDF: {str(e)}"}), 500