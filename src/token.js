const SpotifyWebApi = require('spotify-web-api-node')
const express = require('express')
const { Form } = require('enquirer')
const Conf = require('conf')

const config = new Conf({ projectName: 'spotify-top-tracks' })

const scopes = [
    'user-top-read'
]

let clientId = process.env.CLIENT_ID;
let clientSecret = process.env.CLIENT_SECRET;

const clientIdPrompt = new Form({
    name: 'credentials',
    message: 'Please setting your client_id:',
    choices: [
        { name: 'client_id', message: 'CLIENT_ID（required）' },
    ],
    validate: (submittedItems) => {
        if (!submittedItems.client_id) {
            return 'Please enter CLIENT_ID.'
        }
        return true
    }
})

const clientSecretPrompt = new Form({
    name: 'credentials',
    message: 'Please setting your client_secret:',
    choices: [
        { name: 'client_secret', message: 'CLIENT_SECRET（required）' }
    ],
    validate: (submittedItems) => {
        if (!submittedItems.client_secret) {
            return 'Please enter CLIENT_SECRET.'
        }
        return true
    }
})

const setToken = async () => {
    if (clientId === null && clientSecret === null) {
        const clientIdAnswer = await clientIdPrompt.run()
        clientId = clientIdAnswer.client_id;
        const clientSecretAnswer = await clientSecretPrompt.run()
        clientSecret = clientSecretAnswer.client_secret;
    }
    config.set('client_id', clientId)
    config.set('client_secret', clientSecret)

    const spotifyApi = new SpotifyWebApi({
        clientId: config.get('client_id'),
        clientSecret: config.get('client_secret'),
        redirectUri: 'http://localhost:8888/callback'
    })

    const app = express()

    app.get('/login', (req, res) => {
        res.redirect(spotifyApi.createAuthorizeURL(scopes))
    })

    app.get('/callback', (req, res) => {
        const error = req.query.error
        const code = req.query.code

        if (error) {
            console.error('Callback Error:', error)
            res.send(`Callback Error: ${error}`)
            return
        }

        spotifyApi
            .authorizationCodeGrant(code)
            .then(data => {
                const accessToken = data.body.access_token
                const refreshToken = data.body.refresh_token

                config.set('access_token', accessToken)
                config.set('refresh_token', refreshToken)

                res.send('Success! You can now close the window.')

                console.log('Successfully retrieved access token!\n Refresh token: ' + refreshToken)

                server.close()
                process.exit(0)
            })
    })

    const server = app.listen(8888, () =>
        console.log(
            'HTTP Server up. Now go to http://localhost:8888/login in your browser.'
        )
    )
}

module.exports = setToken