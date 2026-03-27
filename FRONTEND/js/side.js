const teamsList = document.getElementById("teamsList");

const API_URL = "https://spx-data.onrender.com/side";

// 🧠 Previous state (RAW)
let previousData = [];

// 🔥 WIPE QUEUE SYSTEM
let wipeQueue = [];
let isShowing = false;


// 🔹 Alive dots
function renderAliveDots(count) {
    let dots = '';
    for (let i = 0; i < 4; i++) {
        dots += `<span class="player-dot ${i < count ? '' : 'dead'}"></span>`;
    }
    return dots;
}


// 🔥 PROCESS QUEUE (core engine)
function processQueue() {
    if (isShowing || wipeQueue.length === 0) return;

    isShowing = true;

    const event = wipeQueue.shift();
    showWipeCard(event.name, event.placement);
}


// 🔥 SHOW WIPE CARD
function showWipeCard(teamName, placement) {
    const card = document.getElementById("wipeCard");
    const name = document.getElementById("wipeTeamName");
    const placementEl = document.querySelector(".wipe-placement span");
    const logo = document.getElementById("wipeLogo");

    if (!card || !name || !placementEl || !logo) return;

    name.innerText = teamName;
    placementEl.innerText = `#${placement}`;

    // 🔥 SET TEAM LOGO
    logo.src = `/js/images/${teamName}.png`;
    logo.onerror = () => {
        logo.src = "images/default.png";
    };

    // 🔥 ENTER
    card.classList.remove("hidden");
    card.classList.add("show");

    setTimeout(() => {

        // 🔥 EXIT
        card.classList.remove("show");

        setTimeout(() => {
            card.classList.add("hidden");

            isShowing = false;
            processQueue();

        }, 500);

    }, 3500);
}


function detectWipe(oldData, newData) {
    newData.forEach(newTeam => {
        const oldTeam = oldData.find(t => t.TEAM === newTeam.TEAM);

        if (!oldTeam) return;

        const oldAlive = Number(oldTeam.ALIVE);
        const newAlive = Number(newTeam.ALIVE);

        // 🔥 STRONG DETECTION
        if (newAlive === 0 && oldAlive !== 0) {
            console.log(`💀 TEAM WIPE: ${newTeam.TEAM}`);

            const aliveTeams = newData.filter(t => Number(t.ALIVE) > 0).length;
            const placement = aliveTeams + 1;

            wipeQueue.push({
                name: newTeam.TEAM,
                placement: placement
            });

            processQueue();
        }
    });
}
// 🔹 RENDER SCOREBOARD (SORTED VIEW)
function render(teams) {
    teamsList.innerHTML = "";
    
    teams.forEach((team, i) => {
        const row = document.createElement("div");

        row.className = `team-row ${
            i === 0 ? 'top-1' :
            i === 1 ? 'top-2' :
            i === 2 ? 'top-3' : ''
        }`;
        
        row.innerHTML = `
            <div class="rank">#${i + 1}</div>
            <div class="team-name">${team.TEAM}</div>
            <div class="pts">${team.PTS}</div>
            <div class="alive">${renderAliveDots(team.ALIVE)}</div>
            <div class="elims">${team.ELIMS}</div>
        `;
        
        teamsList.appendChild(row);
    });
}


// 🔄 FETCH + PROCESS DATA
async function fetchData() {
    try {
        const res = await fetch(API_URL);
        const sidedata = await res.json();   // 🔹 RAW DATA

        // 🔹 SORT FOR DISPLAY
        const sidesortdata = [...sidedata].sort(
            (a, b) => b.PTS - a.PTS
        );

        // 🔥 FIRST LOAD FIX (NO FALSE WIPE)
        if (previousData.length === 0) {
            previousData = JSON.parse(JSON.stringify(sidedata));
            render(sidesortdata);
            return;
        }

        // 🔥 DETECT WIPE USING RAW DATA
        detectWipe(previousData, sidedata);

        // 🔹 UPDATE UI
        render(sidesortdata);

        // 🔹 UPDATE PREVIOUS STATE
        previousData = JSON.parse(JSON.stringify(sidedata));

    } catch (err) {
        console.error("Error fetching side data:", err);
    }
}


// 🔁 AUTO LOOP
setInterval(fetchData, 1000);

// INITIAL LOAD
fetchData();