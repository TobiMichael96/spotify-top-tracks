#! /usr/bin/env node
const { program } = require('commander');

const setToken = require('./src/token.js')
const getTopTracks = require('./src/tracks.js')

const onFatalError = () => {
    process.exitCode = 2
    console.error('Oops! Something went wrong! :(')
}

const main = () => {
    process.on('uncaughtException', onFatalError)
    process.on('unhandledRejection', onFatalError)

    program.command('get-token').action(() => setToken())
    program.command('tracks', { isDefault: true }).action(() => getTopTracks())

    program.parse()
}

main()