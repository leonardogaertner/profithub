document.addEventListener('DOMContentLoaded', function() {
    fetchCDIAtual();
    showSection('calcularSection');
    
    document.getElementById("btnCalcular").addEventListener("click", function() {
        showSection("calcularSection");
    });
    
    document.getElementById("btnComparar").addEventListener("click", function() {
        showSection("compararSection");
    });
});

function fetchCDIAtual() {
    const url = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.1178/dados?formato=json';

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const ultimoCDI = data[data.length - 1];
            const valorCDI = parseFloat(ultimoCDI.valor);

            const cdiInput = document.getElementById('cdiAtual');
            if (cdiInput) cdiInput.value = valorCDI.toFixed(2);
            
            const cdiInput1 = document.getElementById('cdiAtual1');
            if (cdiInput1) cdiInput1.value = valorCDI.toFixed(2);
            
            const cdiInput2 = document.getElementById('cdiAtual2');
            if (cdiInput2) cdiInput2.value = valorCDI.toFixed(2);
        })
        .catch(error => {
            console.error('Erro ao buscar CDI:', error);
        });
}

function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.add('hidden');
    });
    const sectionToShow = document.getElementById(sectionId);
    if (sectionToShow) sectionToShow.classList.remove('hidden');
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
}

function calcularRentabilidade() {
    const valorInvestido = parseFloat(document.getElementById("valorInvestido").value) || 0;
    const tipoTaxa = document.getElementById("tipoTaxa").value;
    const tempo = parseFloat(document.getElementById("tempo").value) || 0;
    const incidenciaIR = parseFloat(document.getElementById("ir").value) || 0;
    
    let requestData = {
        valor: valorInvestido,
        tempo: tempo,
        ir: incidenciaIR
    };

    if (tipoTaxa === "cdi") {
        const cdiAtual = parseFloat(document.getElementById("cdiAtual").value) || 0;
        const percentualRendimento = parseFloat(document.getElementById("percentualRendimento").value) || 0;
        requestData.cdi = cdiAtual;
        requestData.percentual_rendimento = percentualRendimento;
    } else {
        const taxa = parseFloat(document.getElementById("taxa").value) || 0;
        requestData.taxa = taxa;
    }

    fetch("http://127.0.0.1:5000/calcular", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.error || 'Erro desconhecido'); });
        }
        return response.json();
    })
    .then(data => {
        const modalBody = document.getElementById("modalBody");
        modalBody.innerHTML = `
            <div class="row">
                <div class="col-md-12">
                    <p><strong>Montante Bruto:</strong> R$ ${data.montante_bruto.toFixed(2)}</p>
                    <p><strong>Lucro Bruto:</strong> R$ ${data.lucro_bruto.toFixed(2)}</p>
                    <p><strong>Imposto de Renda:</strong> R$ ${data.ir.toFixed(2)}</p>
                    <p><strong>Montante Líquido:</strong> R$ ${data.montante_liquido.toFixed(2)}</p>
                </div>
            </div>
        `;
        new bootstrap.Modal(document.getElementById('resultModal')).show();
    })
    .catch(error => {
        const modalBody = document.getElementById("modalBody");
        modalBody.innerHTML = `<div class="alert alert-danger">Erro: ${error.message}</div>`;
        new bootstrap.Modal(document.getElementById('resultModal')).show();
    });
}

function compararRentabilidade() {
    let investimentos = [];

    for (let i = 1; i <= 2; i++) {
        const tipoTaxa = document.getElementById(`tipoTaxa${i}`).value;
        const valor = parseFloat(document.getElementById(`valor${i}`).value) || 0;
        const tempo = parseFloat(document.getElementById(`tempo${i}`).value) || 0;
        const ir = parseFloat(document.getElementById(`ir${i}`).value) || 0;
        
        let investimento = {
            valor: valor,
            tempo: tempo,
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