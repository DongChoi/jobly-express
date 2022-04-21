const { BadRequestError } = require("../expressError");

/** Accepts object with fields required to be updated,
 *  fields are renamed to their database counterparts if needed,
 *  and returns object formatted for SQL UPDATE query.
 *
 *  Throws BadRequestError if data is empty.
 *
 * @param {Object} dataToUpdate - user input object
 * @param {Object} jsToSql - schema of model
 *
 * @return {Object} - setCol: query string of keys with index placeholder
 * - values: array of values to be updated
 * */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate); // [firstName, email]
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map(
    (colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`
  );

  return {
    setCols: cols.join(", "), // '"first_name"=$1,"age"=$2'
    values: Object.values(dataToUpdate), // ['Aliya',32]
  };
}

/** Accepts object with fields to be searched,
 *  and returns object formatted for SQL WHERE clause.
 *
 * @param {Object} dataToSearch - user input object
 * @param {Object} jsToSql - SQL operation statements
 *
 * @return {Object} - setWheres: query string of keys with index placeholder
 * - values: array of values filter
 * */

function sqlForFilter(dataToSearch, jsToSql) {
  let setWheres = "";
  const keys = Object.keys(dataToSearch); // ["name","minEmployees","maxEmployees"]

  if (keys.length > 0) {
    // {name:"new", minEmployees: 5, maxEmployees : 10} =>
    // ['name ILIKE $1', 'num_employees > $2', 'num_employees < $3']
    wheres = keys.map(
      (colName, idx) => `${jsToSql[colName] || " "}$${idx + 1}`
    );
    setWheres = "WHERE " + wheres.join(" AND ");

    if (dataToSearch.name) {
      dataToSearch.name = `%${dataToSearch.name}%`;
    }
  }

  return {
    setWheres, // '"num_employees">$1' AND '"num_employees"<$2'
    values: Object.values(dataToSearch), // [5,10]
  };
}

module.exports = { sqlForPartialUpdate, sqlForFilter };
