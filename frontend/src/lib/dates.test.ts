import { describe, expect, it } from "vitest";
import { formatDateTime, parseServerTimestamp, shiftDateKey, todayKey, toDateKey } from "./dates";

describe("fechas en hora de Colombia", () => {
  it("a las 8 p. m. en Bogotá sigue siendo el mismo día (en UTC ya es el siguiente)", () => {
    // 2026-10-26 20:00 en Bogotá = 2026-10-27 01:00 UTC
    const noche = new Date("2026-10-27T01:00:00Z");
    expect(noche.toISOString().slice(0, 10)).toBe("2026-10-27");
    expect(todayKey(noche)).toBe("2026-10-26");
  });

  it("a medianoche en Bogotá cambia el día", () => {
    expect(toDateKey(new Date("2026-10-27T04:59:59Z"))).toBe("2026-10-26");
    expect(toDateKey(new Date("2026-10-27T05:00:00Z"))).toBe("2026-10-27");
  });

  it("suma y resta días cruzando meses y años", () => {
    expect(shiftDateKey("2026-03-01", -1)).toBe("2026-02-28");
    expect(shiftDateKey("2026-12-31", 1)).toBe("2027-01-01");
    expect(shiftDateKey("2026-10-26", -13)).toBe("2026-10-13");
  });

  it("interpreta las marcas de tiempo de SQLite como UTC", () => {
    expect(parseServerTimestamp("2026-10-26 22:15:00").toISOString()).toBe("2026-10-26T22:15:00.000Z");
    expect(parseServerTimestamp("2026-10-26T22:15:00Z").toISOString()).toBe("2026-10-26T22:15:00.000Z");
    expect(parseServerTimestamp(Date.UTC(2026, 9, 26, 22, 15)).toISOString()).toBe("2026-10-26T22:15:00.000Z");
  });

  it("muestra la hora de Colombia (UTC-5)", () => {
    const texto = formatDateTime("2026-10-26 22:15:00");
    expect(texto).toContain("26");
    expect(texto).toMatch(/5:15/);
  });
});
