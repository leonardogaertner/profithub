from flask import Flask, request, jsonify, render_template
from main import app

@app.route('/')
def index():
    return render_template('index.html')

def calcular_rentabilidade(valor, taxa, tempo, ir, cdi=None, percentual_rendimento=None):
    try:
        valor = float(valor)
        tempo = float(tempo)
        ir = float(ir)
        
        if cdi and percentual_rendimento:
            cdi = float(cdi)
            percentual_rendimento = float(percentual_rendimento)
            taxa = (cdi * (percentual_rendimento / 100)) / 100
        elif cdi:
            cdi = float(cdi)
            taxa = cdi / 100
        else:
            taxa = float(taxa) / 100
        
        montante_bruto = valor * ((1 + taxa) ** tempo)
        lucro_bruto = montante_bruto - valor
        imposto = lucro_bruto * (ir / 100) if ir > 0 else 0
        montante_liquido = montante_bruto - imposto
        
        return montante_bruto, montante_liquido, lucro_bruto, imposto
    except Exception as e:
        raise ValueError(f"Error in calculation: {str(e)}")

@app.route('/calcular', methods=['POST'])
def calcular():
    try:
        dados = request.json
        if not dados:
            return jsonify({"error": "No data provided"}), 400

        required_fields = ['valor', 'tempo', 'ir']
        for field in required_fields:
            if field not in dados:
                return jsonify({"error": f"Missing required field: {field}"}), 400

        montante_bruto, montante_liquido, lucro_bruto, imposto = calcular_rentabilidade(
            dados['valor'],
            dados.get('taxa', 0),
            dados['tempo'],
            dados['ir'],
            dados.get('cdi'),
            dados.get('percentual_rendimento')
        )
        
        return jsonify({
            "montante_bruto": round(montante_bruto, 2),
            "montante_liquido": round(montante_liquido, 2),
            "lucro_bruto": round(lucro_bruto, 2),
            "ir": round(imposto, 2)
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
            required_fields = ['valor', 'tempo', 'ir']
            for field in required_fields:
                if field not in investimento:
                    return jsonify({"error": f"Missing required field in investment: {field}"}), 400

            montante_bruto, montante_liquido, lucro_bruto, imposto = calcular_rentabilidade(
                investimento['valor'],
                investimento.get('taxa', 0),
                investimento['tempo'],
                investimento['ir'],
                investimento.get('cdi'),
                investimento.get('percentual_rendimento')
            )
            resultados.append({
                "montante_bruto": round(montante_bruto, 2),
                "montante_liquido": round(montante_liquido, 2),
                "lucro_bruto": round(lucro_bruto, 2),
                "ir": round(imposto, 2)
            })

        return jsonify({"resultados": resultados})
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500