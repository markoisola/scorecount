// Funktio sarjan luomiseen
function createLeague() {
  const leagueName = document.getElementById('league-name').value.trim();
  if (leagueName === '') {
    alert('Syötä sarjan nimi');
    return;
  }
  
  // Luodaan uusi sarja-objekti
  const league = {
    name: leagueName,
    teams: [],
    matches: [],
    locked: false
  };
  
  // Tallennetaan sarja paikalliseen tallennustilaan
  let leagues = JSON.parse(localStorage.getItem('leagues')) || [];
  leagues.push(league);
  localStorage.setItem('leagues', JSON.stringify(leagues));
  
  // Päivitetään sivun näkymä
  displayLeagues();
  document.getElementById('league-name').value = '';
}

// Funktio näyttää aktiiviset sarjat painonappeina
function displayLeagues() {
  const leagues = JSON.parse(localStorage.getItem('leagues')) || [];
  const leaguesButtons = document.getElementById('leagues-buttons');
  leaguesButtons.innerHTML = '';
  
  leagues.forEach((league, index) => {
    const button = document.createElement('button');
    button.textContent = league.name;
    button.setAttribute('data-index', index);
    button.onclick = () => {
      showLeagueDetails(index);
    };
    leaguesButtons.appendChild(button);
  });

  displayAllStandings();
}

// Funktio näyttää valitun sarjan tiedot ja hallintatoiminnot
function showLeagueDetails(index) {
  document.getElementById('league-details').style.display = 'block';
  document.getElementById('standings-section').style.display = 'none';
  document.getElementById('standings-sidebar').style.display = 'block';

  const leagues = JSON.parse(localStorage.getItem('leagues')) || [];
  const selectedLeague = leagues[index];
  
  const leagueDetailsSection = document.getElementById('league-details');
  leagueDetailsSection.innerHTML = '';
  
  const h2 = document.createElement('h2');
  h2.textContent = selectedLeague.name;
  leagueDetailsSection.appendChild(h2);
  
  if (!selectedLeague.locked) {
    const teamInput = document.createElement('input');
    teamInput.setAttribute('type', 'text');
    teamInput.setAttribute('id', 'team-name');
    teamInput.setAttribute('placeholder', 'Joukkueen nimi');
    leagueDetailsSection.appendChild(teamInput);
    
    const addTeamButton = document.createElement('button');
    addTeamButton.textContent = 'Lisää joukkue';
    addTeamButton.onclick = () => {
      addTeam(index);
    };
    leagueDetailsSection.appendChild(addTeamButton);
    
    const lockLeagueButton = document.createElement('button');
    lockLeagueButton.textContent = 'Sarja valmis';
    lockLeagueButton.onclick = () => {
      lockLeague(index);
    };
    leagueDetailsSection.appendChild(lockLeagueButton);
  }
  
  const teamsList = document.createElement('ul');
  selectedLeague.teams.forEach(team => {
    const li = document.createElement('li');
    li.textContent = team.name;
    li.className = 'team-name';
    teamsList.appendChild(li);
  });
  leagueDetailsSection.appendChild(teamsList);
  
  if (selectedLeague.locked) {
    const addMatchButton = document.createElement('button');
    addMatchButton.textContent = 'Lisää ottelu';
    addMatchButton.onclick = () => {
      showAddMatchForm(index);
    };
    leagueDetailsSection.appendChild(addMatchButton);
    
    const matchesList = document.createElement('div');
    selectedLeague.matches.forEach((match, matchIndex) => {
      const matchDiv = document.createElement('div');
      matchDiv.className = 'match';
      
      let team1Style = '';
      let team2Style = '';
      let score1Style = '';
      let score2Style = '';
      if (match.score1 !== undefined && match.score2 !== undefined) {
        if (match.score1 > match.score2) {
          team1Style = 'font-weight: bold;';
          score1Style = 'font-weight: bold;';
        } else {
          team2Style = 'font-weight: bold;';
          score2Style = 'font-weight: bold;';
        }
      }
      
      matchDiv.innerHTML = `
        <div class="match-info">
          <span class="team-name" style="${team1Style}">${shortenName(match.team1)}</span>
          <span class="vs">vs</span>
          <span class="team-name" style="${team2Style}">${shortenName(match.team2)}</span>
          <span class="score" id="result-${index}-${matchIndex}">
            <span style="${score1Style}">${match.score1 !== undefined ? match.score1 : ''}</span>
            -
            <span style="${score2Style}">${match.score2 !== undefined ? match.score2 : ''}</span>
          </span>
        </div>
        <div class="match-buttons">
          <button class="add-result" onclick="showAddResultForm(${index}, ${matchIndex})">Lisää tulos</button>
          <button class="edit" onclick="editMatch(${index}, ${matchIndex})">Muokkaa</button>
          <button class="delete" onclick="deleteMatch(${index}, ${matchIndex})">Poista</button>
        </div>
      `;
      matchesList.appendChild(matchDiv);
    });
    leagueDetailsSection.appendChild(matchesList);
    
    displayStandings(selectedLeague);
  }
}

// Funktio joukkueen nimen lyhentämiseen
function shortenName(name) {
  if (name.length > 12) {
    return name.substring(0, 10) + '...';
  }
  return name;
}

// Funktio joukkueen lisäämiseen
function addTeam(index) {
  const teamName = document.getElementById('team-name').value.trim();
  if (teamName === '') {
    alert('Syötä joukkueen nimi');
    return;
  }
  
  const leagues = JSON.parse(localStorage.getItem('leagues')) || [];
  leagues[index].teams.push({ name: teamName });
  localStorage.setItem('leagues', JSON.stringify(leagues));
  
  showLeagueDetails(index);
}

// Funktio sarjan lukitsemiseen
function lockLeague(index) {
  const leagues = JSON.parse(localStorage.getItem('leagues')) || [];
  leagues[index].locked = true;
  localStorage.setItem('leagues', JSON.stringify(leagues));
  
  showLeagueDetails(index);
  displayStandings(leagues[index]);
}

// Funktio ottelun lisäämiseen
function showAddMatchForm(index) {
  const leagues = JSON.parse(localStorage.getItem('leagues')) || [];
  const selectedLeague = leagues[index];
  
  const form = document.createElement('div');
  form.innerHTML = `
    <select id="team1-select">
      ${selectedLeague.teams.map(team => `<option value="${team.name}">${team.name}</option>`).join('')}
    </select>
    <select id="team2-select">
      ${selectedLeague.teams.map(team => `<option value="${team.name}">${team.name}</option>`).join('')}
    </select>
    <button onclick="addMatch(${index})">Luo ottelu</button>
  `;
  
  document.getElementById('league-details').appendChild(form);
}

function addMatch(index) {
  const leagues = JSON.parse(localStorage.getItem('leagues')) || [];
  const selectedLeague = leagues[index];
  
  const team1 = document.getElementById('team1-select').value;
  const team2 = document.getElementById('team2-select').value;
  
  selectedLeague.matches.push({
    team1: team1,
    team2: team2
  });
  localStorage.setItem('leagues', JSON.stringify(leagues));
  
  showLeagueDetails(index);
}

// Funktio ottelun muokkaamiseen
function editMatch(leagueIndex, matchIndex) {
  const leagues = JSON.parse(localStorage.getItem('leagues')) || [];
  const selectedLeague = leagues[leagueIndex];
  const match = selectedLeague.matches[matchIndex];
  
  const form = document.createElement('div');
  form.innerHTML = `
    <select id="team1-select-edit">
      ${selectedLeague.teams.map(team => `<option value="${team.name}" ${team.name === match.team1 ? 'selected' : ''}>${team.name}</option>`).join('')}
    </select>
    <select id="team2-select-edit">
      ${selectedLeague.teams.map(team => `<option value="${team.name}" ${team.name === match.team2 ? 'selected' : ''}>${team.name}</option>`).join('')}
    </select>
    <button onclick="updateMatch(${leagueIndex}, ${matchIndex})">Tallenna</button>
  `;
  
  document.getElementById(`result-${leagueIndex}-${matchIndex}`).appendChild(form);
}

function updateMatch(leagueIndex, matchIndex) {
  const leagues = JSON.parse(localStorage.getItem('leagues')) || [];
  const selectedLeague = leagues[leagueIndex];
  const match = selectedLeague.matches[matchIndex];
  
  match.team1 = document.getElementById('team1-select-edit').value;
  match.team2 = document.getElementById('team2-select-edit').value;
  
  localStorage.setItem('leagues', JSON.stringify(leagues));
  
  showLeagueDetails(leagueIndex);
}

// Funktio ottelun poistamiseen
function deleteMatch(leagueIndex, matchIndex) {
  const leagues = JSON.parse(localStorage.getItem('leagues')) || [];
  const selectedLeague = leagues[leagueIndex];
  
  selectedLeague.matches.splice(matchIndex, 1);
  localStorage.setItem('leagues', JSON.stringify(leagues));
  
  showLeagueDetails(leagueIndex);
  displayStandings(selectedLeague);
}

// Funktio tuloksen lisäämiseen
function showAddResultForm(leagueIndex, matchIndex) {
  const form = document.createElement('div');
  form.className = 'result-form';
  form.innerHTML = `
    <input type="number" id="score1-${leagueIndex}-${matchIndex}" placeholder="Pisteet joukkue 1">
    <input type="number" id="score2-${leagueIndex}-${matchIndex}" placeholder="Pisteet joukkue 2">
    <button onclick="addResult(${leagueIndex}, ${matchIndex})">Lisää tulos</button>
  `;
  
  document.getElementById(`result-${leagueIndex}-${matchIndex}`).appendChild(form);
}

function addResult(leagueIndex, matchIndex) {
  const leagues = JSON.parse(localStorage.getItem('leagues')) || [];
  const selectedLeague = leagues[leagueIndex];
  const match = selectedLeague.matches[matchIndex];
  
  match.score1 = parseInt(document.getElementById(`score1-${leagueIndex}-${matchIndex}`).value, 10);
  match.score2 = parseInt(document.getElementById(`score2-${leagueIndex}-${matchIndex}`).value, 10);
  
  localStorage.setItem('leagues', JSON.stringify(leagues));
  
  showLeagueDetails(leagueIndex);
  displayStandings(selectedLeague);
}

// Funktio sarjan standingsin laskemiseen ja näyttämiseen
function calculateStandings(league) {
  const standings = league.teams.map(team => ({
    name: team.name,
    points: 0,
    scored: 0,
    conceded: 0,
    matches: [] // Lisätään tähän otteluiden tuloksia
  }));
  
  league.matches.forEach(match => {
    const team1 = standings.find(team => team.name === match.team1);
    const team2 = standings.find(team => team.name === match.team2);
    
    if (match.score1 !== undefined && match.score2 !== undefined) {
      team1.scored += match.score1;
      team1.conceded += match.score2;
      team2.scored += match.score2;
      team2.conceded += match.score1;
      
      team1.matches.push({ opponent: match.team2, score: match.score1 - match.score2 });
      team2.matches.push({ opponent: match.team1, score: match.score2 - match.score1 });
      
      if (match.score1 > match.score2) {
        team1.points += 2;
      } else {
        team2.points += 2;
      }
    }
  });
  
  standings.sort((a, b) => b.points - a.points || b.scored - b.conceded - (a.scored - a.conceded));

  // Tarkastetaan tasapisteet ja keskinäisen ottelun tulos
  for (let i = 0; i < standings.length - 1; i++) {
    if (standings[i].points === standings[i + 1].points) {
      const team1 = standings[i];
      const team2 = standings[i + 1];
      const match = team1.matches.find(m => m.opponent === team2.name);
      
      if (match) {
        if (match.score > 0) {
          standings[i].tieBreaker = '(KO)';
        } else if (match.score < 0) {
          standings[i + 1].tieBreaker = '(KO)';
          standings[i] = standings.splice(i + 1, 1, standings[i])[0]; // Vaihdetaan joukkueet
        }
      }
    }
  }
  
  return standings;
}

function displayStandings(league) {
  const standings = calculateStandings(league);
  const standingsDiv = document.getElementById('standings');
  standingsDiv.innerHTML = '';
  
  const table = document.createElement('table');
  table.className = 'standings-table';
  table.innerHTML = `
    <tr>
      <th>Joukkue</th>
      <th>Pisteet</th>
    </tr>
  `;
  
  standings.forEach(team => {
    const row = document.createElement('tr');
    row.className = 'table-row';
    row.innerHTML = `
      <td class="team-name">${shortenName(team.name)} ${team.tieBreaker || ''}</td>
      <td class="points">${team.points}</td>
    `;
    table.appendChild(row);
  });
  
  const standingsContainer = document.createElement('div');
  standingsContainer.className = 'standings-container';
  standingsContainer.appendChild(table);
  standingsDiv.appendChild(standingsContainer);
}

function showAllStandings() {
  document.getElementById('league-details').style.display = 'none';
  document.getElementById('standings-section').style.display = 'block';
  document.getElementById('standings-sidebar').style.display = 'none';
  displayAllStandings();
}

function displayAllStandings() {
  const leagues = JSON.parse(localStorage.getItem('leagues')) || [];
  const allStandingsDiv = document.getElementById('all-standings');
  allStandingsDiv.innerHTML = '';

  leagues.forEach(league => {
    const standings = calculateStandings(league);

    const leagueStandingsDiv = document.createElement('div');
    leagueStandingsDiv.className = 'standings-container';

    const h3 = document.createElement('h3');
    h3.textContent = league.name;
    leagueStandingsDiv.appendChild(h3);

    const table = document.createElement('table');
    table.className = 'standings-table';
    table.innerHTML = `
      <tr>
        <th>Joukkue</th>
        <th>Pisteet</th>
        <th>Piste-ero</th>
      </tr>
    `;

    standings.forEach(team => {
      const row = document.createElement('tr');
      row.className = 'table-row';
      row.innerHTML = `
        <td class="team-name">${shortenName(team.name)} ${team.tieBreaker || ''}</td>
        <td class="points">${team.points}</td>
        <td class="goal-difference">${team.scored} : ${team.conceded}</td>
      `;
      table.appendChild(row);
    });

    leagueStandingsDiv.appendChild(table);
    allStandingsDiv.appendChild(leagueStandingsDiv);
  });
}


// Funktio tietojen tallentamiseen tiedostoon
function saveData() {
  const leagues = JSON.parse(localStorage.getItem('leagues')) || [];
  let data = '';

  leagues.forEach(league => {
    data += `Sarja: ${league.name}\n\nJoukkueet:\n`;
    league.teams.forEach(team => {
      data += `${team.name}\n`;
    });

    data += `\nOttelut:\n`;
    league.matches.forEach(match => {
      data += `${match.team1} vs ${match.team2}`;
      if (match.score1 !== undefined && match.score2 !== undefined) {
        data += `: ${match.score1} - ${match.score2}`;
      }
      data += '\n';
    });

    data += `\nSarjataulukko:\n`;
    const standings = calculateStandings(league);
    standings.forEach(team => {
      data += `${team.name}, Pisteet: ${team.points}, Piste-ero: ${team.scored} : ${team.conceded}\n`;
    });

    data += '\n-----------------------------------\n\n';
  });

  const blob = new Blob([data], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'koripalloturnaus_tiedot.txt';
  a.click();
}

// Funktio tietojen nollaamiseen
function resetData() {
  const confirmation = confirm("Oletko varma, että haluat nollata kaikki tiedot?");
  if (confirmation) {
    localStorage.removeItem('leagues');
    displayLeagues();
    document.getElementById('league-details').innerHTML = '';
    document.getElementById('standings').innerHTML = '';
    document.getElementById('all-standings').innerHTML = '';
  }
}

// Kutsutaan funktioita sivun latautuessa
displayLeagues();