superagent =require('superagent');
const cheerio = require('cheerio');


const CUPASSIST_BEACHVOLLEY = 'http://www.profixio.com/fx/login.php?login_public=NVBF.NO.SVB';
const CA_TERMINLISTE = 'http://www.profixio.com/fx/terminliste.php';
const PHPSESSID = 'PHPSESSID';


exports.module = function(callback) {
	var agent = superagent.agent();
	const get = _.wrapCallback(agent.get);

	get(CUPASSIST_BEACHVOLLEY);
	
	get(CA_TERMINLISTE)
		.map((tournamentPage)  => return cheerio.load(tournamentPage.text)
		.function ($) => $('table').children().map(function() {
					element = $(this);
					var name = element.children().eq(4).text();
					if(name.substr(0, 2) == 'NT' ) {
						return element;
					}
				});

	// name
	const object = nt.map(function() {
		return {
			'name': $(this).children().eq(4).text(),
			'url': $(this).children().eq(4).find('a').attr('href')
		};
	})

	return object.get());
}


