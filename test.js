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

})
