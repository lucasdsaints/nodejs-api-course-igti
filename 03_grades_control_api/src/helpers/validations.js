function extractFromBody(object, field, type) {
  if (
    object[field] === undefined ||
    object[field] === null ||
    typeof(object[field]) !== type
  ) {
    return null;
  }

  if (typeof(object[field]) === 'string' && object[field].length === 0) {
    return null;
  }

  return object[field];
}

export default extractFromBody;