import request from  'superagent';
import _ from  'highland';
import lodash from 'lodash';
import cheerio from 'cheerio';
import fs from 'fs';

const validGender = ['K', 'M'];

const htmlParseOption = {
    normalizeWhitespace: false,
    xmlMode: false,
    decodeEntities: true
};

export default function playerRanking(gender, year) {
    return new Promise(function(resolve, reject) {
        if(year < 2007) {
          return reject({error: 'Har bare data fra 2007 og oppover'});
        }
        if(year > new Date().getFullYear()) {
          return reject({error: 'Har dessverre ikke fremtidige resultater'});
        }
        if (!lodash.includes(validGender, gender)) {
            return reject({error: 'Argument gender is "' + gender + '" should be one of ' + validGender});
        }

        const rankingUrl = `http://www.profixio.com/fx/lisens_nvbf/rankinglist.php?k=${gender}&aar=${year}`;

        const result = httpGet(rankingUrl)
            .map(getTableRows)
            .flatten()
            .compact()
            .slice(1, Infinity) // skipFirst
            .map(getNameFromTr)
            .errors((ele) => console.log(ele));

        result.toArray(function(result) {
            return resolve(result);
        });
    });
};

function getNameFromTr(element) {

    try {
      const tdelements = cheerio(element, htmlParseOption).contents();

      const cupassistId = tdelements.eq(1).html().match(/sid=([0-9]*)&/)[1]
      const firstname = tdelements.eq(2).text();
      const lastname = tdelements.eq(1).text().match(/^(.*)\((.*)\)$/)[1];
      const points = tdelements.eq(3).text();
      const birthYear = tdelements.eq(1).text().match(/\((.*)\)/)[1];
      return {
          name: firstname + ' ' + lastname,
          points: parseInt(points, 10),
          birthYear: birthYear,
          cupassistId: cupassistId
      };
    } catch(e) {
      console.log('Error parsing one row', e.toString())
    }
}

function httpGet(url) {

    /*return _.wrapCallback(fs.readFile)('./example.html');*/

    return _(function(push, next) {
        // do something async when we read from the Stream
        request.get(url).end(function(error, res) {
            if(error) {
                return push(error);
            }
            push(null, res.text);
            push(null, _.nil);
        });
    });
}
function getTableRows(res, cssSelector = '.maincontent table', tableNr = 3) {
    return cheerio
        .load(res, htmlParseOption)(cssSelector)
        .eq(tableNr)
        .html()
        .split("\n");
}
