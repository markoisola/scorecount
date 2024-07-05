// Sarjalistaus ja tietojen tallennus
let leagues = [];

// Luo uusi sarja
function createLeague() {
  const leagueName = document.getElementById('league-name').value;
  if (leagueName) {
    leagues.push({ name: leagueName, teams: [], matches: [] });
    updateLeaguesSidebar();
    document.getElementById('league-name').value = '';
  }
}

// Päivitä sarjalistaus sivupalkissa
function updateLeaguesSidebar() {
  const leaguesButtons = document.getElementById('leagues-buttons');
  leaguesButtons.innerHTML = '';
  leagues.forEach((league, index) => {
    const button = document.createElement('button');
    button.textContent = league.name;
    button.onclick = () => showLeagueDetails(index);
    leaguesButtons.appendChild(button);
  });
}

// Näytä sarjan tiedot
function showLeagueDetails(index) {
  const league = leagues[index];
  const leagueDetails = document.getElementById('league-details');
  leagueDetails.innerHTML = `
    <h2>${league.name}</h2>
    <input type="text" id="team-name" placeholder="Joukkueen nimi">
    <button onclick="addTeam(${index})">Lisää joukkue</button>
    <div id="teams-list"></div>
    <button onclick="lockLeague(${index})">Sarja valmis</button>
    <div id="matches-list"></div>
    <button onclick="addMatch(${index})">Lisää ottelu</button>
  `;
  updateTeamsList(index);
  updateMatchesList(index);
}

// Lisää joukkue sarjaan
function addTeam(index) {
  const teamName = document.getElementById('team-name').value;
  if (teamName) {
    leagues[index].teams.push({ name: teamName, points: 0, pointsDifference: 0 });
    updateTeamsList(index);
    document.getElementById('team-name').value = '';
  }
}

// Päivitä joukkueiden lista
function updateTeamsList(index) {
  const teamsList = document.getElementById('teams-list');
  teamsList.innerHTML = '';
  leagues[index].teams.forEach(team => {
    const div = document.createElement('div');
    div.textContent = team.name;
    teamsList.appendChild(div);
  });
}

// Lukitse sarja
function lockLeague(index) {
  // Sarjan lukitsemiseen liittyvät toimet
}

// Lisää ottelu sarjaan
function addMatch(index) {
  const match = {
    team1: document.getElementById(`team1-${index}`).value,
    team2: document.getElementById(`team2-${index}`).value,
    score1: 0,
    score2: 0,
  };
  leagues[index].matches.push(match);
  updateMatchesList(index);
}

// Päivitä otteluiden lista
function updateMatchesList(index) {
  const matchesList = document.getElementById('matches-list');
  matchesList.innerHTML = '';
  leagues[index].matches.forEach((match, matchIndex) => {
    const div = document.createElement('div');
    div.innerHTML = `
      ${match.team1} vs ${match.team2} - 
      <input type="text" id="score1-${index}-${matchIndex}" value="${match.score1}" size="1"> - 
      <input type="text" id="score2-${index}-${matchIndex}" value="${match.score2}" size="1">
      <button onclick="updateScore(${index}, ${matchIndex})">Päivitä tulos</button>
    `;
    matchesList.appendChild(div);
  });
}

// Päivitä ottelun tulos
function updateScore(leagueIndex, matchIndex) {
  const score1 = parseInt(document.getElementById(`score1-${leagueIndex}-${matchIndex}`).value, 10);
  const score2 = parseInt(document.getElementById(`score2-${leagueIndex}-${matchIndex}`).value, 10);
  
  leagues[leagueIndex].matches[matchIndex].score1 = score1;
  leagues[leagueIndex].matches[matchIndex].score2 = score2;
  
  // Päivitä joukkueiden pisteet ja piste-ero
  const team1 = leagues[leagueIndex].teams.find(team => team.name === leagues[leagueIndex].matches[matchIndex].team1);
  const team2 = leagues[leagueIndex].teams.find(team => team.name === leagues[leagueIndex].matches[matchIndex].team2);
  
  if (score1 > score2) {
    team1.points += 2;
  } else {
    team2.points += 2;
  }
  
  team1.pointsDifference += (score1 - score2);
  team2.pointsDifference += (score2 - score1);
  
  updateTeamsList(leagueIndex);
}

// Näytä kaikkien sarjojen pistetilanne
function showAllStandings() {
  const standingsSection = document.getElementById('standings-section');
  standingsSection.style.display = 'block';
  const allStandings = document.getElementById('all-standings');
  allStandings.innerHTML = '';
  leagues.forEach(league => {
    const div = document.createElement('div');
    div.innerHTML = `
      <h3>${league.name}</h3>
      <div>${generateStandingsTable(league.teams)}</div>
    `;
    allStandings.appendChild(div);
  });
}

// Luo pistetilannetaulukko
function generateStandingsTable(teams) {
  let table = '<table><tr><th>Joukkue</th><th>Pisteet</th><th>Piste-ero</th></tr>';
  teams.forEach(team => {
    table += `<tr><td>${team.name}</td><td>${team.points}</td><td>${team.pointsDifference}</td></tr>`;
  });
  table += '</table>';
  return table;
}

// Tallenna tiedot
function saveData() {
  const dataStr = JSON.stringify(leagues);
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

  const exportFileDefaultName = 'leagues_data.txt';

  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
}

// Nollaa kaikki tiedot
function resetData() {
  if (confirm('Haluatko varmasti nollata kaikki tiedot?')) {
    leagues = [];
    updateLeaguesSidebar();
    document.getElementById('league-details').innerHTML = '';
    document.getElementById('standings-section').style.display = 'none';
  }
}
