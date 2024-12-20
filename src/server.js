require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());


const connectDB = require("./config/db");
const userSchema = require("./models/users");
const appointmentSchema = require("./models/appoinment");
const availabilitySchema = require("./models/availabilities");

const PORT = process.env.PORT || 5000;
const TEST = process.env.NODE_ENV || "no-test";



if(TEST==="no-test"){
  connectDB();
}


//View Users
app.get("/users", async (req, res) => {
  try {
    await userSchema.find()
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        res.json(err);
      })
  } catch (err) {
    console.log(err);
  }
})
//Users Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    await userSchema.find({ email: email })
      .then((data) => {
        if (data[0].password === password) {
          res.json(data);
        } else {
          res.json("Use Same Password");
        }
      })
      .catch((err) => {
        res.json(err);
      })
  } catch (err) {
    console.log(err);
  }
})
//Users Register
app.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  const data = {
    name: name,
    email: email,
    password: password,
    role: role
  }

  try {
    const response = await userSchema.find({ email: email });
    if (response.length > 0) {
      res.json("User Already Exist");
    } else {
      await userSchema.insertMany([data])
        .then((data) => {
          res.json(data);
        })
        .catch((err) => {
          res.json(err);
        })
    }
  } catch (err) {
    console.log(err);
  }
})


// View Available Time
app.get("/avail", async (req, res) => {
  try {
    await availabilitySchema.find()
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        res.json(err);
      })
  } catch (err) {
    console.log(err);
  }
})
// Add Available Time
app.post("/add-avail", async (req, res) => {
  const { professor_id, date, time_slot } = req.body;
  const data = {
    professor_id: professor_id,
    date: date,
    time_slot: time_slot
  }
  try {
    await availabilitySchema.insertMany([data])
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        res.json(err);
      })
  } catch (err) {
    console.log(err);
  }
})


// View Appointment
app.get("/appoint", async (req, res) => {
  try {
    await appointmentSchema.find()
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        res.json(err);
      })
  } catch (err) {
    console.log(err);
  }
})
// view Specific Appointment 
app.post("/view-appoint", async (req, res) => {
  const { student_id } = req.body;
  try {
    const appointments = await appointmentSchema.find({
      student_id: student_id,
      status: { $ne: "Cancelled" }, // Exclude canceled appointments
    });
    res.json(appointments);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error fetching appointments" });
  }
});

//Book Appointment
app.post("/book-appoint", async (req, res) => {
  const {
    student_id,
    professor_id,
    date,
    time_slot,
    status
  } = req.body;

  const data = {
    student_id: student_id,
    professor_id: professor_id,
    date: date,
    time_slot: time_slot,
    status: status,
  }

  try {
    await appointmentSchema.insertMany([data])
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        res.json(err);
      })
  } catch (err) {
    console.log(err);
  }
})
//Update Appointment
app.put("/update-appoint", async (req, res) => {
  const { student_id, professor_id, status } = req.body;
  try {
    const updatedAppointment = await appointmentSchema.findOneAndUpdate(
      { professor_id: professor_id, student_id: student_id },
      { status: status },
      { new: true }
    );
    res.json(updatedAppointment);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error updating appointment" });
  }
});



app.listen(PORT, () => {
  
  if(TEST==="no-test"){
    console.log(`Server running on http://localhost:${PORT}`);
  }
});

module.exports = app;