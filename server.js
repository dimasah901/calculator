const express = require('express')
const app = express()
const fs = require('fs/promises')
const fs_ = require('fs')
const https = require('https')

app.get('/', async (req, res) => {
    res.contentType('text/html')
    res.send(await fs.readFile('./index.html', { encoding: "utf-8" }))
})
app.get('/style.css', async (req, res) => {
    res.contentType('text/css')
    res.send(await fs.readFile('./style.css', { encoding: "utf-8" }))
})
app.get('/script.js', async (req, res) => {
    res.contentType('application/javascript')
    res.send(await fs.readFile('./script.js', { encoding: "utf-8" }))
})
app.get('/node_modules/*', async (req, res) => {
    res.contentType('application/javascript')
    res.send(await fs.readFile(`.${req.path}`, { encoding: "utf-8" }))
})
app.get('/bundle.js', async (req, res) => {
    res.contentType('application/javascript')
    res.send(await fs.readFile(`./bundle.js`, { encoding: "utf-8" }))
})
app.get('/font/*', async (req, res) => {
    res.send(await fs.readFile(`.${req.path}`))
})
app.get('/manifest.json', async (req, res) => {
    res.send(await fs.readFile(`.${req.path}`))
})

///https.createServer({
///    cert: fs_.readFileSync('./cert.pem'),
///    key: fs_.readFileSync('./key.pem'),
///    passphrase: '1234'
///}, app).listen(8080)
app.listen(8080)