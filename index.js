require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()
app.use(express.json())
app.use(cors())

// Configure and use morgan for logging requests
morgan.token('body', (req) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

// Serve static content
app.use(express.static('build'))

app.get('/info', (req, res) => {
  Person.count({}).then(num => {
    const content = `
      <p>Phonebook has info for ${num} people</p>
      <p>${Date()}</p>
    `
    res.send(content)
  })
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons)
  })
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person)
      } else {
        res.status(404).end()
      }
    }).catch(err => next(err))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).end()
    }).catch(err => next(err))
})

app.put('/api/persons/:id', (req, res, next) => {
  const { name, number } = req.body
  const person = { name, number }

  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then(updatedPerson => {
      res.json(updatedPerson)
    }).catch(err => next(err))
})

app.post('/api/persons', (req, res, next) => {
  const body = req.body

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save().then(savedPerson => {
    res.json(savedPerson)
  }).catch(err => next(err))
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (err, req, res, next) => {
  console.log(err.message)

  if (err.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  }
  if (err.name === 'ValidationError') {
    return res.status(400).send({ error: err.message })
  }

  next(err)
}
app.use(errorHandler)

const port = process.env.PORT
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
