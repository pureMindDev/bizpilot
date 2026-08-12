export const withId = (doc) => (doc ? { ...doc, id: doc._id ?? doc.id } : doc);
export const withIds = (docs) => (docs || []).map(withId);
