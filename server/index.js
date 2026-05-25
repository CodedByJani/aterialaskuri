const path = require('path')
const dotenv = require('dotenv')

// Lataa .env:in aina ensin ja lataa oikean riippuen ympäristöstä
if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: path.resolve(__dirname, '.env.test')})
} else {
  dotenv.config()
}
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

const authRoutes = require('./routes/auth')
const statsRoutes = require('./routes/stats')

const app = express()
app.use(cors())
app.use(express.json())
// ympäristöyksilöllinen URI valinta
const url = 
  process.env.NODE_ENV === 'test' 
    ? process.env.MONGODB_URI_TEST 
    : process.env.MONGODB_URI
// Muutin connectionista funktion että se ei yhdistä liian aikaisin testattaessa 
const connectDB = async () => {
  try {
    await mongoose.connect(url)
    console.log('Connected to MongoDB')
    console.log('DB name:', mongoose.connection.db.databaseName)
  } catch (err) {
    console.error('Connection error', err)
  }
}
// hakee connection funktion silloin kun ympäristö ei ole test
if (process.env.NODE_ENV !== 'test') {
  connectDB()
}

app.use('/api/auth', authRoutes)
app.use('/api/stats', statsRoutes)

const PORT = process.env.PORT || 3001
// Ettei serveri käynnisty testatessa
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
  })
  
}
module.exports = app