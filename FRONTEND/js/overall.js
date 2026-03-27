const API = "http://127.0.0.1:5000/overall";

async function loadOverall() {
    try {
        const res = await fetch(API);
        const data = await res.json();

        const container = document.getElementById("rows");
        container.innerHTML = "";

        data.slice(0, 12).forEach((team, index) => {

            const row = document.createElement("div");
            row.className = "row";

            // 🔥 VERTICAL ALIGNMENT
            row.style.top = (95 + index * 79) + "px";

            row.innerHTML = `
                <div class="team">${team.TEAM}</div>
                <div class="win">${team.BOOYAH}</div>
                <div class="points">${team.PLACEMENT_POINTS}</div>
                <div class="kills">${team.KILL_POINTS}</div>
                <div class="total">${team.TOTAL_POINTS}</div>
            `;

            container.appendChild(row);
        });

    } catch (err) {
        console.error("Error loading data:", err);
    }
}

loadOverall();