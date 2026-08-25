import neo4j from "neo4j-driver";
import { driver } from "./driver";

function normalizeNeo4jValue(value: unknown): unknown {
  if (neo4j.isInt(value)) {
    return value.toNumber();
  }

  if (Array.isArray(value)) {
    return value.map(normalizeNeo4jValue);
  }

  if (
    value !== null &&
    typeof value === "object"
  ) {
    return Object.fromEntries(
      Object.entries(value).map(([key, value]) => [
        key,
        normalizeNeo4jValue(value),
      ]),
    );
  }

  return value;
}

export async function runQuery<T = unknown>(
  query: string,
  parameters: Record<string, unknown> = {},
): Promise<T[]> {
  const session = driver.session();

  try {
    const result = await session.run(
      query,
      parameters,
    );

    return result.records.map((record) => {
      const object = record.toObject();

      return normalizeNeo4jValue(object) as T;
    });
  } finally {
    await session.close();
  }
}