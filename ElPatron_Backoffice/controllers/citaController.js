const CitaController ={};
const {Cita} = require('../db');
const { Op } = require ('sequelize');



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



// Este helper es esencial para mostrar la hora local correcta en el output
//const getLocalHourMinute = (date) => {
  //  return `${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
//};
CitaController.obtenerDisponibilidad = async (req, res, next) => {
    try {
        const fechaBuscar = req.query.fecha;

        if (!fechaBuscar) {
            return res.status(400).json({ mensaje: "Debe proporcionar el parámetro 'fecha' (YYYY-MM-DD)." });
        }

        const HORA_INICIO_TRABAJO = '09:00:00';
        const HORA_FIN_TRABAJO = '18:00:00';
        const DURACION_CITA_MINUTOS = 60;

        // Construimos fechas de trabajo (locales)
        const inicioDia = new Date(`${fechaBuscar}T${HORA_INICIO_TRABAJO}`);
        const finDia    = new Date(`${fechaBuscar}T${HORA_FIN_TRABAJO}`);

        // Rango completo del día
        const inicioDelDiaLocal = new Date(`${fechaBuscar}T00:00:00`);
        const finDelDiaLocal    = new Date(`${fechaBuscar}T23:59:59`);

        // Buscar citas del día
        const citasOcupadas = await Cita.findAll({
            where: {
                [Op.and]: [
                    { Fecha_Inicio: { [Op.lte]: finDelDiaLocal } },
                    { Fecha_Final:  { [Op.gte]: inicioDelDiaLocal } },
                    { Estado:       { [Op.in]: ['Completada', 'Pendiente'] } }
                ],
            },
            attributes: ['Fecha_Inicio', 'Fecha_Final'],
            order: [['Fecha_Inicio', 'ASC']]
        });

        // 🔥 Conversión manual de fecha MySQL → Date sin UTC
        const parseMySQLDate = (str) => {
            // str ejemplo: "2025-11-19 15:00:00"
            const [fecha, hora] = str.split(" ");
            const [y, m, d] = fecha.split("-").map(Number);
            const [hh, mm, ss] = hora.split(":").map(Number);

            return new Date(y, m - 1, d, hh, mm, ss); // LOCAL sin UTC
        };

        const estaOcupado = (inicioSlot, finSlot) => {
            return citasOcupadas.some(cita => {
                const inicioCita = parseMySQLDate(cita.Fecha_Inicio);
                const finCita    = parseMySQLDate(cita.Fecha_Final);

                return inicioSlot < finCita && finSlot > inicioCita;
            });
        };

        const getLocalHourMinute = (date) => {
            const h = String(date.getHours()).padStart(2, '0');
            const m = String(date.getMinutes()).padStart(2, '0');
            return `${h}:${m}`;
        };

        const slotsDisponibles = [];
        const horasOcupadas = [];

        let tiempoActual = new Date(inicioDia);

        // Generación de intervalos de 1 hora
        while (tiempoActual < finDia) {
            const finSlot = new Date(tiempoActual.getTime() + DURACION_CITA_MINUTOS * 60000);
            if (finSlot > finDia) break;

            const horaInicioSlot = getLocalHourMinute(tiempoActual);

            if (!estaOcupado(tiempoActual, finSlot)) {
                slotsDisponibles.push({ hora: horaInicioSlot });
            } else {
                horasOcupadas.push(horaInicioSlot);
            }

            tiempoActual = finSlot;
        }

        return res.json({
            fecha: fechaBuscar,
            slotsDisponibles,
            horasOcupadas
        });

    } catch (error) {
        console.error("Error al obtener disponibilidad:", error);
        next(error);
    }
};






CitaController.cancelarCita = async (req, res, next) => {
    try {
        const id = req.params.id;

        // Buscar la cita por ID
        const cita = await Cita.findOne({ where: { Id: id } });

        if (!cita) {
            return res.status(404).json({ mensaje: "La cita no existe." });
        }

        // No permitir cancelar si ya está cancelada
        if (cita.Estado === "Cancelada") {
            return res.status(400).json({ mensaje: "La cita ya está cancelada." });
        }

        // No permitir cancelar si ya fue completada/atendida
        if (cita.Estado === "Completada") {
            return res.status(400).json({
                mensaje: "Error al cancelar la cita. La cita ya fue atendida."
            });
        }

        // Cambiar el estado a Cancelada
        cita.Estado = "Cancelada";
        await cita.save();

        res.json({
            mensaje: "Cita cancelada exitosamente.",
            cita
        });

    } catch (error) {
        console.error(error);
        next(error);
    }
};

/*

CitaController.getCitasPorCliente = async (req, res, next) => {
    try {
        const clienteId = req.params.id;

        const citas = await Cita.findAll({
            where: {
                Id_Cliente: clienteId
            },
            order: [['Fecha_Inicio', 'DESC']]
        });

        res.json({
            clienteId,
            total: citas.length,
            citas
        });

    } catch (error) {
        console.error(error);
        next(error);
    }
};

*/

CitaController.getCitasPorCliente = async (req, res, next) => {

    try {
        const clienteId = req.user.userId;

        const citas = await Cita.findAll({
            where: {
                Id_Cliente: clienteId
            },
            order: [['Fecha_Inicio', 'DESC']]
        });

        res.json({
            clienteId,
            total: citas.length,
            citas
        });

    } catch (error) {
        console.error(error);
        next(error);
    }
};






module.exports = CitaController;
