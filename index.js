require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()
app.use(express.json())
app.use(cors())

// Configure and use morgan for logging requests
morgan.token('body', (req, res) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

// Serve static content
app.use(express.static('build'))

let persons = [
  { 
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456",
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523",
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345",
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122",
  }
]

app.get('/info', (req, res) => {
  const content = `
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${Date()}</p>
  `
  res.send(content)
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons)
  })
})

app.get('/api/persons/:id', (req, res) => {
  Person.findById(req.params.id).then(person => {
    res.json(person)
  })
})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  persons = persons.filter(p => p.id !== id)
  res.status(204).end()
})

const generateId = () => {
  // Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random/#Getting_a_random_integer_between_two_values
  const min = 10
  const max = 1000000
  return Math.floor(Math.random() * (max - min) + min)
}

const error = msg => {
  return {
    error: msg
  }
}

app.post('/api/persons', (req, res) => {
  const body = req.body

  if (!body.name) {
    return res.status(400).json(error('Missing name'))
  }

  if (!body.number) {
    return res.status(400).json(error('Missing number'))
  }

  if (persons.find(p => p.name === body.name)) {
    return res.status(400).json(error('Name must be unique'))
  }

  const newPerson = {
    id: generateId(),
    name: body.name,
    number: body.number
  }
  persons = persons.concat(newPerson)

  res.json(newPerson)
})

const port = process.env.PORT
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
