import { getStocks, getStats } from "./index.js";

let st;

export default async function fetchAndCreateChart(range = "5y", symbol = "AAPL") {
    const url = `https://stocksapi-uhe1.onrender.com/api/stocks/getstocksdata`;
    st = symbol;
    try {
        const response = await fetch(url);
        const result = await response.json();
        console.log(result);
        let chartData = result.stocksData[0][st][range].value;
        let labels = result.stocksData[0][st][range].timeStamp;

        labels = labels.map((timestamp) => new Date(timestamp * 1000).toLocaleDateString());
        drawChart(chartData, labels, st);
        getStocks(st);
        getStats(st);
    } catch (error) {
        console.error(error);
    }
}

const onedaybtn = document.getElementById("btn1d");
const onemonbtn = document.getElementById("btn1mo");
const oneyrbtn = document.getElementById("btn1y");
const fiveyrbtn = document.getElementById("btn5y");

onedaybtn.addEventListener('click', () => {
    fetchAndCreateChart("1mo", st);
});
onemonbtn.addEventListener('click', () => {
    fetchAndCreateChart("3mo", st);
});
oneyrbtn.addEventListener('click', () => {
    fetchAndCreateChart("1y", st);
});
fiveyrbtn.addEventListener('click', () => {
    fetchAndCreateChart("5y", st);
});

function drawChart(data, labels, stockName) {
    const canvas = document.getElementById('chartCanvas');
    const ctx = canvas.getContext('2d');
    const chartHeight = canvas.height;
    const chartWidth = canvas.width;
    const dataMax = Math.max(...data);
    const dataMin = Math.min(...data);
    const dataRange = dataMax - dataMin;
    const dataStep = dataRange > 0 ? chartHeight / dataRange : 0;
    const stepX = chartWidth / (data.length - 1);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.moveTo(0, chartHeight - (data[0] - dataMin) * dataStep);
    for (let i = 1; i < data.length; i++) {
        ctx.lineTo(i * stepX, chartHeight - (data[i] - dataMin) * dataStep);
    }
    ctx.strokeStyle = '#39FF14';
    ctx.lineWidth = 2;
    ctx.stroke();

    const tooltip = document.getElementById('tooltip');
    const xAxisLabel = document.getElementById('xAxisLabel');

    canvas.addEventListener('mousemove', (event) => {
        const x = event.offsetX;
        const dataIndex = Math.min(Math.floor(x / stepX), data.length - 1); 
        const stockValue = data[dataIndex].toFixed(2);
        const xAxisValue = labels[dataIndex];

        tooltip.style.display = 'block';
        tooltip.style.left = `${x + 10}px`;
        tooltip.style.top = `${event.offsetY - 30}px`;
        tooltip.textContent = `${stockName}: ${stockValue}`;

        xAxisLabel.style.display = 'block';
        xAxisLabel.style.fontSize = '14px';
        xAxisLabel.style.fontWeight = 'bold';   
        xAxisLabel.style.left = `${x}px`;
        xAxisLabel.textContent = xAxisValue;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.beginPath();
        ctx.moveTo(0, chartHeight - (data[0] - dataMin) * dataStep);
        for (let i = 1; i < data.length; i++) {
            ctx.lineTo(i * stepX, chartHeight - (data[i] - dataMin) * dataStep);
        }
        ctx.strokeStyle = '#39FF14';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, chartHeight);
        ctx.strokeStyle = '#ccc';
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x, chartHeight - (data[dataIndex] - dataMin) * dataStep, 6, 0, 2 * Math.PI);
        ctx.fillStyle = '#39FF14';
        ctx.fill();
    });

    canvas.addEventListener('mouseout', () => {
        tooltip.style.display = 'none';
        xAxisLabel.style.display = 'none';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawChart(data, labels, stockName); 
    });
}
