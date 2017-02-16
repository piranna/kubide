const bodyParser   = require('body-parser')
const finalhandler = require('finalhandler')
const Router       = require('express').Router


function noContent(res)
{
  res.status(204).send()
}


//
// Notes
//

function postNote(req, res, next)
{
  const user = req.user

  var notes = user.notes
  if(notes === undefined)
    user.notes = notes = []

  notes.push(req.body)

  noContent(res)
}

function getNotes(req, res)
{
  res.json(req.user.notes || [])
}

function getNote(req, res)
{
  const note = req.user.notes[req.params.id]

  if(note === undefined) return next(new Error('Unknown id'))

  res.send(note)
}


//
// Favorites
//

function postFavorite(req, res)
{
  const user = req.user

  var favorites = user.favorites
  if(favorites === undefined)
    user.favorites = favorites = []

  const body = req.body

  // Ignore duplicates
  for(let favorite in favorites)
    if(favorite.user === body.user && favorite.id === body.id)
      return noContent(res)

  favorites.push(body)

  noContent(res)
}

function getFavorites(req, res)
{
  // TODO alternatively, allow to return the favorites body
  res.json(req.user.favorites || [])
}


//
// Error
//

function onerror(err, req, res, next)
{
  finalhandler(req, res)(err)
}


//
// Public API
//

function kubide(db)
{
  db = db || {}


  const router = Router()

  router.param('user', function(req, res, next, user)
  {
    user = db[user]

    if(user === undefined) return next(new Error('Unknown user'))

    req.user = user
    next()
  })

  router.route('/:user')
        .all (bodyParser.text())
        .post(postNote)
        .get (getNotes)
  router.get  ('/:user/:id', getNote)
  router.route('/:user/favorites')
        .all (bodyParser.json())
        .post(postFavorite)
        .get (getFavorites)
  router.use(onerror)

  return router
}


module.exports = kubide
