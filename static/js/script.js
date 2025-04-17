document.addEventListener('DOMContentLoaded', function () {
    fetchCDIAtual();
    showSection('calcularSection');
    prevenirValoresNegativos();
    configurarListenersIR();

    document.getElementById("btnCalcular").addEventListener("click", function () {
        showSection("calcularSection");
    });

    document.getElementById("btnComparar").addEventListener("click", function () {
        showSection("compararSection");
    });
});

function configurarListenersIR() {
    // Configuração para a seção de cálculo único
    const calcularInputs = ['tempo', 'periodo', 'isentoIR', 'valorInvestido', 'tipoTaxa', 'taxa', 'cdiAtual', 'percentualRendimento'];
    calcularInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', atualizarIR);
            element.addEventListener('change', atualizarIR);
        }
    });
    document.getElementById('ir').readOnly = true;

    // Configuração para a seção de comparação
    for (let i = 1; i <= 2; i++) {
        const compararInputs = [`tempo${i}`, `periodo${i}`, `isentoIR${i}`, `valor${i}`, `tipoTaxa${i}`, `taxa${i}`, `cdiAtual${i}`, `percentualRendimento${i}`];
        compararInputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => atualizarIRComparacao(i));
                element.addEventListener('change', () => atualizarIRComparacao(i));
            }
        });
        document.getElementById(`ir${i}`).readOnly = true;
    }
}

function atualizarIR() {
    const tempo = parseFloat(document.getElementById("tempo").value) || 0;
    const periodo = document.getElementById("periodo").value;
    const isentoIR = document.getElementById("isentoIR").checked;

    if (tempo <= 0) return;

    fetch("http://127.0.0.1:5000/calcular_ir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            tempo: tempo,
            periodo: periodo,
            isento_ir: isentoIR
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao calcular IR');
        }
        return response.json();
    })
    .then(data => {
        document.getElementById("ir").value = data.ir_percentual.toFixed(2);
        atualizarResultados();
    })
    .catch(error => {
        console.error('Erro ao calcular IR:', error);
        document.getElementById("ir").value = "0.00";
    });
}

function atualizarIRComparacao(index) {
    const tempo = parseFloat(document.getElementById(`tempo${index}`).value) || 0;
    const periodo = document.getElementById(`periodo${index}`).value;
    const isentoIR = document.getElementById(`isentoIR${index}`).checked;

    if (tempo <= 0) return;

    fetch("http://127.0.0.1:5000/calcular_ir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            tempo: tempo,
            periodo: periodo,
            isento_ir: isentoIR
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao calcular IR');
        }
        return response.json();
    })
    .then(data => {
        document.getElementById(`ir${index}`).value = data.ir_percentual.toFixed(2);
    })
    .catch(error => {
        console.error('Erro ao calcular IR:', error);
        document.getElementById(`ir${index}`).value = "0.00";
    });
}

function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.add('hidden');
    });
    const sectionToShow = document.getElementById(sectionId);
    if (sectionToShow) {
        sectionToShow.classList.remove('hidden');
        // Forçar atualização ao mudar de seção
        if (sectionId === 'calcularSection') {
            atualizarIR();
        } else if (sectionId === 'compararSection') {
            atualizarIRComparacao(1);
            atualizarIRComparacao(2);
        }
    }
}

function fetchCDIAtual() {
    const today = new Date();
    const lastMonth = new Date(today);
    lastMonth.setMonth(today.getMonth() - 1);
    
    const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };
    
    const dataInicial = formatDate(lastMonth);
    const dataFinal = formatDate(today);
    
    const url = `http://127.0.0.1:5000/api/cdi?dataInicial=${dataInicial}&dataFinal=${dataFinal}`;
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (!data || data.length === 0) {
                throw new Error('No CDI data available');
            }
            
            const sortedData = data.sort((a, b) => {
                const dateA = new Date(a.data.split('/').reverse().join('-'));
                const dateB = new Date(b.data.split('/').reverse().join('-'));
                return dateB - dateA;
            });

            const ultimoCDI = sortedData[0];
            const valorCDI = parseFloat(ultimoCDI.valor);
    
            const cdiInputs = ['cdiAtual', 'cdiAtual1', 'cdiAtual2'];
            cdiInputs.forEach(inputId => {
                const input = document.getElementById(inputId);
                if (input) {
                    input.value = valorCDI.toFixed(2);
                }
            });

            atualizarResultados();
        })
        .catch(error => {
            console.error('Erro ao buscar CDI:', error);
            const defaultCDI = 13.65;
            const cdiInputs = ['cdiAtual', 'cdiAtual1', 'cdiAtual2'];
            cdiInputs.forEach(inputId => {
                const input = document.getElementById(inputId);
                if (input) {
                    input.value = defaultCDI.toFixed(2);
                }
            });
            atualizarResultados();
        });
}

function prevenirValoresNegativos() {
    const inputsNumericos = document.querySelectorAll('input[type="number"]');

    inputsNumericos.forEach(input => {
        input.addEventListener('input', function (e) {
            if (this.value < 0) {
                this.value = 0;
            }
        });

        input.addEventListener('change', function (e) {
            if (this.value < 0) {
                this.value = 0;
            }
        });
    });
}

function atualizarResultados() {
    const valorInvestido = parseFloat(document.getElementById("valorInvestido").value) || 0;
    const tipoTaxa = document.getElementById("tipoTaxa").value;
    const tempo = parseFloat(document.getElementById("tempo").value) || 0;
    const periodo = document.getElementById("periodo").value;
    const ir = parseFloat(document.getElementById("ir").value) || 0;

    if (valorInvestido <= 0 || tempo <= 0) {
        return;
    }

    let tempoAnos = tempo;
    if (periodo === "meses") {
        tempoAnos = tempo / 12;
    } else if (periodo === "dias") {
        tempoAnos = tempo / 365;
    }

    let taxaAnual;
    if (tipoTaxa === "cdi") {
        const cdiAtual = parseFloat(document.getElementById("cdiAtual").value) || 0;
        const percentualRendimento = parseFloat(document.getElementById("percentualRendimento").value) || 0;
        taxaAnual = cdiAtual * (percentualRendimento / 100);
    } else {
        taxaAnual = parseFloat(document.getElementById("taxa").value) || 0;
    }

    fetch("http://127.0.0.1:5000/calcular", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            valor: valorInvestido,
            taxa: tipoTaxa === "fixa" ? taxaAnual : 0,
            tempo: tempo,
            periodo: periodo,
            ir: ir,
            cdi: tipoTaxa === "cdi" ? parseFloat(document.getElementById("cdiAtual").value) || 0 : null,
            percentual_rendimento: tipoTaxa === "cdi" ? parseFloat(document.getElementById("percentualRendimento").value) || 0 : null
        })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.error || 'Erro desconhecido'); });
        }
        return response.json();
    })
    .then(data => {
        document.getElementById("resValorInvestido").textContent = `R$ ${valorInvestido.toFixed(2)}`;
        document.getElementById("resRendimentoBruto").textContent = `R$ ${data.lucro_bruto.toFixed(2)}`;
        document.getElementById("resRendimentoLiquido").textContent = `R$ ${(data.montante_liquido - valorInvestido).toFixed(2)}`;
        document.getElementById("resValorTotal").textContent = `R$ ${data.montante_liquido.toFixed(2)}`;
        document.getElementById("resRentabilidade").textContent = `${((data.montante_liquido - valorInvestido) / valorInvestido * 100).toFixed(2)}%`;
    })
    .catch(error => {
        console.error('Erro ao calcular:', error);
    });
}

function toggleCDI(section, index = null) {
    let tipo, cdiGroup, taxaGroup, rendimentoGroup;

    if (section === "calcular") {
        tipo = document.getElementById("tipoTaxa").value;
        cdiGroup = document.getElementById("cdiGroupCalcular");
        taxaGroup = document.getElementById("taxaGroupCalcular");
        rendimentoGroup = document.getElementById("rendimentoGroupCalcular");
    } else {
        tipo = document.getElementById(`tipoTaxa${index}`).value;
        cdiGroup = document.getElementById(`cdiGroup${index}`);
        taxaGroup = document.getElementById(`taxaGroup${index}`);
        rendimentoGroup = document.getElementById(`rendimentoGroupCalcular${index}`);
    }

    cdiGroup.classList.toggle("hidden", tipo !== "cdi");
    taxaGroup.classList.toggle("hidden", tipo !== "fixa");
    rendimentoGroup.classList.toggle("hidden", tipo !== "cdi");

    if (tipo === "cdi") {
        if (section === "calcular") {
            document.getElementById("percentualRendimento").disabled = false;
        } else {
            document.getElementById(`percentualRendimento${index}`).disabled = false;
        }
    }

    if (section === "calcular") {
        atualizarResultados();
    }
}

function compararRentabilidade() {
    let investimentos = [];

    for (let i = 1; i <= 2; i++) {
        const tipoTaxa = document.getElementById(`tipoTaxa${i}`).value;
        const valor = parseFloat(document.getElementById(`valor${i}`).value) || 0;
        const tempo = parseFloat(document.getElementById(`tempo${i}`).value) || 0;
        const periodo = document.getElementById(`periodo${i}`).value;
        const ir = parseFloat(document.getElementById(`ir${i}`).value) || 0;

        let investimento = {
            valor: valor,
            tempo: tempo,
            periodo: periodo,
            ir: ir
        };

        if (tipoTaxa === "cdi") {
            const cdiAtual = parseFloat(document.getElementById(`cdiAtual${i}`).value) || 0;
            const percentualRendimento = parseFloat(document.getElementById(`percentualRendimento${i}`).value) || 0;
            investimento.cdi = cdiAtual;
            investimento.percentual_rendimento = percentualRendimento;
        } else {
            const taxa = parseFloat(document.getElementById(`taxa${i}`).value) || 0;
            investimento.taxa = taxa;
        }

        investimentos.push(investimento);
    }

    fetch("http://127.0.0.1:5000/comparar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ investimentos })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.error || 'Erro desconhecido'); });
        }
        return response.json();
    })
    .then(data => {
        let resultado = `<div class="row">`;
        data.resultados.forEach((invest, index) => {
            resultado += `
            <div class="col-md-6">
                <h4>Investimento ${index + 1}</h4>
                <p><strong>Alíquota IR:</strong> ${invest.ir_percentual.toFixed(2)}%</p>
                <p><strong>Montante Bruto:</strong> R$ ${invest.montante_bruto.toFixed(2)}</p>
                <p><strong>Lucro Bruto:</strong> R$ ${invest.lucro_bruto.toFixed(2)}</p>
                <p><strong>Imposto de Renda:</strong> R$ ${invest.ir.toFixed(2)}</p>
                <p><strong>Montante Líquido:</strong> R$ ${invest.montante_liquido.toFixed(2)}</p>
            </div>
            `;
        });
        resultado += `</div>`;
        document.getElementById("modalBody").innerHTML = resultado;
        new bootstrap.Modal(document.getElementById('resultModal')).show();
    })
    .catch(error => {
        const modalBody = document.getElementById("modalBody");
        modalBody.innerHTML = `<div class="alert alert-danger">Erro: ${error.message}</div>`;
        new bootstrap.Modal(document.getElementById('resultModal')).show();
    });
}

function exportarParaPDF() {
    try {
        // Extrair dados dos resultados exibidos no modal
        const modalBody = document.getElementById("modalBody");
        const investDivs = modalBody.querySelectorAll('.col-md-6');
        
        if (investDivs.length === 0) {
            throw new Error("Nenhum dado disponível para exportação");
        }

        const resultados = [];
        
        investDivs.forEach(div => {
            const texts = Array.from(div.querySelectorAll('p')).map(p => p.textContent);
            
            // Extrair os valores dos textos
            const irPercentual = parseFloat(texts[0].match(/\d+\.\d{2}/)[0]);
            const montanteBruto = parseFloat(texts[1].match(/\d+\.\d{2}/)[0]);
            const lucroBruto = parseFloat(texts[2].match(/\d+\.\d{2}/)[0]);
            const imposto = parseFloat(texts[3].match(/\d+\.\d{2}/)[0]);
            const montanteLiquido = parseFloat(texts[4].match(/\d+\.\d{2}/)[0]);
            
            resultados.push({
                ir_percentual: irPercentual,
                montante_bruto: montanteBruto,
                lucro_bruto: lucroBruto,
                ir: imposto,
                montante_liquido: montanteLiquido
            });
        });

        // Enviar dados para o backend
        fetch("http://127.0.0.1:5000/exportar_pdf", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Accept": "application/pdf"
            },
            body: JSON.stringify({ resultados })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { 
                    throw new Error(err.error || 'Erro ao gerar PDF'); 
                });
            }
            return response.blob();
        })
        .then(blob => {
            // Criar link para download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `resultado_investimentos_${new Date().toISOString().slice(0,10)}.pdf`;
            document.body.appendChild(a);
            a.click();
            
            // Limpar
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        })
        .catch(error => {
            console.error("Erro na exportação:", error);
            alert(`Falha ao exportar PDF: ${error.message}`);
        });

    } catch (error) {
        console.error("Erro ao processar dados para PDF:", error);
        alert(`Erro: ${error.message}`);
    }
}