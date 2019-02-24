const express = require('express')
const helmet = require('helmet')
const body = require('body-parser')
const crypto = require('crypto')
const { spawn } = require('child_process')

const app = express()
const port = 8080

SECRET = process.env.GIT_API_SECRET
PATH   = '/srv/http/segv'
const api = express.Router();

function getHeaders(req) {
  return {
    'delivery': req.get('X-GitHub-Delivery'),
    'signature': req.get('X-Hub-Signature'),
    'agent': req.get('User-Agent'),
    'event': req.get('X-GitHub-Event')
  }
}

function doHook(h, p) {
  if (h.event !== 'push') return;
  // It's a push event. Run the deploy script.
  deploy = spawn('bash', [`${PATH}/deploy.sh`,h.delivery], { cwd: PATH, shell: true })


}

api.use(helmet())
api.use(body.text({'type': 'application/json'}));

api.post('/git',  (req, res) => {
  headers = getHeaders(req)
  c = req.body

  if (!headers.signature) {
    res.status(400).send()
    return;
  }
  parts = headers.signature.split('=')

  if (parts.length !== 2 || parts[0] !== 'sha1') {
    res.status(400).send()
    return;
  }

  sig = parts[1];
  h = crypto.createHmac('sha1', SECRET).update(c).digest('hex')
  if (crypto.timingSafeEqual(Buffer.from(h), Buffer.from(sig))) {
    doHook(headers, JSON.parse(c));
    res.status(204).send()
    return;
  }
  res.status(400).send()
})

app.use('/api', api)

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
