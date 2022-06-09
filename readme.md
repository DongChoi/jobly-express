# Jobly Backend

This is the Express backend for Jobly.
View working demo [here](https://jobly-backend-robyn.herokuapp.com/companies).

### Technologies
- Express
- JWT
- Bcrypt
- PostgreSQL
- Jest

_This application was created for an exercise as part of the curriculum by [Rithm School](https://www.rithmschool.com/). The front end was later created as a separate exericsed [here](https://github.com/robynlgy/react-jobly). Pair programmed with [Andrew Choi](https://github.com/DongChoi)._

To run this:

    node server.js

To run the tests with coverage:

    jest -i --coverage


Available Routes:
|Route | Method(s) | Auth |
| :--- | :--- | :--- |
| /auth/token | POST | None |
| /auth/register | POST | None |
| /companies | GET, POST | None, Admin |
| /companies:handle | GET, PATCH, DELETE | None, Admin, Admin |
| /jobs | GET, POST | None, Admin |
| /jobs:id | GET, PATCH, DELETE | None, Admin, Admin |
| /users | GET, POST | Admin |
| /users/:username | GET, PATCH, DELETE | Admin or current user |


