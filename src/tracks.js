const SpotifyWebApi = require('spotify-web-api-node')
const Conf = require('conf')
const fs = require("fs");

let clientId = process.env.CLIENT_ID;
let clientSecret = process.env.CLIENT_SECRET;
let refreshToken = process.env.REFRESH_TOKEN;

const config = new Conf({projectName: 'spotify-top-tracks'})

if (clientId === null && clientSecret === null) {
    const clientIdAnswer = config.get('client_id');
    clientId = clientIdAnswer.client_id;
    const clientSecretAnswer = config.get('client_secret');
    clientSecret = clientSecretAnswer.client_secret;
    refreshToken = config.get('refresh_token')
}

const spotifyApi = new SpotifyWebApi(
    {
        clientId: clientId,
        clientSecret: clientSecret
    }
)

const returnTracks = function (err, data) {
    if (err) {
        console.log('Something went wrong!', err);
        throw err;
    }

    const topTracks = data.body.items;

    let artist_name_list = [];
    let image_url_list = []

    for (let i = 0; i < topTracks.length; i++) {
        let image_url = topTracks[i]['album']['images'][1]['url']
        let artist = topTracks[i]['artists'][0]['name'];
        let name = topTracks[i]['name'];
        let url = topTracks[i]['external_urls']['spotify']

        artist_name_list.push('[' + artist + ' - ' + name + '](' + url + ')');
        image_url_list.push('<img src="' + image_url + '"/>');
    }

    const output = generateTable(err, artist_name_list, image_url_list);

    console.log(output);

    fs.appendFile('README.md', output, err => {
        if (err) {
            console.log('No README file found.', err);
        }
    })
}

const getTopTracks = async () => {
    await refreshAccessToken()
    spotifyApi.setAccessToken(config.get('access_token'))

    const options = {
        "limit": 3,
        "time_range": "short_term"
    }

    spotifyApi.getMyTopTracks(options, returnTracks);
}

const generateTable = function (err, data, meta_data) {
    let result = "";
    result += data.join([separator = "|"]);
    result += '\n:---:|:----:|:----:\n';
    result += meta_data.join([separator = "|"]);
    return result;
}


const refreshAccessToken = async () => {
    spotifyApi.setRefreshToken(refreshToken)
    try {
        const data = await spotifyApi.refreshAccessToken()
        config.set('access_token', data.body.access_token)
        spotifyApi.setAccessToken(data.body.access_token)
    } catch (error) {
        throw new Error(error)
    }
}



module.exports = getTopTracks