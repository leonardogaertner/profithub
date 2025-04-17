def calcular_rentabilidade(valor, taxa, tempo, ir, cdi=None, percentual_rendimento=None):
    """
    Calcula a rentabilidade de um investimento considerando impostos
    
    Args:
        valor: Valor inicial investido
        taxa: Taxa de juros anual (%)
        tempo: Tempo do investimento em anos
        ir: Percentual de IR a ser aplicado (%)
        cdi: Valor do CDI (opcional)
        percentual_rendimento: Percentual do CDI (opcional)
    
    Returns:
        tuple: (montante_bruto, montante_liquido, lucro_bruto, imposto)
    """
    try:
        valor = float(valor)
        taxa = float(taxa) / 100  # Converter para decimal
        tempo = float(tempo)
        ir = float(ir) / 100      # Converter para decimal
        
        # Se for CDI, calcula a taxa baseada no CDI e percentual
        if cdi is not None and percentual_rendimento is not None:
            cdi = float(cdi)
            percentual_rendimento = float(percentual_rendimento)
            taxa = (cdi * (percentual_rendimento / 100)) / 100
        elif cdi is not None:
            cdi = float(cdi)
            taxa = cdi / 100
        
        # Cálculo do montante bruto (juros compostos)
        montante_bruto = valor * ((1 + taxa) ** tempo)
        lucro_bruto = montante_bruto - valor
        
        # Cálculo do IR
        imposto = lucro_bruto * ir
        montante_liquido = montante_bruto - imposto
        
        return montante_bruto, montante_liquido, lucro_bruto, imposto
    except Exception as e:
        raise ValueError(f"Error in calculation: {str(e)}")