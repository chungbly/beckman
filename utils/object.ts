export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  if (typeof obj !== "object" || obj === null) {
    throw new Error("Input must be a non-null object.");
  }

  return Object.entries(obj)
    .filter(
      ([_, value]) => value !== null && value !== undefined && value !== ""
    )
    .reduce((acc, [key, value]) => {
      if (typeof value === "object" && !Array.isArray(value)) {
        // Recursively sanitize nested objects
        const sanitizedValue = sanitizeObject(value);
        if (Object.keys(sanitizedValue).length > 0) {
          (acc as Record<string, any>)[key] = sanitizedValue;
        }
      } else if (Array.isArray(value)) {
        // Sanitize arrays by removing falsy values
        const sanitizedArray = value.filter(
          (v) => v !== null && v !== undefined && v !== ""
        );
        if (sanitizedArray.length > 0) {
          (acc as Record<string, any>)[key] = sanitizedArray;
        }
      } else {
        (acc as Record<string, any>)[key] = value;
      }
      return acc;
    }, {} as T);
}