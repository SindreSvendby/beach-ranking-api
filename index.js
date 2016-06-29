import express from 'express'
import playerRanking from  './playerRanking';
import fs from 'fs';

const app = express();

app.get('/', function(req, res) {
    return res.json({status: 200, message: 'up and running'});
});

app.get('/fake/woman/', function(req, res) {
    return res.json(JSON.parse(fs.readFileSync('./output.json', 'utf8')));
});

app.get('/ranking/:year/:gender', function(req, res) {
    const rankingP = playerRanking(req.params.gender, req.params.year);

    rankingP.then(function(result) {
        return res.json(result);
    });

    rankingP.catch(function(error) {
        console.log('error IN playerRanking, : ', error);
        return res.status(500).json(error);
    });
});

const server = app.listen(process.env.PORT || 3000, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});
