({
    babel: true
})

import lodash from 'lodash';
import cheerio from 'cheerio';
import cheerioTableparser from 'cheerio-tableparser';
const superagent = require('superagent');
const a = superagent.agent();

const htmlParseOption = {
    normalizeWhitespace: false,
    xmlMode: false,
    decodeEntities: true
};

function main() {
    a.get("https://profixio.com/fx/login.php?login_public=NVBF.NO.SVB")
    .end(requestTournament)
}

function requestTournament() {
    var ids = a.get("https://profixio.com/fx/terminliste.php?vis_gamle_arr=true")
        .end(getTournmanetIds)
}    
    
const  mapToTournamentUrl = id => `https://profixio.com/fx/vis_innbydelse.php?ib_id=${id}`;
const parseIdFromUrl = link => link.match(/ib_id=([0-9]*)/)[1];

const ROW_WITH_TOURNAMENT_LINKS = 4;

function getTournmanetIds(err, res) {
    if(err) {
        throw err;
    }
    const $ = cheerio.load(res.text);
    cheerioTableparser($)
    const tableData = $("table").parsetable();

    const tournamentLinksWithHeader = tableData[ROW_WITH_TOURNAMENT_LINKS];
    const tournamentLinks = tournamentLinksWithHeader.slice(1);
    const tournamentDetailUrls = tournamentLinks
        .map(parseIdFromUrl)
        .map(mapToTournamentUrl)
    
    console.log(tournamentDetailUrls)
    tournamentDetailUrls.forEach(url => {
        a.get(url).end(handleDetailPage)
        //how to get to the signup page from here?
        // jsdom / selenium? or can i have the same approche and parse out some url I can use? 
    });

}
