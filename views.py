from flask import Flask, request, jsonify, render_template
from main import app

@app.route('/')
def index():
    return render_template('index.html')

def calcular_rentabilidade(valor, taxa, tempo, ir, cdi=None):
    if cdi:
        taxa = cdi/100
    else:
        taxa /= 100
    
    montante_bruto = valor * ((1 + taxa) ** tempo)
    lucro_bruto = montante_bruto - valor
    imposto = lucro_bruto * (ir / 100) if ir > 0 else 0
    montante_liquido = montante_bruto - imposto
    
    return montante_bruto, montante_liquido, lucro_bruto, imposto

@app.route('/calcular', methods=['POST'])
def calcular():
    dados = request.json
    montante_bruto, montante_liquido, lucro_bruto, imposto = calcular_rentabilidade(
        dados['valor'], dados['taxa'], dados['tempo'], dados['ir'], dados.get('cdi')
    )
    return jsonify({
        "montante_bruto": montante_bruto,
        "montante_liquido": montante_liquido,
        "lucro_bruto": lucro_bruto,
        "ir": imposto
    })

@app.route('/comparar', methods=['POST'])
def comparar():
    dados = request.json
    resultados = []

    for investimento in dados['investimentos']:
        montante_bruto, montante_liquido, lucro_bruto, imposto = calcular_rentabilidade(
            investimento['valor'], investimento['taxa'], investimento['tempo'], investimento['ir'], investimento.get('cdi')
        )
        resultados.append({
            "montante_bruto": montante_bruto,
            "montante_liquido": montante_liquido,
            "lucro_bruto": lucro_bruto,
            "ir": imposto
        })

    return jsonify({"resultados": resultados})