const mongoose = require('mongoose')

if ([3, 5].indexOf(process.argv.length) === -1) {
  console.log('Wrong number of arguments')
  process.exit(1)
}

const password = process.argv[2]
const url = `mongodb+srv://fs:${password}@cluster0.kyydu.mongodb.net/puhelinluettelo?retryWrites=true&w=majority`

mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
})

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

const addPerson = (name, number) => {
  const person = new Person({ name, number })
  return person.save().then(response => {
    console.log(`added ${name} number ${number} to phonebook`)
  })
}

const printPersons = () => {
  return Person.find({}).then(result => {
    console.log('phonebook:')
    result.forEach(person => {
      console.log(person)
    })
  })
}

const command = {
  3: printPersons,
  5: addPerson
}

command[process.argv.length](...process.argv.slice(3)).then(() => {
  mongoose.connection.close()
})
