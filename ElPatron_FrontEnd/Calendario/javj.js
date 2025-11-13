const daysTag = document.querySelector(".days"),
      currentDate = document.querySelector(".current-date"),
      prevNextIcon = document.querySelectorAll(".icons span"),
      appointmentTable = document.querySelector("#appointment-table tbody"),
      selectedDateText = document.getElementById("selected-date-text"),
      nameInput = document.getElementById("nameInput");

let date = new Date(),
    currYear = date.getFullYear(),
    currMonth = date.getMonth(),
    selectedDate = { day: date.getDate(), month: date.getMonth(), year: date.getFullYear() };

const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio",
                "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

// Simula clientes con sus IDs
const dummyUsers = {
    "Juan Pérez": 1,
    "Ana López": 2,
    "Carlos Ruiz": 3
};

// Escucha cambio en input para asignar el ID de cliente
nameInput.addEventListener("change", () => {
    const name = nameInput.value;
    selectedUserId = dummyUsers[name] || null;
});

let selectedUserId = null;

const renderCalendar = () => {
    let firstDayofMonth = new Date(currYear, currMonth, 1).getDay(),
        lastDateofMonth = new Date(currYear, currMonth + 1, 0).getDate(),
        lastDayofMonth = new Date(currYear, currMonth, lastDateofMonth).getDay(),
        lastDateofLastMonth = new Date(currYear, currMonth, 0).getDate();

    let liTag = "";

    for (let i = firstDayofMonth; i > 0; i--) {
        liTag += `<li class="inactive">${lastDateofLastMonth - i + 1}</li>`;
    }

    for (let i = 1; i <= lastDateofMonth; i++) {
        let isToday = i === selectedDate.day && currMonth === selectedDate.month && currYear === selectedDate.year ? "active" : "";
        let isDisabled = currYear < date.getFullYear() || (currYear === date.getFullYear() && currMonth < date.getMonth()) || 
                         (currYear === date.getFullYear() && currMonth === date.getMonth() && i < date.getDate()) ? "disabled" : "";

        liTag += `<li class="${isToday} ${isDisabled}" onclick="selectDate(${i}, ${currMonth}, ${currYear})">${i}</li>`;
    }

    for (let i = lastDayofMonth; i < 6; i++) {
        liTag += `<li class="inactive">${i - lastDayofMonth + 1}</li>`;
    }

    currentDate.innerText = `${months[currMonth]} ${currYear}`;
    daysTag.innerHTML = liTag;
};

window.selectDate = function(day, month, year) {
    selectedDate = { day, month, year };
    selectedDateText.innerText = `${day} de ${months[month]} de ${year}`;
    generateAppointmentSlots();
    renderCalendar();
};

prevNextIcon.forEach(icon => {
    icon.addEventListener("click", () => {
        currMonth = icon.id === "prev" ? currMonth - 1 : currMonth + 1;

        if (currMonth < 0 || currMonth > 11) {
            date = new Date(currYear, currMonth, new Date().getDate());
            currYear = date.getFullYear();
            currMonth = date.getMonth();
        } else {
            date = new Date();
        }

        renderCalendar();
    });
});

function generateAppointmentSlots() {
    const times = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00"];
    appointmentTable.innerHTML = "";

    times.forEach(time => {
        const tr = document.createElement("tr");

        const tdTime = document.createElement("td");
        tdTime.textContent = time;
        tdTime.className = "p-2 border";

        const tdButton = document.createElement("td");
        tdButton.className = "p-2 border";

        const button = document.createElement("button");
        button.textContent = "Reservar";
        button.dataset.time = time;
        button.className = "bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600";
        button.onclick = (e) => selectTime(time, e);

        tdButton.appendChild(button);
        tr.appendChild(tdTime);
        tr.appendChild(tdButton);

        appointmentTable.appendChild(tr);
    });
}

function selectTime(time, event) {
    document.querySelectorAll(".appointment-container button").forEach(btn => btn.classList.remove("selected"));
    event.target.classList.add("selected");
    event.target.dataset.time = time;
}

function bookAppointment() {

    const selectedButton = document.querySelector(".appointment-container button.selected");
    if (!selectedButton) {
        alert("Por favor, selecciona un horario.");
        return;
    }

    const horaInicio = selectedButton.dataset.time;
    const horaFin = parseInt(horaInicio.split(":")[0]) + 1;

    const fecha = `${selectedDate.year}-${String(selectedDate.month + 1).padStart(2, "0")}-${String(selectedDate.day).padStart(2, "0")}`;
    
    const nombre = document.getElementById("nameInput").value
    const apellido1 = document.getElementById("Apellido1Input").value
    const apellido2 = document.getElementById("Apellido2Input").value
    const email = document.getElementById("emailInput").value
    const telefono = document.getElementById("phoneInput").value
    
    
    const UsersData = {
        Nombre: nombre,
        Apellido1: apellido1,
        Apellido2: apellido2,
        Email: email,
        telefono: telefono
    };

    fetch('http://localhost:8087/Users', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(UsersData)
    })
    .then(response => response.json())
    .then(data => {
        //alert("Cita agendada correctamente.");
        //console.log(data);

        const Id_Cliente = data.Id
        console.log(Id_Cliente)

        const appointmentData = {
        Id_Cliente: Id_Cliente,
        StartDate: `${fecha} ${horaInicio}:00`,
        EndDate: `${fecha} ${horaFin.toString().padStart(2, "0")}:00`,
        Estado: "Pendiente"
    };

    fetch('http://localhost:8087/Cita', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointmentData)
    })
    .then(response => response.json())
    .then(data => {
        alert("Cita agendada correctamente.");
        console.log(data);
    })
    .catch(error => {
        alert("Error al agendar la cita.");
        console.error(error);
    });



    })
    .catch(error => {
        alert("Error al guardar el user.");
        console.error(error);
    });
}

renderCalendar();







