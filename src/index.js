const express = require('express');
const app = express();
const puppeteer = require('puppeteer');

class Routes {

  constructor() {
    return (async () => {
      this.browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'], 
      });
      return this;
    })();
  }

  Root = async (req, res, next) => {
    const page = await this.browser.newPage();
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
      page.close();
      res.send(result);
  }
}

(async () => {
  const routes = await new Routes();
  app.get('/', routes.Root);
  app.listen(5000);
})();
