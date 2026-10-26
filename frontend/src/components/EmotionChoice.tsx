import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  EMOTION_TYPE_LABEL,
  describeForScreenReader,
  getEmotionInfo,
  type EmotionInfo,
} from "@/data/emotions";
import { cn } from "@/lib/utils";

const HOVER_OPEN_MS = 350;
const HOVER_CLOSE_MS = 150;
const LONG_PRESS_MS = 500;

type Props = {
  emotionId: string;
  selected?: boolean;
  onSelect: () => void;
  /** Clases del botón principal (cada selector conserva su estilo). */
  className?: string;
  /** Contenido visible del botón (emoji y nombre). */
  children: ReactNode;
};

/**
 * Botón de emoción con una ficha de ayuda (definición + 3 ejemplos) que se
 * puede consultar ANTES de marcarla:
 * - Escritorio: pasar el mouse sobre la emoción.
 * - Móvil: toque largo sobre la emoción, o tocar el ícono ⓘ.
 * - Teclado: Tab hasta el ícono ⓘ y Enter/Espacio; Esc cierra.
 * - Lectores de pantalla: la definición y ejemplos se anuncian con
 *   aria-describedby al enfocar el botón de la emoción.
 */
export function EmotionChoice({ emotionId, selected, onSelect, className, children }: Props) {
  const info = getEmotionInfo(emotionId);
  const descId = useId();
  const [open, setOpen] = useState(false);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressed = useRef(false);
  // Fijada por clic/toque: el cierre por hover no la cierra.
  const pinned = useRef(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const clearHover = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = null;
  };
  const clearPress = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
    pressTimer.current = null;
  };

  useEffect(
    () => () => {
      clearHover();
      clearPress();
    },
    [],
  );

  if (!info) {
    // Emoción sin ficha: se comporta como el botón original.
    return (
      <button type="button" onClick={onSelect} aria-pressed={selected} className={className}>
        {children}
      </button>
    );
  }

  const hoverOpen = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    clearHover();
    hoverTimer.current = setTimeout(() => setOpen(true), HOVER_OPEN_MS);
  };
  const hoverClose = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || pinned.current) return;
    clearHover();
    hoverTimer.current = setTimeout(() => setOpen(false), HOVER_CLOSE_MS);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (!next) pinned.current = false;
        setOpen(next);
      }}
    >
      <div
        ref={wrapperRef}
        className="relative"
        onPointerEnter={hoverOpen}
        onPointerLeave={hoverClose}
      >
        <button
          type="button"
          aria-pressed={selected}
          aria-describedby={descId}
          className={cn("select-none [-webkit-touch-callout:none]", className)}
          onClick={() => {
            // Un toque largo solo muestra la ficha; no marca la emoción.
            if (longPressed.current) {
              longPressed.current = false;
              return;
            }
            onSelect();
          }}
          onPointerDown={(e) => {
            if (e.pointerType === "mouse") return;
            longPressed.current = false;
            clearPress();
            pressTimer.current = setTimeout(() => {
              longPressed.current = true;
              pinned.current = true;
              setOpen(true);
            }, LONG_PRESS_MS);
          }}
          onPointerUp={clearPress}
          onPointerCancel={clearPress}
          onPointerMove={(e) => {
            // Si el dedo se desplaza (scroll), no es un toque largo.
            if (
              e.pointerType !== "mouse" &&
              (Math.abs(e.movementX) > 4 || Math.abs(e.movementY) > 4)
            ) {
              clearPress();
            }
          }}
          onContextMenu={(e) => {
            if (longPressed.current) e.preventDefault();
          }}
        >
          {children}
        </button>

        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={`Ver ejemplos de ${info.nombre}`}
            onClick={(e) => {
              clearHover();
              // Si ya se abrió al pasar el mouse, el clic la deja fija en vez de cerrarla.
              if (open && !pinned.current) e.preventDefault();
              pinned.current = true;
            }}
            className="absolute top-0.5 right-0.5 grid h-6 w-6 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Info className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </PopoverTrigger>

        <span id={descId} className="sr-only">
          {describeForScreenReader(info)}
        </span>
      </div>

      <PopoverContent
        side="top"
        className="w-72 rounded-2xl p-4 text-left"
        aria-label={`Qué es ${info.nombre.toLowerCase()}`}
        // La ficha es solo de lectura: no se roba el foco del selector.
        onOpenAutoFocus={(e) => e.preventDefault()}
        // Tocar/enfocar la propia emoción (p. ej. al soltar un toque largo) no cierra la ficha.
        onInteractOutside={(e) => {
          if (wrapperRef.current?.contains(e.target as Node)) e.preventDefault();
        }}
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") clearHover();
        }}
        onPointerLeave={hoverClose}
      >
        <EmotionCard info={info} />
      </PopoverContent>
    </Popover>
  );
}

export function EmotionCard({ info }: { info: EmotionInfo }) {
  return (
    <div className="space-y-2.5 text-sm">
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-semibold text-foreground">
          <span aria-hidden="true">{info.emoji}</span> {info.nombre}
        </p>
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
          {EMOTION_TYPE_LABEL[info.tipo]}
        </span>
      </div>
      <p className="text-foreground/90 leading-snug">{info.definicion}</p>
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-1">Puede que la sientas si…</p>
        <ul className="space-y-1 text-foreground/90">
          {info.ejemplos.map((ej) => (
            <li key={ej} className="flex gap-1.5 leading-snug">
              <span aria-hidden="true" className="text-primary">
                •
              </span>
              {ej}
            </li>
          ))}
        </ul>
      </div>
      {info.diferencias?.map((d) => {
        const other = getEmotionInfo(d.id);
        if (!other) return null;
        return (
          <p
            key={d.id}
            className="text-xs text-muted-foreground leading-snug border-t border-border/60 pt-2"
          >
            <span className="font-medium text-foreground/80">
              ¿O es {other.nombre.toLowerCase()}?
            </span>{" "}
            {d.texto}
          </p>
        );
      })}
    </div>
  );
}
