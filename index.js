const App          = require('express')
const bodyParser   = require('body-parser')
const finalhandler = require('finalhandler')


const textParser = bodyParser.text({type: '*/*'})


//
// Notes
//

function postNote(req, res)
{
  const user = req.user

  var notes = user.notes
  if(notes === undefined)
    user.notes = notes = []

  notes.push(req.body)

  res.json(notes.length-1)
}

function getNotes(req, res)
{
  res.json(req.user.notes || [])
}

function getNote(req, res, next)
{
  const id    = req.params.id
  const notes = req.user.notes
  const note  = notes && notes[id]

  if(note === undefined)
  {
    const error = new Error('Unknown id "'+id+'"')
          error.status = 404

    return next(error)
  }

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
      return res.sendStatus(204)

  favorites.push(body)

  res.sendStatus(204)
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


  function postUser(req, res, next)
  {
    const body = req.body

    const user = db[body]
    if(user === undefined) db[body] = {}

    res.sendStatus(204)
  }


  const app = App()

  app.param('user', function(req, res, next, id)
  {
    const user = db[id]

    if(user === undefined)
    {
      const error = new Error('Unknown user "'+id+'"')
            error.status = 404

      return next(error)
    }

    req.user = user
    next()
  })

  app.post('/', textParser, postUser)
  app.route('/:user')
     .all (textParser)
     .post(postNote)
     .get (getNotes)
  app.route('/:user/favorites')
     .all (bodyParser.json())
     .post(postFavorite)
     .get (getFavorites)
  app.get  ('/:user/:id', getNote)
  app.use(onerror)

  return app
}


module.exports = kubide
