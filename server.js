const app = require('./app')
const dotenv = require("dotenv");
// const connectDatabase = require("./database")



const PORT = process.env.PORT || 4001
// connectDatabase()


const server = app.listen(PORT, () => {
    console.log(`Server is working on http://127.0.0.1:${PORT}`)

})