function dangerColor(value, max) {
    const percent = value / max;
    if (percent >= 0.7) return "green";
    if (percent >= 0.35) return "orange";
    return "red";
}

function updatePlayerData() {
    fetch('/player')
        .then(res => res.json())
        .then(data => {
            const info = document.getElementById('player-data');
            if (data.error) {
                info.textContent = "Error: " + data.error;
                return;
            }

            info.innerHTML = `
                <strong>Player:</strong> ${data.name}<br>
                <strong>Health:</strong> <span style="color: ${dangerColor(data.health, 20)}">${data.health.toFixed(1)}</span><br>
                <strong>Hunger:</strong> <span style="color: ${dangerColor(data.hunger, 20)}">${data.hunger}</span><br>
                <strong>Saturation:</strong> ${data.saturation.toFixed(1)}<br>
                <strong>Biome:</strong> ${data.biome}<br>
                <strong>Position:</strong> (${data.x.toFixed(1)}, ${data.y.toFixed(1)}, ${data.z.toFixed(1)})
            `;
        })
        .catch(() => {
            document.getElementById('player-data').textContent = "Error: Mod disconnected.";
        });
}

updatePlayerData();
setInterval(updatePlayerData, 1000);
