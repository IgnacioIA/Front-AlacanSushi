# Workflow: Refactorizar un Componente

## Cuándo entrar a este workflow

- El componente tiene más de ~80 líneas de JSX y hay partes claramente separables.
- Hay CSS duplicado entre dos secciones de distintas páginas.
- Un patrón (ej: `BuyABox`, `Novedades`) se repite en cada expansión con pequeñas diferencias.

## Paso a paso

### 1. Leer todo antes de tocar nada

Leer el componente completo, su CSS, y todos los sitios donde se usa.

### 2. Identificar qué varía y qué es fijo

Ejemplo para `BuyABox` de Shogun vs Leyendas 4.0:
- **Varía**: título, slides de cartas, colores de glow.
- **Fijo**: estructura HTML, animación de carrusel, controles.

Lo que varía → props. Lo que es fijo → queda en el componente.

### 3. Crear el componente genérico

Si aplica a múltiples páginas: crear en `src/components/[nombre]/`.
Si es solo una página más compleja: partir dentro de `sections/`.

### 4. Migrar una instancia primero

Reemplazar solo **uno** de los usos, verificar visualmente que funciona igual.
Luego reemplazar el segundo.

### 5. Eliminar los originales

Una vez que ambas instancias usan el nuevo componente, eliminar los archivos duplicados.

### 6. Verificar

- [ ] Desktop y mobile se ven igual que antes.
- [ ] No hay warnings nuevos en consola.
- [ ] El bundle no creció innecesariamente.

## Regla de oro

Si el componente genérico necesita más de 4-5 props o un `switch` para decidir qué renderizar,
probablemente la duplicación era mejor. Revertir.
