from flask import request, jsonify, render_template, make_response
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle  # Add ParagraphStyle to imports
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib import colors  # Add this import if using colors
from io import BytesIO
from io import BytesIO

def configure_routes(app):
    @app.route('/')
    def index():
        return render_template('index.html')

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

    @app.route('/exportar_pdf', methods=['POST'])
    def exportar_pdf():
        try:
            data = request.json
            if not data:
                return jsonify({"error": "No data provided"}), 400

            # Create PDF in memory
            buffer = BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=letter)
            
            # Custom styles to match your CSS
            styles = getSampleStyleSheet()
            
            # Define custom colors (from your CSS variables)
            primary_dark = '#00143D'
            primary = '#14213D'
            accent = '#FCA311'
            light_gray = '#E5E5E5'
            
            # Title style
            styles.add(ParagraphStyle(
                name='TitleStyle',
                parent=styles['Title'],
                fontSize=18,
                textColor=primary_dark,
                spaceAfter=20,
                alignment=1  # Center aligned
            ))
            
            # Investment header style
            styles.add(ParagraphStyle(
                name='InvestHeader',
                parent=styles['Heading2'],
                fontSize=14,
                textColor=primary,
                spaceAfter=10
            ))
            
            # Result item style
            styles.add(ParagraphStyle(
                name='ResultItem',
                parent=styles['Normal'],
                fontSize=12,
                textColor=primary_dark,
                spaceAfter=5
            ))
            
            # Highlighted value style
            styles.add(ParagraphStyle(
                name='HighlightValue',
                parent=styles['Normal'],
                fontSize=12,
                textColor=accent,
                spaceAfter=5
            ))
            
            story = []

            # Add title with your project's styling
            story.append(Paragraph(
                "<b>ProfitHub - Resultado da Comparação</b>",
                styles['TitleStyle']
            ))
            
            # Add a horizontal line (similar to your section-title border)
            story.append(Spacer(1, 12))
            story.append(Paragraph(
                "<para borderWidth='2' borderColor='{}'/>".format(accent),
                styles['Normal']
            ))
            story.append(Spacer(1, 12))

            # Add investment data with styled layout
            for idx, invest in enumerate(data['resultados'], 1):
                # Investment header with accent underline (like your h4)
                story.append(Paragraph(
                    "<b>Investimento {}</b>".format(idx),
                    styles['InvestHeader']
                ))
                
                # Create a table for better alignment of results
                from reportlab.platypus import Table, TableStyle
                from reportlab.lib import colors
                
                data_table = [
                    [
                        Paragraph("<b>Montante Bruto:</b>", styles['ResultItem']),
                        Paragraph("R$ {:.2f}".format(invest['montante_bruto']), styles['HighlightValue'])
                    ],
                    [
                        Paragraph("<b>Lucro Bruto:</b>", styles['ResultItem']),
                        Paragraph("R$ {:.2f}".format(invest['lucro_bruto']), styles['HighlightValue'])
                    ],
                    [
                        Paragraph("<b>Imposto de Renda:</b>", styles['ResultItem']),
                        Paragraph("R$ {:.2f}".format(invest['ir']), styles['HighlightValue'])
                    ],
                    [
                        Paragraph("<b>Montante Líquido:</b>", styles['ResultItem']),
                        Paragraph("R$ {:.2f}".format(invest['montante_liquido']), styles['HighlightValue'])
                    ]
                ]
                
                t = Table(data_table, colWidths=[150, 100])
                t.setStyle(TableStyle([
                    ('VALIGN', (0,0), (-1,-1), 'TOP'),
                    ('BOTTOMPADDING', (0,0), (-1,-1), 5),
                    ('TOPPADDING', (0,0), (-1,-1), 5),
                ]))
                
                story.append(t)
                story.append(Spacer(1, 20))
                
                # Add a subtle separator between investments
                if idx < len(data['resultados']):
                    story.append(Paragraph(
                        "<para borderWidth='1' borderColor='{}'/>".format(light_gray),
                        styles['Normal']
                    ))
                    story.append(Spacer(1, 20))

            doc.build(story)
            
            # Get PDF content
            pdf = buffer.getvalue()
            buffer.close()
            
            # Create response
            response = make_response(pdf)
            response.headers['Content-Type'] = 'application/pdf'
            response.headers['Content-Disposition'] = 'attachment; filename=resultado_investimentos.pdf'
            return response

        except Exception as e:
            return jsonify({"error": f"Erro ao gerar PDF: {str(e)}"}), 500

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