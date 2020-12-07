const express = require('express'); // Adding Express
const app = express(); // Initializing Express
const puppeteer = require('puppeteer'); // Adding Puppeteer

// Wrapping the Puppeteer browser logic in a GET request
app.get('/', function(req, res) {

    // Launching the Puppeteer controlled headless browser and navigate to the Digimon website
    puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'], 
    }).then(async function(browser) {
      const page = await browser.newPage();
      await page.goto('https://globoesporte.globo.com/agenda/#/todos');
      await page.waitForSelector('.ScoreBoardTeamstyle__TeamInformation-sc-1xsoq6b-1');
      const result = await page.evaluate(() => {
        const championshipsEl = Array.from(document.querySelectorAll('.GroupByChampionshipsstyle__GroupBychampionshipsWrapper-sc-132ht2b-0'));
    
        const championships = championshipsEl.map(el => {
          const name = el.querySelectorAll('.GroupByChampionshipsstyle__ChampionshipName-sc-132ht2b-2')[0].textContent;
    
          const gamesEl = Array.from(el.querySelectorAll('.Matchstyle__MatchCard-opmzko-1'));
    
          const games = gamesEl.map(elgame => {
            const teamsEl = elgame.querySelectorAll('.ScoreBoardTeamstyle__ScoreBoardCard-sc-1xsoq6b-0');
            const headers = elgame.querySelector('.HeaderMatchstyle__HeaderMatchCard-sc-1gdixg6-0').getElementsByTagName('span');
    
            const gols = [
              teamsEl[0].querySelector('.gols'), 
              teamsEl[1].querySelector('.gols'),
            ];
    
            return {
              principalTeam: {
                name: teamsEl[0].getElementsByTagName('span')[0].textContent || '',
                img: teamsEl[0].getElementsByTagName('img')[0].src || '',
                gols: gols[0] ? gols[0].textContent : null,
              },
              visitingTeam: {
                name: teamsEl[1].getElementsByTagName('span')[0].textContent || '',
                img: teamsEl[1].getElementsByTagName('img')[0].src || '',
                gols: gols[1] ? gols[1].textContent : null,
              },
              round: elgame.querySelector('.Info-sc-15e0sq8-0').textContent,
              hours: headers.length > 1 ? headers[1].textContent : 'Encerrado',
            };
          });
    
          return {
            name,
            games,
          };
        })
    
        return {
          championships,
        };
      });

      res.send(result);
    });
});

// Making Express listen on port 7000
app.listen(3000, function() {
  console.log('Running on port 3000.');
});