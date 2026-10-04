// Next id = highest existing id + 1, so ids are never reused after a delete
const generateId = (collection) => {
  return collection.reduce((max, item) => Math.max(max, item.id), 0) + 1
}

// Never send password hashes back to the client
const removePassword = (user) => {
  if (!user) return null
  const { password, ...safeUser } = user
  return safeUser
}

module.exports = { generateId, removePassword }
