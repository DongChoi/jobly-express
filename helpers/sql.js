const { BadRequestError } = require("../expressError");

/** Accepts object with fields required to be updated,
 *  fields are renamed to their database counterparts if needed,
 *  and returns object formatted for SQL UPDATE query.
 *
 * @param {Object} dataToUpdate - user input object
 * @param {Object} jsToSql - schema of model
 *
 * @return {Object} - setCol: query string of keys with index
 * - values: array of values
 *
 * Throws BadRequestError if data is empty.
 * */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map(
    (colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
