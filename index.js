import dotenv from 'dotenv'
import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import appRoutes from './routes'
import compression from 'compression'
import session from 'express-session'
import bodyParser from 'body-parser'
import log4js from 'log4js'
import bots from './components/bots'
import crons from './components/crons'
import workers from './components/workers'

if (process.env.NODE_ENV !== 'test') {
  bots.exec()
  crons.exec()
  workers.exec()
}

process.env.NODE_ENV !== 'production' && dotenv.config()

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true })
mongoose.set('useCreateIndex', true)
mongoose.set('useFindAndModify', false)

log4js.configure({
  appenders: { history: { type: 'file', filename: 'history.log' } },
  categories: { default: { appenders: ['history'], level: 'error' } }
})

const port = process.env.PORT || 9001
const app = express()

app.use(compression())

app.enable('trust proxy')

app.use((req, res, next) => {
  if (['production', 'staging'].includes(process.env.NODE_ENV) && !req.secure) {
    res.redirect(`https://${req.headers.host}${req.url}`)
  } else {
    next()
  }
})

app.use(
  session({
    secret: 'atenagamification',
    resave: false,
    saveUninitialized: false
  })
)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use('/', appRoutes)

process.env.NODE_ENV !== 'test' &&
  app.listen(port, () => console.info(`Listening on port ${port}`))

module.exports = app
