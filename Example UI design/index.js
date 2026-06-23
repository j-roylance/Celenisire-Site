// server.js
// Load environment variables from .env file into memory
// Allows you to use process.env
require('dotenv').config();
// importing the packages
const express = require("express");
const path = require("path");
const knex = require('knex');
const app = express();

// Needed for the session variable - Stored on the server to hold data
const session = require("express-session");

// process.env.PORT is when you deploy and 3000 is for test
const port = process.env.PORT || 3000;

// 1️⃣ Set EJS as the templating engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// 2️⃣ Middleware to serve static files with proper cache control
app.use(express.static(path.join(__dirname, "public"), {
    maxAge: '1h', // Cache for 1 hour in production
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
        // For HTML files, don't cache
        if (path.endsWith('.html') || path.endsWith('.ejs')) {
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
        }
        // For CSS and JS, cache but allow revalidation
        else if (path.endsWith('.css') || path.endsWith('.js')) {
            res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate');
        }
        // For images, cache longer
        else if (path.match(/\.(jpg|jpeg|png|gif|svg|ico)$/)) {
            res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day
        }
    }
}));


// 3️⃣ Middleware to parse form data (for login later)
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // For JSON request bodies

app.use( //this is the session we use
    session(
        {
    secret: process.env.SESSION_SECRET || 'fallback-secret-key',
    resave: false,
    saveUninitialized: false,
        }
    )
);

// Middleware to prevent caching of API responses
app.use('/api', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});

// Middleware to normalize user object for views - ensures consistent structure
app.use((req, res, next) => {
    // Normalize the user object to ensure isLoggedIn is always explicitly set
    if (req.session) {
        // Create a normalized user object
        req.normalizedUser = {
            isLoggedIn: !!(req.session.isLoggedIn === true),
            username: req.session.username || null,
            level: req.session.level || null
        };
    } else {
        // If no session, create an empty user object
        req.normalizedUser = {
            isLoggedIn: false,
            username: null,
            level: null
        };
    }
    next();
});

// Global authentication + role-check middleware - runs on EVERY request
app.use((req, res, next) => {
  // Whitelist public routes
  const publicRoutes = ['/', '/login', '/register', '/visitorDonation', '/checkParticipantEmail', '/submitVisitorDonation', '/logout'];
  if (publicRoutes.includes(req.path)) {
    return next();
  }

  // If not logged in, render login page
  if (!req.session || !req.session.isLoggedIn) {
    return res.render("login", { error_message: "Please log in to access this page", user: req.normalizedUser });
  }

  // Role-based access control based on path prefix:
  // - Paths starting with '/m' are manager pages and require level 'M'
  // - Paths starting with '/u' are user pages and managers ('M') should not access them
  const p = (req.path || '').toLowerCase();
  const userLevel = req.session.level;

  if (p.startsWith('/m') && userLevel !== 'M') {
    return res.redirect('/');
  }

  if (p.startsWith('/u') && userLevel === 'M') {
    return res.redirect('/');
  }

  // All checks passed
  return next();
});

// Global error handler middleware - must be last
app.use((err, req, res, next) => {
  console.error("Express Error Handler:", err);
  console.error("Stack:", err.stack);
  res.status(500).send("Internal Server Error - Check console for details");
});

const useSsl = true;

const userDatabase = require("knex")({
  client: "pg",
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
    ...(useSsl
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        }
      : {}),
  },
  pool: { min: 0, max: 5 },
  acquireConnectionTimeout: 60000,
});

// ---------------------------
// EB DEBUG LOGGING
// ---------------------------
console.log("🔧 EB ENV CHECK:");
console.log("DB_HOST =", process.env.DB_HOST);
console.log("DB_USER =", process.env.DB_USER);
console.log("DB_NAME =", process.env.DB_NAME);
console.log("DB_PORT =", process.env.DB_PORT);
console.log("NODE_ENV =", process.env.NODE_ENV);
console.log("AWS_EXECUTION_ENV =", process.env.AWS_EXECUTION_ENV);
console.log("useSsl =", useSsl);

userDatabase
  .raw("SELECT NOW()")
  .then((result) =>
    console.log("✓ Connected to Postgres, time is:", result.rows[0].now)
  )
  .catch((err) => {
    console.error("✗ Could NOT connect to Postgres");
    console.error("Error code:", err.code);
    console.error("Full error:", err);
  });





















// // // // // //
// 4️⃣ ROUTES// //
// // // // // //





// -- Universally Accessible Routes //
//----------------------------------//

// landing routes
app.get("/", (req, res) => {
  res.render("landing", {user: req.normalizedUser});
});

// login routes
app.get("/login", (req, res) => {
  res.render("login", {
    error_message: "",
    user: req.normalizedUser
  });
});
app.post("/login", (req, res) => { //YAY it gets the form jawn when it calls "/login", and req is the client data and res is the server data
    let sName = req.body.username;
    let sPassword = req.body.password;
    // This is a sql query!!!!!!! It checks if our username and password match the database
    // we could do a normal sql statement using knex.raw("[sql jawn]") but using objects protects it from sql injection
    userDatabase.select("username", "password", "level")
    .from('users')
    .where("username", sName)
    .andWhere("password", sPassword) //gets the data jawn
    .then(users => {
        if (users.length > 0) {
            const user = users[0];

            req.session.isLoggedIn = true;
            req.session.username = user.username;
            req.session.level = user.level;

            // Save session before redirect to ensure it's persisted
            req.session.save((err) => {
                if (err) {
                    console.error("Session save error:", err);
                    return res.render("login", { error_message: "Login failed. Please try again.", user: req.normalizedUser });
                }
                res.redirect("/");
            });
        } else {
            res.render("login", { error_message: "Invalid login", user: req.normalizedUser });
        }
    })
    .catch(err => { //if we get an error, do this instead
      console.error("Login error:", err);
      res.render("login", { error_message: "Please log in to access this page", user: req.normalizedUser });
    });
});

app.get("/visitorDonation", (req, res) => {
  res.render("visitorDonation", {user: req.normalizedUser});
});

// Check if email exists in participant table and return participant data
app.post("/checkParticipantEmail", (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.json({ found: false, message: "Email is required" });
  }
  
  userDatabase('participantinfo')
    .where('participantemail', email)
    .first()
    .then(participant => {
      if (participant) {
        res.json({ 
          found: true, 
          participant: {
            participantid: participant.participantid,
            participantfirstname: participant.participantfirstname,
            participantlastname: participant.participantlastname,
            participantphone: participant.participantphone,
            participantcity: participant.participantcity,
            participantstate: participant.participantstate,
            participantzip: participant.participantzip,
            participantemail: participant.participantemail
          }
        });
      } else {
        res.json({ found: false, message: "Email not found. Please fill out your information." });
      }
    })
    .catch(err => {
      console.error("Error checking participant email:", err);
      res.json({ found: false, message: "Error checking email. Please try again." });
    });
});

// Handle visitor donation submission
app.post("/submitVisitorDonation", (req, res) => {
  const { 
    email, firstName, lastName, phone, city, state, zip,
    customAmount
  } = req.body;
  
  // Validate required fields
  if (!email || !firstName || !lastName || !customAmount) {
    return res.json({ 
      success: false, 
      message: "Please fill out all required fields (Email, First Name, Last Name, and Donation Amount)." 
    });
  }
  
  // Validate donation amount is a positive number
  const donationAmount = parseFloat(customAmount);
  if (isNaN(donationAmount) || donationAmount <= 0) {
    return res.json({ 
      success: false, 
      message: "Please enter a valid donation amount." 
    });
  }
  
  // Check if participant exists by email
  userDatabase('participantinfo')
    .where('participantemail', email)
    .first()
    .then(existingParticipant => {
      let participantId;
      
      if (existingParticipant) {
        // Participant exists - use existing participantid
        participantId = existingParticipant.participantid;
        
        // Insert donation with existing participantid, current datetime, and donation amount
        return userDatabase('donationinfo')
          .insert({
            participantid: participantId,
            donationamount: donationAmount,
            donationtime: new Date()
          })
          .then(() => {
            res.json({ 
              success: true, 
              message: "Thank you for your generous donation! Your donation has been processed successfully." 
            });
          })
          .catch(insertErr => {
            // Handle sequence sync issue
            if (insertErr.code === '23505' && insertErr.constraint === 'donationinfo_pkey') {
              // Fix the sequence and retry
              return userDatabase.raw("SELECT setval('donationinfo_donationid_seq', (SELECT MAX(donationid) FROM donationinfo))")
                .then(() => {
                  // Retry the insert
                  return userDatabase('donationinfo')
                    .insert({
                      participantid: participantId,
                      donationamount: donationAmount,
                      donationtime: new Date()
                    })
                    .then(() => {
                      res.json({ 
                        success: true, 
                        message: "Thank you for your generous donation! Your donation has been processed successfully." 
                      });
                    });
                })
                .catch(retryErr => {
                  console.error("Error retrying donation insert:", retryErr);
                  throw retryErr;
                });
            }
            throw insertErr;
          });
      } else {
        // Participant doesn't exist - create new participant first
        // Validate required fields for new participant
        if (!phone || !city || !state || !zip) {
          return res.json({ 
            success: false, 
            message: "Please fill out all required participant information (Phone, City, State, ZIP Code) to complete your donation." 
          });
        }
        
        // Create new participant and get the new participantid
        return userDatabase('participantinfo')
          .insert({
            participantemail: email,
            participantfirstname: firstName,
            participantlastname: lastName,
            participantphone: phone,
            participantcity: city,
            participantstate: state,
            participantzip: zip,
            participantrole: 'Donor', // Default role for donors
            participantdob: null,
            participantschooloremployer: null,
            participantfieldofinterest: null
          })
          .then(() => {
            // Query for the newly created participant to get the ID
            return userDatabase('participantinfo')
              .where('participantemail', email)
              .first()
              .then(newParticipant => {
                if (!newParticipant) {
                  throw new Error('Failed to retrieve newly created participant');
                }
                
                participantId = newParticipant.participantid;
                
                // Insert donation with new participantid, current datetime, and donation amount
                return userDatabase('donationinfo')
                  .insert({
                    participantid: participantId,
                    donationamount: donationAmount,
                    donationtime: new Date()
                  })
                  .then(() => {
                    res.json({ 
                      success: true, 
                      message: "Thank you for your generous donation! Your donation has been processed successfully and your information has been added to our system." 
                    });
                  })
                  .catch(insertErr => {
                    // Handle sequence sync issue
                    if (insertErr.code === '23505' && insertErr.constraint === 'donationinfo_pkey') {
                      // Fix the sequence and retry
                      return userDatabase.raw("SELECT setval('donationinfo_donationid_seq', (SELECT MAX(donationid) FROM donationinfo))")
                        .then(() => {
                          // Retry the insert
                          return userDatabase('donationinfo')
                            .insert({
                              participantid: participantId,
                              donationamount: donationAmount,
                              donationtime: new Date()
                            })
                            .then(() => {
                              res.json({ 
                                success: true, 
                                message: "Thank you for your generous donation! Your donation has been processed successfully and your information has been added to our system." 
                              });
                            });
                        })
                        .catch(retryErr => {
                          console.error("Error retrying donation insert:", retryErr);
                          throw retryErr;
                        });
                    }
                    throw insertErr;
                  });
              });
          })
          .catch(insertErr => {
            // Handle sequence sync issue for participantinfo
            if (insertErr.code === '23505' && insertErr.constraint === 'participantinfo_pkey') {
              // Fix the sequence and retry participant insertion
              return userDatabase.raw("SELECT setval('participantinfo_participantid_seq', (SELECT MAX(participantid) FROM participantinfo))")
                .then(() => {
                  // Retry the participant insert
                  return userDatabase('participantinfo')
                    .insert({
                      participantemail: email,
                      participantfirstname: firstName,
                      participantlastname: lastName,
                      participantphone: phone,
                      participantcity: city,
                      participantstate: state,
                      participantzip: zip,
                      participantrole: 'Donor',
                      participantdob: null,
                      participantschooloremployer: null,
                      participantfieldofinterest: null
                    })
                    .then(() => {
                      // Query for the newly created participant to get the ID
                      return userDatabase('participantinfo')
                        .where('participantemail', email)
                        .first()
                        .then(newParticipant => {
                          if (!newParticipant) {
                            throw new Error('Failed to retrieve newly created participant');
                          }
                          
                          participantId = newParticipant.participantid;
                          
                          // Insert donation
                          return userDatabase('donationinfo')
                            .insert({
                              participantid: participantId,
                              donationamount: donationAmount,
                              donationtime: new Date()
                            })
                            .then(() => {
                              res.json({ 
                                success: true, 
                                message: "Thank you for your generous donation! Your donation has been processed successfully and your information has been added to our system." 
                              });
                            })
                            .catch(donationErr => {
                              // Handle donation sequence sync issue
                              if (donationErr.code === '23505' && donationErr.constraint === 'donationinfo_pkey') {
                                return userDatabase.raw("SELECT setval('donationinfo_donationid_seq', (SELECT MAX(donationid) FROM donationinfo))")
                                  .then(() => {
                                    return userDatabase('donationinfo')
                                      .insert({
                                        participantid: participantId,
                                        donationamount: donationAmount,
                                        donationtime: new Date()
                                      })
                                      .then(() => {
                                        res.json({ 
                                          success: true, 
                                          message: "Thank you for your generous donation! Your donation has been processed successfully and your information has been added to our system." 
                                        });
                                      });
                                  });
                              }
                              throw donationErr;
                            });
                        });
                    });
                })
                .catch(retryErr => {
                  console.error("Error retrying participant insert:", retryErr);
                  throw retryErr;
                });
            }
            throw insertErr;
          });
      }
    })
    .catch(err => {
      console.error("Error processing donation:", err);
      console.error("Error details:", err.message);
      res.json({ 
        success: false, 
        message: "An error occurred while processing your donation. Please try again." 
      });
    });
});



// -- Manager Accessible Routes //
//------------------------------//

// mDonation routes
app.get("/mDonation", (req, res) => {
  userDatabase('donationinfo')
    .join('participantinfo', 'donationinfo.participantid', '=', 'participantinfo.participantid')
    .select(
      'donationinfo.donationid',
      'donationinfo.donationtime',
      'donationinfo.donationamount',
      'donationinfo.participantid',
      'participantinfo.participantfirstname',
      'participantinfo.participantlastname',
      'participantinfo.participantemail'
    )
    .whereNotNull('donationinfo.donationamount')
    .orderBy('donationinfo.donationtime', 'asc')
    .then(allDonations => {
      // Shuffle and get 20 random donations
      const shuffled = allDonations.sort(() => 0.5 - Math.random());
      const donations = shuffled.slice(0, 20);
      res.render("manager/mDonation", { user: req.normalizedUser, donations: donations, allDonations: allDonations });
    })
    .catch(err => {
      console.error("Error fetching donations:", err);
      res.render("manager/mDonation", { user: req.normalizedUser, donations: [], allDonations: [] });
    });
});

// Save donation (add or edit)
app.post("/mDonation/save", (req, res) => {
  const { id, participantid, donationamount, donationtime, mode } = req.body;
  
  // Prepare donation data
  const donationData = {
    participantid: parseInt(participantid),
    donationamount: parseFloat(donationamount),
    donationtime: donationtime || new Date()
  };
  
  if (mode === 'edit' && id) {
    // Update existing donation
    userDatabase('donationinfo')
      .where('donationid', id)
      .update(donationData)
      .then(() => {
        res.redirect('/mDonation');
      })
      .catch(err => {
        console.error("Error updating donation:", err);
        res.redirect('/mDonation');
      });
  } else {
    // Insert new donation
    userDatabase('donationinfo')
      .insert(donationData)
      .then(() => {
        res.redirect('/mDonation');
      })
      .catch(err => {
        console.error("Error adding donation:", err);
        res.redirect('/mDonation');
      });
  }
});

// Delete donation
app.post("/mDonation/delete/:donationid", (req, res) => {
  userDatabase('donationinfo')
    .where('donationid', req.params.donationid)
    .del()
    .then(() => {
      res.redirect('/mDonation');
    })
    .catch(err => {
      console.error("Error deleting donation:", err);
      res.redirect('/mDonation');
    });
});


// Search donations
app.post("/searchDonation", (req, res) => {
  const { search } = req.body;
  
  userDatabase('donationinfo')
    .join('participantinfo', 'donationinfo.participantid', '=', 'participantinfo.participantid')
    .select(
      'donationinfo.donationid',
      'donationinfo.donationtime',
      'donationinfo.donationamount',
      'donationinfo.participantid',
      'participantinfo.participantfirstname',
      'participantinfo.participantlastname',
      'participantinfo.participantemail'
    )
    .whereNotNull('donationinfo.donationamount')
    .andWhere(function() {
      this.where('participantinfo.participantfirstname', 'ilike', `%${search}%`)
          .orWhere('participantinfo.participantlastname', 'ilike', `%${search}%`)
          .orWhere('participantinfo.participantemail', 'ilike', `%${search}%`)
          .orWhereRaw('CAST(donationinfo.donationamount AS TEXT) ILIKE ?', [`%${search}%`]);
    })
    .orderBy('donationinfo.donationtime', 'asc')
    .then(donations => {
      if (req.session.level === 'M') {
      res.render("manager/mDonation", {user: req.normalizedUser, donations: donations});
      } else {
      res.render("user/uDonation", {user: req.normalizedUser, donations: donations});
      }
    })
    .catch(err => {
      console.error("Error searching donations:", err);
      if (req.session.level === 'M') {
      res.render("manager/mDonation", {user: req.normalizedUser, donations: []});
      } else {
      res.render("user/uDonation", {user: req.normalizedUser, donations: []});
      };
    });
});








// mEvent routes - EventOccurrenceInfo joined with EventTypeInfo
app.get("/mEvent", (req, res) => {
  userDatabase('eventoccurrenceinfo')
    .join('eventtypeinfo', 'eventoccurrenceinfo.eventtypeid', '=', 'eventtypeinfo.eventtypeid')
    .select(
      'eventoccurrenceinfo.eventoccurrenceid',
      'eventoccurrenceinfo.eventtypeid',
      'eventoccurrenceinfo.eventname',
      'eventoccurrenceinfo.eventdatetimestart',
      'eventoccurrenceinfo.eventdatetimeend',
      'eventoccurrenceinfo.eventlocation',
      'eventoccurrenceinfo.eventcapacity',
      'eventoccurrenceinfo.eventregistrationdeadline',
      'eventtypeinfo.eventtype',
      'eventtypeinfo.eventdescription',
      'eventtypeinfo.eventrecurrencepattern',
      'eventtypeinfo.eventdefaultcapacity'
    )
    .whereNotNull('eventoccurrenceinfo.eventoccurrenceid')
    .orderBy('eventoccurrenceinfo.eventname', 'asc')
    .then(allEvents => {
      // Shuffle and get 20 random events
      const shuffled = allEvents.sort(() => 0.5 - Math.random());
      const events = shuffled.slice(0, 20);
      res.render("manager/mEvent", { user: req.normalizedUser, events: events, allEvents: allEvents });
    })
    .catch(err => {
      console.error("Error fetching events:", err);
      res.render("manager/mEvent", { user: req.normalizedUser, events: [], allEvents: [] });
    });
});

// Search events
app.post("/searchEvent", (req, res) => {
  const { search } = req.body;
  
  userDatabase('eventoccurrenceinfo')
    .join('eventtypeinfo', 'eventoccurrenceinfo.eventtypeid', '=', 'eventtypeinfo.eventtypeid')
    .select(
      'eventoccurrenceinfo.eventoccurrenceid',
      'eventoccurrenceinfo.eventtypeid',
      'eventoccurrenceinfo.eventname',
      'eventoccurrenceinfo.eventdatetimestart',
      'eventoccurrenceinfo.eventdatetimeend',
      'eventoccurrenceinfo.eventlocation',
      'eventoccurrenceinfo.eventcapacity',
      'eventoccurrenceinfo.eventregistrationdeadline',
      'eventtypeinfo.eventtype',
      'eventtypeinfo.eventdescription',
      'eventtypeinfo.eventrecurrencepattern',
      'eventtypeinfo.eventdefaultcapacity'
    )
    .whereNotNull('eventoccurrenceinfo.eventoccurrenceid')
    .andWhere(function() {
      this.where('eventoccurrenceinfo.eventname', 'ilike', `%${search}%`)
          .orWhere('eventoccurrenceinfo.eventlocation', 'ilike', `%${search}%`)
          .orWhere('eventtypeinfo.eventtype', 'ilike', `%${search}%`)
          // Search by formatted start date/time (e.g., "May 15, 2025, 10:00 AM")
          // Using TRIM to remove trailing spaces from Month, and FM prefix to suppress padding
          .orWhereRaw(`TRIM(to_char(eventoccurrenceinfo.eventdatetimestart, 'FMMonth')) || ' ' || to_char(eventoccurrenceinfo.eventdatetimestart, 'DD') || ', ' || to_char(eventoccurrenceinfo.eventdatetimestart, 'YYYY') || ', ' || to_char(eventoccurrenceinfo.eventdatetimestart, 'HH12:MI AM') ILIKE ?`, [`%${search}%`])
          // Search by formatted end date/time
          .orWhereRaw(`TRIM(to_char(eventoccurrenceinfo.eventdatetimeend, 'FMMonth')) || ' ' || to_char(eventoccurrenceinfo.eventdatetimeend, 'DD') || ', ' || to_char(eventoccurrenceinfo.eventdatetimeend, 'YYYY') || ', ' || to_char(eventoccurrenceinfo.eventdatetimeend, 'HH12:MI AM') ILIKE ?`, [`%${search}%`])
          // Search by formatted registration deadline
          .orWhereRaw(`TRIM(to_char(eventoccurrenceinfo.eventregistrationdeadline, 'FMMonth')) || ' ' || to_char(eventoccurrenceinfo.eventregistrationdeadline, 'DD') || ', ' || to_char(eventoccurrenceinfo.eventregistrationdeadline, 'YYYY') || ', ' || to_char(eventoccurrenceinfo.eventregistrationdeadline, 'HH12:MI AM') ILIKE ?`, [`%${search}%`])
          // Also search by date parts for partial matches (e.g., "May", "15", "2025", "10:00")
          .orWhereRaw(`TRIM(to_char(eventoccurrenceinfo.eventdatetimestart, 'FMMonth')) ILIKE ?`, [`%${search}%`])
          .orWhereRaw(`to_char(eventoccurrenceinfo.eventdatetimestart, 'DD') ILIKE ?`, [`%${search}%`])
          .orWhereRaw(`to_char(eventoccurrenceinfo.eventdatetimestart, 'YYYY') ILIKE ?`, [`%${search}%`])
          .orWhereRaw(`to_char(eventoccurrenceinfo.eventdatetimestart, 'HH12:MI AM') ILIKE ?`, [`%${search}%`]);
    })
    .orderBy('eventoccurrenceinfo.eventdatetimestart', 'desc')
    .then(events => {
      if (req.session.level === 'M') {
      res.render("manager/mEvent", {user: req.normalizedUser, events: events, allEvents: events});
      } else {
      res.render("user/uEvent", {user: req.normalizedUser, events: events, allEvents: events});
      }
    })
    .catch(err => {
      console.error("Error searching events:", err);
      if (req.session.level === 'M') {
      res.render("manager/mEvent", {user: req.normalizedUser, events: []});
      } else {
      res.render("user/uEvent", {user: req.normalizedUser, events: []});
      };
    });
});

// Save event (add or edit)
app.post("/mEvent/save", (req, res) => {
  const { id, eventtypeid, eventname, eventdatetimestart, eventdatetimeend, 
          eventlocation, eventcapacity, eventregistrationdeadline, mode } = req.body;
  
  const eventData = {
    eventtypeid: parseInt(eventtypeid),
    eventname: eventname,
    eventdatetimestart: eventdatetimestart || null,
    eventdatetimeend: eventdatetimeend || null,
    eventlocation: eventlocation,
    eventcapacity: eventcapacity ? parseInt(eventcapacity) : null,
    eventregistrationdeadline: eventregistrationdeadline || null
  };
  
  if (mode === 'edit' && id) {
    userDatabase('eventoccurrenceinfo')
      .where('eventoccurrenceid', id)
      .update(eventData)
      .then(() => {
        res.redirect('/mEvent');
      })
      .catch(err => {
        console.error("Error updating event:", err);
        res.redirect('/mEvent');
      });
  } else {
    userDatabase('eventoccurrenceinfo')
      .insert(eventData)
      .then(() => {
        res.redirect('/mEvent');
      })
      .catch(err => {
        console.error("Error adding event:", err);
        res.redirect('/mEvent');
      });
  }
});

// Delete event
app.post("/mEvent/delete/:eventoccurrenceid", (req, res) => {
  userDatabase('eventoccurrenceinfo')
    .where('eventoccurrenceid', req.params.eventoccurrenceid)
    .del()
    .then(() => {
      res.redirect('/mEvent');
    })
    .catch(err => {
      console.error("Error deleting event:", err);
      res.redirect('/mEvent');
    });
});


//mUser routes
app.get("/mUser", (req, res) => {
  userDatabase.select()
    .from("users")
    .then(users => {
      res.render("manager/mUser", {user: req.normalizedUser, users: users});
    })
    .catch(err => {
      console.error("Error fetching users:", err);
      res.render("manager/mUser", {user: req.normalizedUser, users: []});
    });
});

// Save user (add or edit)
app.post("/mUser/save", (req, res) => {
  const { id, username, password, level, mode } = req.body;
  
  if (mode === 'edit' && id) {
    // Update existing user
    userDatabase('users')
      .where('username', id)
      .update({ 
        username: username,
        password: password, 
        level: level 
      })
      .then(() => {
        res.redirect('/mUser');
      })
      .catch(err => {
        console.error("Error updating user:", err);
        res.redirect('/mUser');
      });
  } else {
    // Insert new user
    userDatabase('users')
      .insert({ 
        username: username, 
        password: password, 
        level: level 
      })
      .then(() => {
        res.redirect('/mUser');
      })
      .catch(err => {
        console.error("Error adding user:", err);
        res.redirect('/mUser');
      });
  }
});

// Delete user
app.post("/mUser/delete/:username", (req, res) => {
  // Prevent users from deleting their own account
  if (req.params.username === req.session.username) {
    return res.redirect('/mUser?error=cannot_delete_self');
  }
  
  userDatabase('users')
    .where('username', req.params.username)
    .del()
    .then(() => {
      res.redirect('/mUser');
    })
    .catch(err => {
      console.error("Error deleting user:", err);
      res.redirect('/mUser');
    });
});

// Teapot route - returns 418 I'm a Teapot error
app.get("/teapot", (req, res) => {
  res.render("teapot", {user: req.normalizedUser});
});






app.get("/mMilestone", (req, res) => {
  userDatabase('participantmilestoneinfo')
    .join('participantinfo', 'participantmilestoneinfo.participantid', '=', 'participantinfo.participantid')
    .join('milestoneinfo', 'participantmilestoneinfo.milestoneid', '=', 'milestoneinfo.milestoneid')
    .select(
      'participantmilestoneinfo.milestonedate',
      'participantmilestoneinfo.participantmilestoneid',
      'participantmilestoneinfo.participantid',
      'participantmilestoneinfo.milestoneid',
      'milestoneinfo.milestonetitle',
      'participantinfo.participantfirstname',
      'participantinfo.participantlastname'
    )
    .whereNotNull('milestoneinfo.milestonetitle')
    .orderBy('participantinfo.participantfirstname', 'asc')
    .orderBy('participantinfo.participantlastname', 'asc')
    .then(allMilestones => {
      // Shuffle and get 20 random milestones
      const shuffled = allMilestones.sort(() => 0.5 - Math.random());
      const milestones = shuffled.slice(0, 20);
      res.render("manager/mMilestone", { user: req.normalizedUser, milestones: milestones, allMilestones: allMilestones });
    })
    .catch(err => {
      console.error("Error fetching milestones:", err);
      res.render("manager/mMilestone", { user: req.normalizedUser, milestones: [], allMilestones: [] });
    });
});

// Search milestones
app.post("/searchMilestone", (req, res) => {
  const { search } = req.body;
  
  userDatabase('participantmilestoneinfo')
    .join('participantinfo', 'participantmilestoneinfo.participantid', '=', 'participantinfo.participantid')
    .join('milestoneinfo', 'participantmilestoneinfo.milestoneid', '=', 'milestoneinfo.milestoneid')
    .select(
      'participantmilestoneinfo.milestonedate',
      'participantmilestoneinfo.participantmilestoneid',
      'participantmilestoneinfo.participantid',
      'participantmilestoneinfo.milestoneid',
      'milestoneinfo.milestonetitle',
      'participantinfo.participantfirstname',
      'participantinfo.participantlastname'
    )
    .whereNotNull('milestoneinfo.milestonetitle')
    .andWhere(function() {
      this.where('participantinfo.participantfirstname', 'ilike', `%${search}%`)
          .orWhere('participantinfo.participantlastname', 'ilike', `%${search}%`)
          .orWhere('milestoneinfo.milestonetitle', 'ilike', `%${search}%`);
    })
    .orderBy('participantinfo.participantfirstname', 'asc')
    .orderBy('participantinfo.participantlastname', 'asc')
    .then(milestones => {
      if (req.session.level === 'M') {
      res.render("manager/mMilestone", {user: req.normalizedUser, milestones: milestones});
      } else {
      res.render("user/uMilestone", {user: req.normalizedUser, milestones: milestones});
      }
    })
    .catch(err => {
      console.error("Error searching milestones:", err);
      if (req.session.level === 'M') {
      res.render("manager/mMilestone", {user: req.normalizedUser, milestones: []});
      } else {
      res.render("user/uMilestone", {user: req.normalizedUser, milestones: []});
      };
    });
});

// Save milestone (add or edit)
app.post("/mMilestone/save", (req, res) => {
  const { id, participantid, milestoneid, milestonedate, milestonetitle, mode } = req.body;
  
  if (mode === 'edit' && id) {
    // Update existing milestone
    const updatePromises = [];
    
    // Update ParticipantMilestoneInfo (milestonedate)
    // Only update if milestonedate is provided and not empty
    if (milestonedate !== undefined && milestonedate !== '') {
      const participantMilestoneData = {
        milestonedate: milestonedate
      };
      updatePromises.push(
        userDatabase('participantmilestoneinfo')
          .where('participantmilestoneid', id)
          .update(participantMilestoneData)
      );
    }
    
    // Update MilestoneInfo (milestonetitle) if provided and not empty
    if (milestonetitle !== undefined && milestonetitle !== '' && milestoneid) {
      const milestoneInfoData = {
        milestonetitle: milestonetitle.trim()
      };
      updatePromises.push(
        userDatabase('milestoneinfo')
          .where('milestoneid', milestoneid)
          .update(milestoneInfoData)
      );
    }
    
    // Execute all updates
    if (updatePromises.length > 0) {
      Promise.all(updatePromises)
        .then(() => {
          res.redirect('/mMilestone');
        })
        .catch(err => {
          console.error("Error updating milestone:", err);
          res.redirect('/mMilestone');
        });
    } else {
      // No updates to perform
      res.redirect('/mMilestone');
    }
  } else {
    // Insert new milestone (requires participantid and milestoneid)
    if (!participantid || !milestoneid) {
      console.error("Missing required fields for new milestone");
      res.redirect('/mMilestone');
      return;
    }
    
    const milestoneData = {
      participantid: parseInt(participantid),
      milestoneid: parseInt(milestoneid),
      milestonedate: milestonedate || new Date()
    };
    
    userDatabase('participantmilestoneinfo')
      .insert(milestoneData)
      .then(() => {
        res.redirect('/mMilestone');
      })
      .catch(err => {
        console.error("Error adding milestone:", err);
        res.redirect('/mMilestone');
      });
  }
});

// Delete milestone
app.post("/mMilestone/delete/:participantmilestoneid", (req, res) => {
  userDatabase('participantmilestoneinfo')
    .where('participantmilestoneid', req.params.participantmilestoneid)
    .del()
    .then(() => {
      res.redirect('/mMilestone');
    })
    .catch(err => {
      console.error("Error deleting milestone:", err);
      res.redirect('/mMilestone');
    });
});

// mParticipant routes
app.get("/mParticipant", (req, res) => {
  userDatabase('participantinfo')
    .select('*')
    .orderBy('participantfirstname', 'asc')
    .orderBy('participantlastname', 'asc')
    .then(allParticipants => {
      // Shuffle and get 20 random participants
      const shuffled = allParticipants.sort(() => 0.5 - Math.random());
      const participants = shuffled.slice(0, 20);
      res.render("manager/mParticipant", { user: req.normalizedUser, participants: participants, allParticipants: allParticipants });
    })
    .catch(err => {
      console.error("Error fetching participants:", err);
      res.render("manager/mParticipant", { user: req.normalizedUser, participants: [], allParticipants: [] });
    });
});

// Search participants
app.post("/searchParticipant", (req, res) => {
  const { search } = req.body;
  const searchTerm = search.trim();
  
  userDatabase('participantinfo')
    .select('*')
    .where(function() {
      // Individual field searches
      this.where('participantfirstname', 'ilike', `%${searchTerm}%`)
          .orWhere('participantlastname', 'ilike', `%${searchTerm}%`)
          .orWhere('participantemail', 'ilike', `%${searchTerm}%`)
          .orWhere('participantcity', 'ilike', `%${searchTerm}%`)
          .orWhere('participantstate', 'ilike', `%${searchTerm}%`)
          // Combined first and last name search (FirstName LastName)
          .orWhereRaw("CONCAT(participantfirstname, ' ', participantlastname) ILIKE ?", [`%${searchTerm}%`])
          // Combined last and first name search (LastName FirstName)
          .orWhereRaw("CONCAT(participantlastname, ' ', participantfirstname) ILIKE ?", [`%${searchTerm}%`]);
    })
    .orderBy('participantfirstname', 'asc')
    .orderBy('participantlastname', 'asc')
    .then(participants => {
      if (req.session.level === 'M') {
      res.render("manager/mParticipant", {user: req.normalizedUser, participants: participants});
      } else {
      res.render("user/uParticipant", {user: req.normalizedUser, participants: participants});
      }
    })
    .catch(err => {
      console.error("Error searching participants:", err);
      if (req.session.level === 'M') {
      res.render("manager/mParticipant", {user: req.normalizedUser, participants: []});
      } else {
      res.render("user/uParticipant", {user: req.normalizedUser, participants: []});
      };
    });
});

// API endpoint to get participant details with donations, events, and milestones
app.get("/api/participant/:participantId", (req, res) => {
  const participantId = parseInt(req.params.participantId);
  
  if (!participantId || isNaN(participantId)) {
    return res.status(400).json({ error: 'Invalid participant ID' });
  }

  // Get participant basic info
  const participantPromise = userDatabase('participantinfo')
    .where('participantid', participantId)
    .first();

  // Get all donations for this participant
  const donationsPromise = userDatabase('donationinfo')
    .where('participantid', participantId)
    .orderBy('donationtime', 'desc');

  // Get event attendance counts by type
  const eventsPromise = userDatabase('attendanceinfo')
    .join('eventoccurrenceinfo', 'attendanceinfo.eventoccurrenceid', '=', 'eventoccurrenceinfo.eventoccurrenceid')
    .join('eventtypeinfo', 'eventoccurrenceinfo.eventtypeid', '=', 'eventtypeinfo.eventtypeid')
    .where('attendanceinfo.participantid', participantId)
    .select('eventtypeinfo.eventtype')
    .count('* as count')
    .groupBy('eventtypeinfo.eventtype');

  // Get all milestones for this participant
  const milestonesPromise = userDatabase('participantmilestoneinfo')
    .join('milestoneinfo', 'participantmilestoneinfo.milestoneid', '=', 'milestoneinfo.milestoneid')
    .where('participantmilestoneinfo.participantid', participantId)
    .select(
      'milestoneinfo.milestoneid',
      'milestoneinfo.milestonetitle',
      'participantmilestoneinfo.milestonedate'
    )
    .orderBy('participantmilestoneinfo.milestonedate', 'desc');

  // Execute all queries in parallel
  Promise.all([participantPromise, donationsPromise, eventsPromise, milestonesPromise])
    .then(([participant, donations, events, milestones]) => {
      if (!participant) {
        return res.status(404).json({ error: 'Participant not found' });
      }

      // Format events data - convert count to number
      const eventCounts = events.map(event => ({
        eventType: event.eventtype,
        count: parseInt(event.count)
      }));

      res.json({
        participant: participant,
        donations: donations,
        events: eventCounts,
        milestones: milestones
      });
    })
    .catch(err => {
      console.error("Error fetching participant details:", err);
      res.status(500).json({ error: 'Error fetching participant details' });
    });
});

// API endpoint to get event details with participants, surveys, and statistics
app.get("/api/event/:eventOccurrenceId", (req, res) => {
  const eventOccurrenceId = parseInt(req.params.eventOccurrenceId);
  
  if (!eventOccurrenceId || isNaN(eventOccurrenceId)) {
    return res.status(400).json({ error: 'Invalid event occurrence ID' });
  }

  // Get event basic info with event type
  const eventPromise = userDatabase('eventoccurrenceinfo')
    .join('eventtypeinfo', 'eventoccurrenceinfo.eventtypeid', '=', 'eventtypeinfo.eventtypeid')
    .select(
      'eventoccurrenceinfo.eventoccurrenceid',
      'eventoccurrenceinfo.eventtypeid',
      'eventoccurrenceinfo.eventname',
      'eventoccurrenceinfo.eventdatetimestart',
      'eventoccurrenceinfo.eventdatetimeend',
      'eventoccurrenceinfo.eventlocation',
      'eventoccurrenceinfo.eventcapacity',
      'eventoccurrenceinfo.eventregistrationdeadline',
      'eventtypeinfo.eventtype',
      'eventtypeinfo.eventdescription',
      'eventtypeinfo.eventrecurrencepattern',
      'eventtypeinfo.eventdefaultcapacity'
    )
    .where('eventoccurrenceinfo.eventoccurrenceid', eventOccurrenceId)
    .first();

  // Get all participants who registered/attended this event
  const participantsPromise = userDatabase('attendanceinfo')
    .join('participantinfo', 'attendanceinfo.participantid', '=', 'participantinfo.participantid')
    .where('attendanceinfo.eventoccurrenceid', eventOccurrenceId)
    .select(
      'participantinfo.participantid',
      'participantinfo.participantfirstname',
      'participantinfo.participantlastname',
      'participantinfo.participantemail',
      'attendanceinfo.registrationstatus',
      'attendanceinfo.registrationattendedflag',
      'attendanceinfo.registrationcreatedat'
    )
    .orderBy('participantinfo.participantlastname', 'asc')
    .orderBy('participantinfo.participantfirstname', 'asc');

  // Get survey results for this event
  const surveysPromise = userDatabase('surveyinfo')
    .join('attendanceinfo', 'surveyinfo.registrationid', '=', 'attendanceinfo.registrationid')
    .join('participantinfo', 'attendanceinfo.participantid', '=', 'participantinfo.participantid')
    .where('attendanceinfo.eventoccurrenceid', eventOccurrenceId)
    .select(
      'surveyinfo.surveyid',
      'surveyinfo.surveysatisfactionscore',
      'surveyinfo.surveyusefulnessscore',
      'surveyinfo.surveyinstructorscore',
      'surveyinfo.surveyrecommendationscore',
      'surveyinfo.surveyoverallscore',
      'surveyinfo.surveynpsbucket',
      'surveyinfo.surveycomments',
      'surveyinfo.surveysubmissiondate',
      'participantinfo.participantfirstname',
      'participantinfo.participantlastname'
    )
    .orderBy('surveyinfo.surveysubmissiondate', 'desc');

  // Get registration statistics
  const statsPromise = userDatabase('attendanceinfo')
    .where('eventoccurrenceid', eventOccurrenceId)
    .select(
      userDatabase.raw('COUNT(*) as total_registered'),
      userDatabase.raw('COUNT(CASE WHEN registrationattendedflag = true THEN 1 END) as total_attended'),
      userDatabase.raw("COUNT(CASE WHEN registrationstatus = 'Registered' THEN 1 END) as registered_status")
    )
    .first();

  // Execute all queries in parallel
  Promise.all([eventPromise, participantsPromise, surveysPromise, statsPromise])
    .then(([event, participants, surveys, stats]) => {
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      const statistics = stats || { total_registered: 0, total_attended: 0, registered_status: 0 };

      res.json({
        event: event,
        participants: participants,
        surveys: surveys,
        statistics: {
          totalRegistered: parseInt(statistics.total_registered) || 0,
          totalAttended: parseInt(statistics.total_attended) || 0,
          registeredStatus: parseInt(statistics.registered_status) || 0
        }
      });
    })
    .catch(err => {
      console.error("Error fetching event details:", err);
      res.status(500).json({ error: 'Error fetching event details' });
    });
});

// API endpoint to get donation details with participant info and other donations
app.get("/api/donation/:donationId", (req, res) => {
  const donationId = parseInt(req.params.donationId);
  
  if (!donationId || isNaN(donationId)) {
    return res.status(400).json({ error: 'Invalid donation ID' });
  }

  // Get donation basic info with participant details
  userDatabase('donationinfo')
    .join('participantinfo', 'donationinfo.participantid', '=', 'participantinfo.participantid')
    .select(
      'donationinfo.donationid',
      'donationinfo.participantid',
      'donationinfo.donationamount',
      'donationinfo.donationtime',
      'participantinfo.participantid',
      'participantinfo.participantemail',
      'participantinfo.participantfirstname',
      'participantinfo.participantlastname',
      'participantinfo.participantdob',
      'participantinfo.participantrole',
      'participantinfo.participantphone',
      'participantinfo.participantcity',
      'participantinfo.participantstate',
      'participantinfo.participantzip',
      'participantinfo.participantschooloremployer',
      'participantinfo.participantfieldofinterest'
    )
    .where('donationinfo.donationid', donationId)
    .first()
    .then(donation => {
      if (!donation) {
        return res.status(404).json({ error: 'Donation not found' });
      }

      const participantId = donation.participantid;

      // Get all other donations for the same participant
      return userDatabase('donationinfo')
        .where('donationinfo.participantid', participantId)
        .whereNot('donationinfo.donationid', donationId)
        .select(
          'donationinfo.donationid',
          'donationinfo.donationamount',
          'donationinfo.donationtime'
        )
        .orderBy('donationinfo.donationtime', 'desc')
        .then(otherDonations => {
          // Extract participant info from donation data
          const participant = {
            participantid: donation.participantid,
            participantemail: donation.participantemail,
            participantfirstname: donation.participantfirstname,
            participantlastname: donation.participantlastname,
            participantdob: donation.participantdob,
            participantrole: donation.participantrole,
            participantphone: donation.participantphone,
            participantcity: donation.participantcity,
            participantstate: donation.participantstate,
            participantzip: donation.participantzip,
            participantschooloremployer: donation.participantschooloremployer,
            participantfieldofinterest: donation.participantfieldofinterest
          };

          // Extract donation info
          const donationInfo = {
            donationid: donation.donationid,
            donationamount: donation.donationamount,
            donationtime: donation.donationtime
          };

          res.json({
            donation: donationInfo,
            participant: participant,
            otherDonations: otherDonations
          });
        });
    })
    .catch(err => {
      console.error("Error fetching donation details:", err);
      res.status(500).json({ error: 'Error fetching donation details' });
    });
});

// API endpoint to get milestone details with participant info and other milestones
app.get("/api/milestone/:participantMilestoneId", (req, res) => {
  const participantMilestoneId = parseInt(req.params.participantMilestoneId);
  
  if (!participantMilestoneId || isNaN(participantMilestoneId)) {
    return res.status(400).json({ error: 'Invalid participant milestone ID' });
  }

  // Get milestone basic info with participant and milestone details
  userDatabase('participantmilestoneinfo')
    .join('participantinfo', 'participantmilestoneinfo.participantid', '=', 'participantinfo.participantid')
    .join('milestoneinfo', 'participantmilestoneinfo.milestoneid', '=', 'milestoneinfo.milestoneid')
    .select(
      'participantmilestoneinfo.participantmilestoneid',
      'participantmilestoneinfo.participantid',
      'participantmilestoneinfo.milestoneid',
      'participantmilestoneinfo.milestonedate',
      'milestoneinfo.milestonetitle',
      'participantinfo.participantid',
      'participantinfo.participantemail',
      'participantinfo.participantfirstname',
      'participantinfo.participantlastname',
      'participantinfo.participantdob',
      'participantinfo.participantrole',
      'participantinfo.participantphone',
      'participantinfo.participantcity',
      'participantinfo.participantstate',
      'participantinfo.participantzip',
      'participantinfo.participantschooloremployer',
      'participantinfo.participantfieldofinterest'
    )
    .where('participantmilestoneinfo.participantmilestoneid', participantMilestoneId)
    .first()
    .then(milestone => {
      if (!milestone) {
        return res.status(404).json({ error: 'Milestone not found' });
      }

      const participantId = milestone.participantid;

      // Get all other milestones for the same participant
      return userDatabase('participantmilestoneinfo')
        .join('milestoneinfo', 'participantmilestoneinfo.milestoneid', '=', 'milestoneinfo.milestoneid')
        .where('participantmilestoneinfo.participantid', participantId)
        .whereNot('participantmilestoneinfo.participantmilestoneid', participantMilestoneId)
        .select(
          'participantmilestoneinfo.participantmilestoneid',
          'participantmilestoneinfo.milestoneid',
          'participantmilestoneinfo.milestonedate',
          'milestoneinfo.milestonetitle'
        )
        .orderBy('participantmilestoneinfo.milestonedate', 'desc')
        .then(otherMilestones => {
          // Extract participant info from milestone data
          const participant = {
            participantid: milestone.participantid,
            participantemail: milestone.participantemail,
            participantfirstname: milestone.participantfirstname,
            participantlastname: milestone.participantlastname,
            participantdob: milestone.participantdob,
            participantrole: milestone.participantrole,
            participantphone: milestone.participantphone,
            participantcity: milestone.participantcity,
            participantstate: milestone.participantstate,
            participantzip: milestone.participantzip,
            participantschooloremployer: milestone.participantschooloremployer,
            participantfieldofinterest: milestone.participantfieldofinterest
          };

          // Extract milestone info
          const milestoneInfo = {
            participantmilestoneid: milestone.participantmilestoneid,
            milestoneid: milestone.milestoneid,
            milestonetitle: milestone.milestonetitle,
            milestonedate: milestone.milestonedate
          };

          res.json({
            milestone: milestoneInfo,
            participant: participant,
            otherMilestones: otherMilestones
          });
        });
    })
    .catch(err => {
      console.error("Error fetching milestone details:", err);
      res.status(500).json({ error: 'Error fetching milestone details' });
    });
});

// Save participant (add or edit)
app.post("/mParticipant/save", (req, res) => {
  const { id, participantemail, participantfirstname, participantlastname, 
          participantdob, participantrole, participantphone, participantcity, 
          participantstate, participantzip, participantschooloremployer, 
          participantfieldofinterest, mode } = req.body;
  
  const participantData = {
    participantemail: participantemail,
    participantfirstname: participantfirstname,
    participantlastname: participantlastname,
    participantdob: participantdob || null,
    participantrole: participantrole,
    participantphone: participantphone,
    participantcity: participantcity,
    participantstate: participantstate,
    participantzip: participantzip,
    participantschooloremployer: participantschooloremployer,
    participantfieldofinterest: participantfieldofinterest
  };
  
  if (mode === 'edit' && id) {
    userDatabase('participantinfo')
      .where('participantid', id)
      .update(participantData)
      .then(() => {
        res.redirect('/mParticipant');
      })
      .catch(err => {
        console.error("Error updating participant:", err);
        res.redirect('/mParticipant');
      });
  } else {
    userDatabase('participantinfo')
      .insert(participantData)
      .then(() => {
        res.redirect('/mParticipant');
      })
      .catch(err => {
        console.error("Error adding participant:", err);
        res.redirect('/mParticipant');
      });
  }
});

// Delete participant
app.post("/mParticipant/delete/:participantid", (req, res) => {
  userDatabase('participantinfo')
    .where('participantid', req.params.participantid)
    .del()
    .then(() => {
      res.redirect('/mParticipant');
    })
    .catch(err => {
      console.error("Error deleting participant:", err);
      res.redirect('/mParticipant');
    });
});

// mSurvey routes
app.get("/mSurvey", (req, res) => {
  try {
    userDatabase('surveyinfo')
      .select('*')
      .whereNotNull('surveysatisfactionscore')
      .then(surveys => {
        res.render("manager/mSurvey", { user: req.normalizedUser, surveys: surveys || [] });
      })
      .catch(err => {
        console.error("Error fetching surveys:", err);
        console.error("Full error:", err.message);
        console.error("Error stack:", err.stack);
        res.render("manager/mSurvey", { user: req.normalizedUser, surveys: [] });
      });
  } catch (error) {
    console.error("Caught error in /mSurvey route:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    res.render("manager/mSurvey", { user: req.normalizedUser, surveys: [] });
  }
});

// Search surveys
app.post("/searchSurvey", (req, res) => {
  const { search } = req.body;
  
  userDatabase('surveyinfo')
    .select('*')
    .whereNotNull('surveysatisfactionscore')
    .andWhere(function() {
      this.where('surveynpsbucket', 'ilike', `%${search}%`)
          .orWhere('surveycomments', 'ilike', `%${search}%`)
          .orWhereRaw('CAST(surveyid AS TEXT) ILIKE ?', [`%${search}%`])
          .orWhereRaw('CAST(surveysatisfactionscore AS TEXT) ILIKE ?', [`%${search}%`]);
    })
    .then(surveys => {
      if (req.session.level === 'M') {
      res.render("manager/mSurvey", {user: req.normalizedUser, surveys: surveys});
      } else {
      res.render("user/uSurvey", {user: req.normalizedUser, surveys: surveys});
      }
    })
    .catch(err => {
      console.error("Error searching surveys:", err);
      if (req.session.level === 'M') {
      res.render("manager/mSurvey", {user: req.normalizedUser, surveys: []});
      } else {
      res.render("user/uSurvey", {user: req.normalizedUser, surveys: []});
      };
    });
});

// Save survey (add or edit)
app.post("/mSurvey/save", (req, res) => {
  const { id, registrationid, surveysatisfactionscore, surveyusefulnessscore, 
          surveyinstructorscore, surveyrecommendationscore, surveyoverallscore, 
          surveynpsbucket, surveycomments, surveysubmissiondate, mode } = req.body;
  
  // Parse score values
  const satisfactionScore = surveysatisfactionscore ? parseInt(surveysatisfactionscore) : null;
  const usefulnessScore = surveyusefulnessscore ? parseInt(surveyusefulnessscore) : null;
  const instructorScore = surveyinstructorscore ? parseInt(surveyinstructorscore) : null;
  const recommendationScore = surveyrecommendationscore ? parseInt(surveyrecommendationscore) : null;
  
  // Calculate overall score as average of the four scores
  const scores = [satisfactionScore, usefulnessScore, instructorScore, recommendationScore].filter(s => s !== null && !isNaN(s));
  let calculatedOverallScore = null;
  if (scores.length > 0) {
    const sum = scores.reduce((a, b) => a + b, 0);
    calculatedOverallScore = Math.round(sum / scores.length); // Round to nearest integer (database column is integer type)
  }
  
  if (mode === 'edit' && id) {
    // For edit mode, don't update registrationid (it's a foreign key)
    const surveyData = {
      surveysatisfactionscore: satisfactionScore,
      surveyusefulnessscore: usefulnessScore,
      surveyinstructorscore: instructorScore,
      surveyrecommendationscore: recommendationScore,
      surveyoverallscore: calculatedOverallScore,
      surveynpsbucket: surveynpsbucket || null,
      surveycomments: surveycomments || null,
      surveysubmissiondate: surveysubmissiondate || new Date()
    };
    
    userDatabase('surveyinfo')
      .where('surveyid', id)
      .update(surveyData)
      .then(() => {
        res.redirect('/mSurvey');
      })
      .catch(err => {
        console.error("Error updating survey:", err);
        res.redirect('/mSurvey');
      });
  } else {
    // For add mode, registrationid is required
    if (!registrationid) {
      return res.redirect('/mSurvey?error=Registration ID is required');
    }
    
    const surveyData = {
      registrationid: parseInt(registrationid),
      surveysatisfactionscore: satisfactionScore,
      surveyusefulnessscore: usefulnessScore,
      surveyinstructorscore: instructorScore,
      surveyrecommendationscore: recommendationScore,
      surveyoverallscore: calculatedOverallScore,
      surveynpsbucket: surveynpsbucket || null,
      surveycomments: surveycomments || null,
      surveysubmissiondate: surveysubmissiondate || new Date()
    };
    
    userDatabase('surveyinfo')
      .insert(surveyData)
      .then(() => {
        res.redirect('/mSurvey');
      })
      .catch(err => {
        console.error("Error adding survey:", err);
        res.redirect('/mSurvey');
      });
  }
});

// Delete survey
app.post("/mSurvey/delete/:surveyid", (req, res) => {
  userDatabase('surveyinfo')
    .where('surveyid', req.params.surveyid)
    .del()
    .then(() => {
      res.redirect('/mSurvey');
    })
    .catch(err => {
      console.error("Error deleting survey:", err);
      res.redirect('/mSurvey');
    });
});

app.get("/mTableau", (req, res) => {
  // Redirect to tableau page (same for managers and users)
  res.redirect("/tableau");
});


// Logout route //
//--------------//
app.get("/logout", (req, res) => {
    // Clear session data first
    req.session.isLoggedIn = false;
    req.session.username = null;
    req.session.level = null;
    
    // Get rid of the session object
    req.session.destroy((err) => {
        if (err) {
            console.error("Session destroy error:", err);
        }
        // Clear the cookie as well
        res.clearCookie('connect.sid');
        res.redirect("/");
    });
});









// -- User Accessible Routes //
//---------------------------//
app.get("/uDonation", (req, res) => {
  userDatabase('donationinfo')
    .join('participantinfo', 'donationinfo.participantid', '=', 'participantinfo.participantid')
    .select(
      'donationinfo.donationid',
      'donationinfo.donationtime',
      'donationinfo.donationamount',
      'donationinfo.participantid',
      'participantinfo.participantfirstname',
      'participantinfo.participantlastname',
      'participantinfo.participantemail'
    )
    .whereNotNull('donationinfo.donationamount')
    .orderBy('donationinfo.donationtime', 'asc')
    .then(allDonations => {
      // Shuffle and get 20 random donations
      const shuffled = allDonations.sort(() => 0.5 - Math.random());
      const donations = shuffled.slice(0, 20);
      res.render("user/uDonation", { user: req.normalizedUser, donations: donations, allDonations: allDonations });
    })
    .catch(err => {
      console.error("Error fetching donations:", err);
      res.render("user/uDonation", { user: req.normalizedUser, donations: [], allDonations: [] });
    });
});

app.get("/uEvent", (req, res) => {
  userDatabase('eventoccurrenceinfo')
    .join('eventtypeinfo', 'eventoccurrenceinfo.eventtypeid', '=', 'eventtypeinfo.eventtypeid')
    .select(
      'eventoccurrenceinfo.eventoccurrenceid',
      'eventoccurrenceinfo.eventtypeid',
      'eventoccurrenceinfo.eventname',
      'eventoccurrenceinfo.eventdatetimestart',
      'eventoccurrenceinfo.eventdatetimeend',
      'eventoccurrenceinfo.eventlocation',
      'eventoccurrenceinfo.eventcapacity',
      'eventoccurrenceinfo.eventregistrationdeadline',
      'eventtypeinfo.eventtype',
      'eventtypeinfo.eventdescription',
      'eventtypeinfo.eventrecurrencepattern',
      'eventtypeinfo.eventdefaultcapacity'
    )
    .whereNotNull('eventoccurrenceinfo.eventoccurrenceid')
    .orderBy('eventoccurrenceinfo.eventname', 'asc')
    .then(allEvents => {
      // Shuffle and get 20 random events
      const shuffled = allEvents.sort(() => 0.5 - Math.random());
      const events = shuffled.slice(0, 20);
      res.render("user/uEvent", { user: req.normalizedUser, events: events, allEvents: allEvents });
    })
    .catch(err => {
      console.error("Error fetching events:", err);
      res.render("user/uEvent", { user: req.normalizedUser, events: [], allEvents: [] });
    });
});

app.get("/tableau", (req, res) => {
  res.render("tableau", { user: req.normalizedUser });
});

app.get("/uMilestone", (req, res) => {
  userDatabase('participantmilestoneinfo')
    .join('participantinfo', 'participantmilestoneinfo.participantid', '=', 'participantinfo.participantid')
    .join('milestoneinfo', 'participantmilestoneinfo.milestoneid', '=', 'milestoneinfo.milestoneid')
    .select(
      'participantmilestoneinfo.milestonedate',
      'participantmilestoneinfo.participantmilestoneid',
      'participantmilestoneinfo.participantid',
      'participantmilestoneinfo.milestoneid',
      'milestoneinfo.milestonetitle',
      'participantinfo.participantfirstname',
      'participantinfo.participantlastname'
    )
    .whereNotNull('milestoneinfo.milestonetitle')
    .orderBy('participantinfo.participantfirstname', 'asc')
    .orderBy('participantinfo.participantlastname', 'asc')
    .then(allMilestones => {
      // Shuffle and get 20 random milestones
      const shuffled = allMilestones.sort(() => 0.5 - Math.random());
      const milestones = shuffled.slice(0, 20);
      res.render("user/uMilestone", { user: req.normalizedUser, milestones: milestones, allMilestones: allMilestones });
    })
    .catch(err => {
      console.error("Error fetching milestones:", err);
      res.render("user/uMilestone", { user: req.normalizedUser, milestones: [], allMilestones: [] });
    });
});

app.get("/uParticipant", (req, res) => {
  userDatabase('participantinfo')
    .select('*')
    .orderBy('participantfirstname', 'asc')
    .orderBy('participantlastname', 'asc')
    .then(allParticipants => {
      // Shuffle and get 20 random participants
      const shuffled = allParticipants.sort(() => 0.5 - Math.random());
      const participants = shuffled.slice(0, 20);
      res.render("user/uParticipant", { user: req.normalizedUser, participants: participants, allParticipants: allParticipants });
    })
    .catch(err => {
      console.error("Error fetching participants:", err);
      res.render("user/uParticipant", { user: req.normalizedUser, participants: [], allParticipants: [] });
    });
});

app.get("/uSurvey", (req, res) => {
  userDatabase.select()
    .from('surveyinfo')
    .whereNotNull('surveysatisfactionscore')
    .orderBy('surveyid', 'asc')
    .then(surveys => {
      res.render("user/uSurvey", { user: req.normalizedUser, surveys: surveys });
    })
    .catch(err => {
      console.error("Error fetching surveys:", err);
      res.render("user/uSurvey", { user: req.normalizedUser, surveys: [] });
    });
});

// register routes
app.get("/register", (req, res) => {
  res.render("register", {
    error_message: "",
    user: req.normalizedUser
  });
});

app.post("/register", (req, res) => {
  let sName = req.body.username;
  // let sEmail = req.body.email;
  let sPassword = req.body.password;
  let sConfirmPassword = req.body.confirm_password;
  if (sPassword !== sConfirmPassword) {
    res.render("register", { error_message: "Passwords do not match", user: req.normalizedUser });
    return;
  }
  userDatabase.insert({ username: sName, password: sPassword, level: "U"})
  //email: sEmail,
  .into('users')
  .then(() => {
    res.redirect("/login");
  })
  .catch(err => {
    console.error("Register error:", err);
    res.render("register", { error_message: "Registration failed", user: req.normalizedUser });
  });
}); 

// 5️⃣ Start the server
const PORT = process.env.PORT || 3000;

// Add global error handlers BEFORE starting server to prevent crashes
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
  console.error('Stack:', reason && reason.stack);
  // Don't exit - keep server running
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  console.error('Stack:', error.stack);
  // Don't exit - keep server running
});

process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down server...');
  process.exit(0);
});

// Error handler for app.listen
const server = app.listen(PORT, (err) => {
  if (err) {
    console.error('Error starting server:', err);
    process.exit(1);
    return;
  }
  console.log(`Server running at http://localhost:${PORT}`);
  console.log('Press Ctrl+C to stop the server');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please use a different port.`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
  }
});