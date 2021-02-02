export default {
  arrayCursor,
}

const arrayCursor = function(array, idx) {
  if (!Array.isArray(array)) {
    const error = "`array` should be array"
    console.error(error)
    return {
      error,
    }
  }
  if (idx !== undefined) {
    if (typeof idx !== "number") {
      const error = "`idx` should be an integer"
      console.error(error)
      return {
        error,
      }
    }
    if (idx % 1 !== 0) {
      const error = "`idx` should be an integer"
      console.error(error)
      return {
        error,
      }
    }
    if (idx < 0) {
      const error = "`idx` should be greater than 0"
      console.log(error)
      return {
        error,
      }
    }
    if (idx >= array.length) {
      const error = "`idx` should not be greater than `array.length`"
      console.log(error)
      return {
        error,
      }
    }
  } else {
    idx = 0
  }
  return {
    get array() {
      return array
    },
    get hasNext() {
      return idx < array.lenght - 1
    },
    get index() {
      return idx
    },
    get value() {
      return array[idx]
    },
    get next() {
      if (this.hasNext) {
        return {
          value: array[idx++],
          idx,
        }
      } else {
        const error = "`idx` is out of range"
        console.log(error)
        return {
          error,
        }
      }
    },
    get nextCursor() {
      if (this.hasNext) {
        return {
          nextCursor: arrayCursor(array, idx + 1),
          idx,
        }
      } else {
        const error = "`idx` is out of range"
        console.log(error)
        return {
          error,
        }
      }
    },
  }
}
