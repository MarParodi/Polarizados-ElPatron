const CitaController ={};
const {Cita} = require('../db');


function findOne(id) {

    return Cita.findOne({
        where: {
            id: id
        }
    });
}




CitaController.crearCita = (req, res, next) => {

    res.header("Access-Control-Allow-Origin", "*"); // Permite cualquier origen, puedes cambiar "" por la URL específica
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

    const Id = req.body.Id_Cliente
    const StartDate = req.body.StartDate
    const EndDate = req.body.EndDate
    const Status = req.body.Estado

    console.log(Id)
    console.log(StartDate)
    console.log(EndDate)
    console.log(Status)

    console.log(req.body.id)
    Cita.create({Id_Cliente: Id,Fecha_Inicio: StartDate, Fecha_Final: EndDate,Estado: Status}).then( u =>res.json(u))
        .catch(next);
};



CitaController.get = (req, res, next) => {

    Cita.findAll().then(Citas => {
        res.json(Citas)
    }).catch(next);
};


CitaController.editDate = (req, res, next) => {
    const newService = req.body;
    const id = newService? newService.id : undefined;
    findOne(id).then(user => {
        if (user) {
            Object.assign(user, newService);
            user.save().then(user => res.json(user)).catch(next);
        }else {
            res.status(404).send();
        }
    }).catch(next);
};


module.exports = CitaController;
