# Workflow: Corregir un Bug

## 1. Reproducir el bug

Antes de tocar código:
- ¿En qué ruta aparece?
- ¿Desktop, mobile, o ambos?
- ¿Siempre o intermitente?
- ¿Hay error en consola?

## 2. Localizar la causa

Para bugs visuales (CSS):
- Inspeccionar con DevTools — identificar qué clase o regla causa el problema.
- Buscar el archivo CSS con `grep` antes de editarlo.

Para bugs de comportamiento (JS/React):
- Revisar el componente y sus props.
- Verificar si hay un `useEffect` con dependencias incorrectas.
- Revisar si el estado se actualiza correctamente.

Para bugs de rutas:
- Verificar en `src/routes/AppRoutes.jsx`.
- Verificar que el componente de página exporta `default`.

## 3. Aplicar el fix mínimo

Cambiar solo lo necesario para resolver el bug. No refactorizar en el mismo commit.

## 4. Verificar que no se rompió nada más

- Navegar manualmente las rutas relacionadas.
- Revisar desktop y mobile.
- Confirmar que el bug no aparece en otras páginas similares (ej: si se rompe en Shogun, verificar Leyendas 4.0).

## Bugs frecuentes en este proyecto

| Síntoma | Causa común |
|---------|-------------|
| Layout roto en mobile | `flex-between` sin `flex-direction: column` en `@media (max-width: 768px)` |
| Imagen no carga | Ruta relativa incorrecta en `src/assets/` |
| Animación no se dispara | `viewport={{ once: true }}` + scroll ya pasado antes de montar |
| Texto desbordado | Falta `text-wrap: balance` o `overflow: hidden` |
| Carrusel sin funcionar | Embla no inicializado — revisar el hook `useEmblaCarousel` |
