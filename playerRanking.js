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

export default function playerRanking(gender) {
    return new Promise(function(resolve, reject) {
        if (!lodash.contains(validGender, gender)) {
            return reject({error: 'Argument gender is ' + gender + ' should be one of ' + validGender});
        }

        const rankingUrl = 'http://www.profixio.com/fx/lisens_nvbf/rankinglist.php?k=' + gender + '&aar=2015';

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

    const tdelements = cheerio(element, htmlParseOption).contents();
    const firstname = tdelements.eq(2).text();
    const lastname = tdelements.eq(1).text().match(/^(.*)\((.*)\)$/)[1];
    const points = tdelements.eq(3).text();
    const birthYear = tdelements.eq(1).text().match(/\((.*)\)/)[1];

    return {
        name: firstname + ' ' + lastname,
        points: points,
        birthYear: birthYear
    };
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