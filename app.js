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
            res.render("mainpage");
        }
    });
    
});


app.get("/exercise", (req, res) => {
    db.execute(get_all_exercise_items, (error, results) => {
        if (error) {
            res.status(500).send(error); // Internal Server Error
        } else {
            res.render("exercise",{exerciselist:results});
        }
    });
});
const get_hours_sum = `
    select sum(hours) as total_hours from exercise_log;
`;

const get_calorie_count = `
    select sum(calories * hours) as total_calories from exercise_log
	join exercises
		on exercise_log.exercise_id = exercises.exercise_id;

`

const get_avg_hours_slept= `
    select age_range, format(avg(hours), 2) as average_sleep, age_hours_min, age_hours_max,
    CASE when 
	    avg(hours) >= age_hours_min and avg(hours) <= age_hours_max then 'are sleeping a healthy amount of hours!'
        when avg(hours) < age_hours_min then 'should sleep more!'
        else 'should sleep less!'
    end as recommendation
    from sleep_log
    join sleep_age_range
	    on sleep_log.age_range_id = sleep_age_range.age_range_id
;
;
` 

app.get("/statistics", (req, res) => {
        db.execute(get_hours_sum, (error, sumResults) => {
            if (error) {
                res.status(500).send(error); // Internal Server Error
            } else {
                db.execute(get_calorie_count, (error, calorieResults) => {
                    if (error) {
                        res.status(500).send(error); // Internal Server Error
                    } else {
                        db.execute(get_avg_hours_slept, (error, sleepResults) => {
                            if (error) {
                                res.status(500).send(error); // Internal Server Error
                            } else {
                                const sum = sumResults[0]['total_hours'] || 0.00;
                                res.render("statistics",{sum:sum, calorie_count: calorieResults[0]['total_calories'] || 0, hours_slept: sleepResults[0]['average_sleep'] || 0, min_age: sleepResults[0]['age_hours_min'] || 0, max_age: sleepResults[0]['age_hours_max'] || 0, age_range: sleepResults[0]['age_range'] || 0, recommendation: sleepResults[0]['recommendation']});
                                }
                            });
                        }
                    });
                }
            });
        }
);


const get_all_sleep_items = `
    SELECT sleep_id, DATE_FORMAT(date, "%m-%d-%Y") as date, hours, sleep_log.age_range_id
    FROM sleep_log
    JOIN sleep_age_range
       ON sleep_log.age_range_id = sleep_age_range.age_range_id
`;

app.get("/sleepcounter", (req, res) => {
    db.execute(get_all_sleep_items, (error, results) => {
        if (error) {
            res.status(500).send(error); // Internal Server Error
        } else {
            // res.send(results);
            res.render("sleepcounter",{sleeplist:results});
        }
    });
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

const create_sleep_log = `
    INSERT INTO sleep_log (date,hours, age_range_id)
    VALUES (CURDATE(), ?, ?)
`;

app.post("/sleepcounter", (req, res) => {
    db.execute(create_sleep_log, [req.body.hours, req.body.age], (error, results) => {
        if(error){
            res.status(500).send(error);
        }
        else {
            res.redirect("/sleepcounter");
        }
    });
});


const delete_sleep = `
    DELETE FROM sleep_log
    WHERE sleep_id = ?
`

app.get("/sleepcounter/:id/delete", (req, res)=>{
    db.execute(delete_sleep, [req.params.id], (error, results)=>{
        if (error){
            res.status(500).send(error);
        }
        else{
            res.redirect("/sleepcounter");
        }
    })
})


// start the server
app.listen(port, () => {
    console.log(
        `App server listening on ${port}. (Go to http://localhost:${port})`
    );
});