const { ObjectId } = require("mongodb");

// Compare old values vs new values and save one log per changed field
async function logChanges(db, horseId, userId, oldDoc, newValues) {
  const logs = [];

  Object.keys(newValues).forEach(field => {
    const oldValue = oldDoc[field] ?? "";
    const newValue = newValues[field] ?? "";

    // Only log fields that actually changed
    if (oldValue !== newValue) {
      logs.push({
        field,
        date: new Date(),
        user_id: userId,
        old_value: oldValue,
        new_value: newValue,
        horse_id: new ObjectId(horseId)
      });
    }
  });

  if (logs.length > 0) {
    await db.collection("change_logs").insertMany(logs);
  }
}

module.exports = { logChanges };