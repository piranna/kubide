#!/usr/bin/env node

const express = require('express')

const kubide = require('.')


const app = express()

app.use(kubide())

app.listen(3000, function()
{
  console.log('listening on port 3000')
})
