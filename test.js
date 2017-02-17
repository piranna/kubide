const assert = require('assert')

const supertest = require('supertest')

const kubide = require('.')


function createUser(app, user)
{
  return supertest(app)
    .post('/').send(user)
    .expect(204)
}


describe('notes', function()
{
  describe('getNotes', function()
  {
    it('Get notes from not existing user', function()
    {
      const user = 'noexist'

      const app = kubide()

      return supertest(app)
        .get('/'+user)
        .expect(404)
    })

    it('Get notes from an empty user', function()
    {
      const user = 'user'

      const app = kubide()

      return createUser(app, user)
      .then(function()
      {
        return supertest(app)
          .get('/'+user)
          .expect(200, [])
      })
    })

    it('Get notes from an user', function()
    {
      const user = 'user'
      const note = 'note'
      const noteId = 0

      const app = kubide()

      return createUser(app, user)
      .then(function()
      {
        return supertest(app)
          .post('/'+user).send(note)
          .expect('Content-Type', /json/)
          .expect(200, JSON.stringify(noteId))
      })
      .then(function()
      {
        return supertest(app)
          .get('/'+user)
          .expect(200, [note])
      })
    })
  })

  describe('getNote', function()
  {
    it('Ask for a non existing note', function()
    {
      const user = 'user'
      const note = 'note'
      const noteId = 0

      const app = kubide()

      return createUser(app, user)
      .then(function()
      {
        return supertest(app)
          .get('/'+user+'/'+noteId)
          .expect(404)
      })
    })

    it('Get a note from an user', function()
    {
      const user = 'user'
      const note = 'note'
      const noteId = 0

      const app = kubide()

      return createUser(app, user)
      .then(function()
      {
        return supertest(app)
          .post('/'+user).send(note)
          .expect('Content-Type', /json/)
          .expect(200, JSON.stringify(noteId))
      })
      .then(function()
      {
        return supertest(app)
          .get('/'+user+'/'+noteId)
          .expect(200, note)
      })
    })
  })
})

describe('favorites', function()
{
  it('Get favorites from empty user', function()
  {
    const user = 'user'

    const app = kubide()

    return createUser(app, user)
    .then(function()
    {
      return supertest(app)
        .get('/'+user+'/favorites')
        .expect(200, [])
    })
  })

  it('Get favorites', function()
  {
    const user = 'user'

    const favUser = 'userFav'
    const favNote = 'I love kittens'
    const noteId  = 0

    const fav = {user: favUser, id: noteId}

    const app = kubide()

    return Promise.all(
    [
      createUser(app, favUser)
      .then(function()
      {
        return supertest(app)
          .post('/'+favUser).send(favNote)
          .expect('Content-Type', /json/)
          .expect(200, JSON.stringify(noteId))
      }),
      createUser(app, user)
    ])
    .then(function()
    {
      return supertest(app)
        .post('/'+user+'/favorites').send(fav)
        .expect(204)
    })
    .then(function()
    {
      return supertest(app)
        .get('/'+user+'/favorites')
        .expect(200, [fav])
    })
  })

  it('Get fat favorites', function()
  {
    const user = 'user'

    const favUser = 'userFav'
    const favNote = 'I love kittens'
    const noteId  = 0

    const app = kubide()

    return Promise.all(
    [
      createUser(app, favUser)
      .then(function()
      {
        return supertest(app)
          .post('/'+favUser).send(favNote)
          .expect('Content-Type', /json/)
          .expect(200, JSON.stringify(noteId))
      }),
      createUser(app, user)
    ])
    .then(function()
    {
      return supertest(app)
        .post('/'+user+'/favorites').send({user: favUser, id: noteId})
        .expect(204)
    })
    .then(function()
    {
      return supertest(app)
        .get('/'+user+'/favorites')
        .query({fat: true})
        .expect(200, [{user: favUser, id: noteId, body: favNote}])
    })
  })

  it("Explicit don't want fat favorites", function()
  {
    const user = 'user'

    const favUser = 'userFav'
    const favNote = 'I love kittens'
    const noteId  = 0

    const fav = {user: favUser, id: noteId}

    const app = kubide()

    return Promise.all(
    [
      createUser(app, favUser)
      .then(function()
      {
        return supertest(app)
          .post('/'+favUser).send(favNote)
          .expect('Content-Type', /json/)
          .expect(200, JSON.stringify(noteId))
      }),
      createUser(app, user)
    ])
    .then(function()
    {
      return supertest(app)
        .post('/'+user+'/favorites').send(fav)
        .expect(204)
    })
    .then(function()
    {
      return supertest(app)
        .get('/'+user+'/favorites')
        .query({fat: ''})
        .expect(200, [fav])
    })
  })
})
