/**
 * Return true if the two values are deep equal.
 */
function deepEqual(value1, value2) {
  if (value1 instanceof Date && value2 instanceof Date) {
    return value1.getTime() === value2.getTime();
  } else if (isPlainObject(value1) && isPlainObject(value2)) {
    const keys1 = Object.keys(value1);
    const keys2 = Object.keys(value2);
    if (keys1.length !== keys2.length) {
      return false;
    }
    for (const key of keys1) {
      if (!deepEqual(value1[key], value2[key])) {
        return false;
      }
    }
    return true;
  } else {
    return value1 === value2;
  }
}

/**
 * Return a dictionary of flags indicating which of the indicated changes to the
 * state are actually substantive changes.
 */
function fieldsChanged(state, changes) {
  const changed = {};
  for (const field in changes) {
    if (!deepEqual(changes[field], state[field])) {
      changed[field] = true;
    }
  }
  return changed;
}

/**
 * Return true if the object is a plain JavaScript object.
 */
export function isPlainObject(obj) {
  // From https://stackoverflow.com/q/51722354/76472
  if (typeof obj !== "object" || obj === null) {
    return false;
  }
  let proto = obj;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }
  return Object.getPrototypeOf(obj) === proto;
}

/**
 * Given a current state and changes to apply, apply the changes and return both
 * the new state and a dictionary of flags indicating which of the changes are
 * substantive.
 */
export default function updateState(state, changes) {
  const changed = fieldsChanged(state, changes);
  const newState = Object.assign(state, changes);
  return { newState, changed };
}
