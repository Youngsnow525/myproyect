const ASSETS_TO_TRACK = ['bitcoin', 'ethereum', 'solana', 'dogecoin', 'ripple', 'cardano', 'polkadot', 'litecoin', 'chainlink', 'uniswap', 'polygon', 'shiba-inu', 'avalanche-2', 'cosmos', 'near', 'internet-computer', 'monero'];
const API_URL = `https://api.coingecko.com/api/v3/simple/price?ids=${ASSETS_TO_TRACK.join(',')}&vs_currencies=usd&include_24hr_change=true`;
let previousPrices = {}; 
const REFRESH_INTERVAL = 30000; 

async function fetchPrices() {
    const loader = document.getElementById('loader');
    const statusMessage = document.getElementById('status-message');

    if (loader) loader.style.display = 'block';
    if (statusMessage) statusMessage.textContent = ''; 

    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`Error de red o API: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (loader) loader.style.display = 'none';

        updateDOM(data);

    } catch (error) {
        console.error("Error al obtener datos:", error);
        if (statusMessage) {
            statusMessage.textContent = `Error: No se pudieron cargar las cotizaciones. (Detalles: ${error.message})`;
        }
    }
}

function updateDOM(currentData) {
    const listContainer = document.getElementById('price-list');
    if (!listContainer) return;

    listContainer.innerHTML = ''; 

    for (const [id, current] of Object.entries(currentData)) {
        
        const previous = previousPrices[id]; 

        const currentPrice = current.usd;
        const priceChange24h = current.usd_24h_change;

        let changeClass = '';
        let arrow = '';

        if (previous && currentPrice > previous.usd) {
            changeClass = 'up'; 
            arrow = '▲';
        } else if (previous && currentPrice < previous.usd) {
            changeClass = 'down'; 
            arrow = '▼';
        }
        
        const cardHTML = `
            <div class="price-card ${changeClass}">
                <h2>${id.toUpperCase()}</h2>
                <p class="price">$${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</p>
                <p class="change">
                    ${arrow} Cambio 24h: ${priceChange24h ? priceChange24h.toFixed(2) : '0.00'}%
                </p>
            </div>
        `;

        listContainer.insertAdjacentHTML('beforeend', cardHTML);
    }

    previousPrices = currentData; 
    
    document.getElementById('last-update').textContent = `Última actualización: ${new Date().toLocaleTimeString('es-ES')}`;
}

document.addEventListener('DOMContentLoaded', () => {
    fetchPrices(); 
    setInterval(fetchPrices, REFRESH_INTERVAL); 
});