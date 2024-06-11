//set up the server
const express = require("express");
const db = require("./db/db_connection");
const app = express();
const port = 3000;

// define middleware that serves static resources in the public directory
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/Script"));

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

//configures express to parse URL POST request bodies
app.use(express.urlencoded({extended: false}));

const get_all_exercise_items = `
    SELECT log_id, DATE_FORMAT(day, "%m-%d-%Y") as day, hours, exercise_log.exercise_id, exercises.exercise
    FROM exercise_log
    JOIN exercises
       ON exercise_log.exercise_id = exercises.exercise_id
`;

app.get("/", (req, res) => {
    db.execute(get_all_exercise_items, (error, results) => {
        if (error) {
            res.status(500).send(error); // Internal Server Error
        } else {
            // res.send(results);
            res.render("mainpage", { exerciselist: results});
        }
    });
});


const get_hours_sum = `
    select sum(hours) from exercise_log;
`;

app.get("/", (req, res) => {
    db.execute(get_hours_sum, (error, results) => {
        if (error) {
            res.status(500).send(error); // Internal Server Error
        } else {
            // res.send(results);
            res.render("exercise", { name: "Steffia"});
        }
    });
});

const get_exercise_details = `
    SELECT log_id, DATE_FORMAT(day, "%m-%d-%Y") as day, hours, exercise_log.exercise_id
    FROM exercise_log
    JOIN exercises
       ON exercise_log.exercise_id = exercises.exercise_id
    WHERE log_id = ?
`;

app.get("/exercise", (req, res) => {
    db.execute(get_all_exercise_items, (error, results) => {
        if (error) {
            res.status(500).send(error); // Internal Server Error
        } else {
            // res.send(results);
            res.render("exercise",{exerciselist:results});
        }
    });
});

app.get("/sleepcounter", (req, res) => {
    res.render("sleepcounter")
});

app.get("/mainpage", (req, res) => {
    res.render("mainpage");
});

app.get("/caloriechecker", (req, res) => {
    res.render("caloriechecker");
});



const create_log = `
    INSERT INTO exercise_log (day,hours, exercise_id)
    VALUES (CURDATE(), ?, ?)
`;

app.post("/exercise", (req, res) => {
    db.execute(create_log, [req.body.hours, req.body.exercise], (error, results) => {
        if(error){
            res.status(500).send(error);
        }
        else {
            res.redirect("/exercise");
        }
    });
});

const delete_exercise = `
    DELETE FROM exercise_log
    WHERE log_id = ?
`

app.get("/exercise/:id/delete", (req, res)=>{
    db.execute(delete_exercise, [req.params.id], (error, results)=>{
        if (error){
            res.status(500).send(error);
        }
        else{
            res.redirect("/exercise");
        }
    })
})



// start the server
app.listen(port, () => {
    console.log(
        `App server listening on ${port}. (Go to http://localhost:${port})`
    );
});