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