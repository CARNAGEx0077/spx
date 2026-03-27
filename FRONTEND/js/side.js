const teamsList = document.getElementById("teamsList");

const API_URL = "http://127.0.0.1:5000/side";

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

    const teamName = wipeQueue.shift();
    showWipeCard(teamName);
}


// 🔥 SHOW WIPE CARD
function showWipeCard(teamName) {
    const card = document.getElementById("wipeCard");
    const name = document.getElementById("wipeTeamName");

    if (!card || !name) return;

    name.innerText = teamName;

    // 🔥 ENTER ANIMATION
    card.classList.remove("hidden");
    card.classList.add("show");

    // 🔥 HOLD TIME (main visible duration)
    setTimeout(() => {

        // 🔥 EXIT ANIMATION
        card.classList.remove("show");

        // wait for animation to finish before fully hiding
        setTimeout(() => {
            card.classList.add("hidden");

            isShowing = false;

            // process next event AFTER exit
            processQueue();

        }, 500); // match your CSS transition time

    }, 3500); // 👈 MAIN DISPLAY TIME (tune this: 3000–4500)
}


// 🔥 DETECT TEAM WIPE (RAW DATA COMPARISON)
function detectWipe(oldData, newData) {
    newData.forEach(newTeam => {
        const oldTeam = oldData.find(t => t.TEAM === newTeam.TEAM);

        if (!oldTeam) return;

        // wipe condition
        if (oldTeam.ALIVE > 0 && newTeam.ALIVE === 0) {
            console.log(`💀 TEAM WIPE: ${newTeam.TEAM}`);

            // add to queue
            wipeQueue.push(newTeam.TEAM);

            // start queue processing
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
setInterval(fetchData, 700);

// INITIAL LOAD
fetchData();