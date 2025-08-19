export const insertParameterizer = (obj: Record<string, any>): string => {
  const keys = Object.keys(obj);
  const columns = keys.join(", ");
  const values = keys.map((key) => `:${key}`).join(", ");
  return `(${columns}) VALUES (${values})`;
};

export const updateParameterizer = (obj: Record<string, any>): string => {
  return Object.keys(obj)
    .map((key) => `${key}=:${key}`)
    .join(", ");
};
