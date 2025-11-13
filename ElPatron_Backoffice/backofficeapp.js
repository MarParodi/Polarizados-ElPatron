//librerias
const express = require("express"); //libreria para crear un server express
const path = require("path"); // libreria para gestionar rutas de carpetas y archivos
const cors = require("cors");
 // Esto habilita CORS automáticamente para que el navegador fuera de nuestro origen de aplicacion pueda enviar solicitudes http
//console.log(db)


const app = express()
app.use(cors());

app.listen(8087,(req,res)=> {

    console.log("escuchango en el puerto 8087")

})

app.get("/", (req,res) =>{
    
})


const citaRoter = require ('./routes/citaroutes')

app.use('/',citaRoter)
