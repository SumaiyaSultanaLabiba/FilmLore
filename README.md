
# `FilmLore: A Movieverse`

An end-to-end full-stack application developed as the **CSE-216 | Database** course term project for Level-2, Term-1 at **BUET**, by **Tarana Ahmed (2305040)** and **Sumaiya Sultana Labiba (2305044)**.


## Tech Stack

- **Database:** PostgreSQL 
- **Backend:** Node.js, Express.js 
- **Frontend:** React, Tailwind CSS

---

## How to Run Locally

Follow these steps to set up and run the project on your machine.

### 1. Clone the Repository
If you are accessing this from our academic submission on Moodle, all required files are already included.  
Otherwise, open your terminal and run:
```bash
git clone https://github.com/SumaiyaSultanaLabiba/FilmLore.git
cd FilmLore
```

### 2. Database Setup (Postgres on NeonDB)

Create a new project on your NeonDB account. You will be provided with a connection string. From this string, extract the following four values and place them in your .env file: PGUSER, PGPASSWORD, PGHOST, and PGDATABASE.

Example connection string:
```bash
psql 'postgresql://{PGUSER}:{PGPASSWORD}@{PGHOST}/{PGDATABASE}?sslmode=require&channel_binding=require'
```

#### Additional Environment Variables

There are two other required fields in your .env file: EMAIL_USER and EMAIL_PASS.

Set EMAIL_USER to an email address that is logged in on your machine.

For EMAIL_PASS, you cannot simply use your Gmail account password. Instead, generate an App Password from your Gmail account settings and use that here.

Your .env should be like this:
```bash
PORT = 5004

PGUSER = ''
PGPASSWORD = ''
PGHOST = ''
PGDATABASE = ''

TOKEN_SECRET=mySuperSecretKey123

EMAIL_USER=
EMAIL_PASS=
```
Now keep your .env at the project root.

For your convenience, all necessary dependencies are already provided, so you do not need to install anything manually.

Finally, open http://localhost:5173 in your browser. InshaAllah, you will see the application running smoothly. Sign up as a user or admin, add new media, and create your own movieverse!


### Explore Our Movieverse

If you would like to explore our hosted site, please follow the link: []()
