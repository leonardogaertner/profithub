from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from io import BytesIO
from flask import make_response

def generate_pdf(data):
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