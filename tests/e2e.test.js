require("dotenv").config();
const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../src/server");
const http = require("http");



let server;
const dbURL = process.env.DATABASE_URL;

// Utility function to log steps
function logStep(stepNumber, description) {
    console.log(`Step ${stepNumber}: ${description}`);
}

beforeAll(() => {
    server = http.createServer(app);
    server.listen();
});

beforeEach(async () => {
    if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(dbURL);
    }
    if (mongoose.connection.db) {
        await mongoose.connection.db.dropDatabase(); // Clean database
    } else {
        throw new Error("Database connection not initialized. Ensure the database URL is correct.");
    }
});

describe("E2E Test for College Appointment System", () => {
    let studentA1, studentA2, professorP1, appointmentA1, appointmentA2;

    // Test data
    const studentDataA1 = { name: "Student A1", email: "a1@example.com", password: "password123", role: "Student" };
    const studentDataA2 = { name: "Student A2", email: "a2@example.com", password: "password123", role: "Student" };
    const professorDataP1 = { name: "Professor P1", email: "p1@example.com", password: "password123", role: "Professor" };

    it("should complete the entire flow as per requirements", async () => {
        // 1. Register and authenticate Student A1
        logStep(1, "Student A1 authenticates to access the system.");
        await request(app).post("/register").send(studentDataA1);
        const loginA1 = await request(app).post("/login").send({ email: studentDataA1.email, password: studentDataA1.password });
        studentA1 = loginA1.body[0];

        // 2. Register and authenticate Professor P1
        logStep(2, "Professor P1 authenticates to access the system.");
        await request(app).post("/register").send(professorDataP1);
        const loginP1 = await request(app).post("/login").send({ email: professorDataP1.email, password: professorDataP1.password });
        professorP1 = loginP1.body[0];

        // 3. Professor P1 specifies availability
        logStep(3, "Professor P1 specifies which time slots he is free for appointments.");
        const availability = {
            professor_id: professorP1._id,
            date: "2024-12-22",
            time_slot: ["10:00 AM", "11:00 AM"]
        };
        await request(app).post("/add-avail").send(availability);

        // 4. Student A1 views available slots for Professor P1
        logStep(4, "Student A1 views available time slots for Professor P1.");
        const availableSlots = await request(app).get("/avail");
        expect(availableSlots.body).toBeInstanceOf(Array);
        expect(availableSlots.body[0].professor_id).toBe(professorP1._id);

        // 5. Student A1 books an appointment
        logStep(5, "Student A1 books an appointment with Professor P1.");
        const bookingA1 = {
            student_id: studentA1._id,
            professor_id: professorP1._id,
            date: "2024-12-22",
            time_slot: "10:00 AM",
            status: "Booked"
        };
        const responseA1 = await request(app).post("/book-appoint").send(bookingA1);
        appointmentA1 = responseA1.body;

        // 6. Register and authenticate Student A2
        logStep(6, "Student A2 authenticates to access the system.");
        await request(app).post("/register").send(studentDataA2);
        const loginA2 = await request(app).post("/login").send({ email: studentDataA2.email, password: studentDataA2.password });
        studentA2 = loginA2.body[0];

        // 7. Student A2 books another appointment
        logStep(7, "Student A2 books an appointment with Professor P1.");
        const bookingA2 = {
            student_id: studentA2._id,
            professor_id: professorP1._id,
            date: "2024-12-22",
            time_slot: "11:00 AM",
            status: "Booked"
        };
        const responseA2 = await request(app).post("/book-appoint").send(bookingA2);
        appointmentA2 = responseA2.body;

        // 8. Professor P1 cancels appointment with Student A1
        logStep(8, "Professor P1 cancels the appointment with Student A1.");
        await request(app).put("/update-appoint").send({
            student_id: studentA1._id,
            professor_id: professorP1._id,
            status: "Cancelled"
        });

        // 9. Student A1 checks their appointments
        logStep(9, "Student A1 checks their appointments.");
        const viewAppointmentsA1 = await request(app).post("/view-appoint").send({ student_id: studentA1._id });
        expect(viewAppointmentsA1.body.length).toBe(0); // No pending appointments
    });
});

afterAll(async () => {
    await mongoose.connection.close(); // Close DB connection
    server.close(); // Close server
});
