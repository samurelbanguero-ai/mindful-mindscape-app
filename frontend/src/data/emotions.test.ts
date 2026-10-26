import { describe, expect, it } from "vitest";
import { MOODS } from "@/lib/mood";
import { EMOTIONS, describeForScreenReader, getEmotionInfo } from "./emotions";

// Términos diagnósticos que no deben aparecer en fichas pensadas para
// estudiantes que rechazan etiquetas clínicas.
const CLINICAL_TERMS = /trastorno|diagn[oó]stic|patolog|s[ií]ntoma|cl[ií]nic|depresi[oó]n|tag\b/i;

describe("datos de emociones", () => {
  it("tiene una ficha por cada emoción de MOODS, sin ids repetidos", () => {
    const ids = EMOTIONS.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect([...ids].sort()).toEqual(MOODS.map((m) => m.id).sort());
  });

  it("mantiene nombre y emoji iguales a MOODS", () => {
    for (const m of MOODS) {
      const info = getEmotionInfo(m.id);
      expect(info?.nombre, m.id).toBe(m.label);
      expect(info?.emoji, m.id).toBe(m.emoji);
    }
  });

  it("cada ficha tiene definición y 3 ejemplos no vacíos y distintos", () => {
    for (const e of EMOTIONS) {
      expect(e.definicion.trim().length, e.id).toBeGreaterThan(10);
      expect(e.ejemplos, e.id).toHaveLength(3);
      expect(new Set(e.ejemplos).size, e.id).toBe(3);
      for (const ej of e.ejemplos) expect(ej.trim().length, e.id).toBeGreaterThan(5);
    }
  });

  it("solo alegría, tristeza, miedo y enojo son básicas", () => {
    const basicas = EMOTIONS.filter((e) => e.tipo === "basica").map((e) => e.id);
    expect(basicas.sort()).toEqual(["alegria", "enojo", "miedo", "tristeza"]);
  });

  it("las diferencias apuntan a emociones que existen", () => {
    for (const e of EMOTIONS) {
      for (const d of e.diferencias ?? []) {
        expect(getEmotionInfo(d.id), `${e.id} → ${d.id}`).toBeDefined();
        expect(d.id).not.toBe(e.id);
      }
    }
  });

  it("distingue las emociones que suelen confundirse", () => {
    const pares: [string, string][] = [
      ["ansiedad", "preocupacion"],
      ["ansiedad", "miedo"],
      ["tristeza", "soledad"],
      ["tristeza", "cansancio"],
    ];
    for (const [a, b] of pares) {
      const ab = getEmotionInfo(a)?.diferencias?.some((d) => d.id === b);
      const ba = getEmotionInfo(b)?.diferencias?.some((d) => d.id === a);
      expect(ab || ba, `${a} / ${b}`).toBe(true);
    }
  });

  it("no usa lenguaje clínico", () => {
    for (const e of EMOTIONS) {
      const texto = [
        e.definicion,
        ...e.ejemplos,
        ...(e.diferencias ?? []).map((d) => d.texto),
      ].join(" ");
      expect(texto, e.id).not.toMatch(CLINICAL_TERMS);
    }
  });

  it("todo el contenido está marcado como pendiente de validación", () => {
    expect(EMOTIONS.every((e) => e.validado === false)).toBe(true);
  });

  it("genera la descripción accesible con tipo, definición y ejemplos", () => {
    const ansiedad = getEmotionInfo("ansiedad")!;
    const texto = describeForScreenReader(ansiedad);
    expect(texto).toContain("Emoción compleja");
    expect(texto).toContain(ansiedad.definicion);
    for (const ej of ansiedad.ejemplos) expect(texto).toContain(ej);
  });
});
