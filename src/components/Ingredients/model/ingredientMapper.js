// src/components/Ingredients/model/ingredientMapper.js
//
// Adapta el ingrediente tal como lo entrega la API (ver GET /ingredients en
// docs/frontend/integration/ingredients.md) al modelo que consume la UI. La
// UI nunca debe leer directamente el DTO — ni siquiera los componentes
// conocen que "unit" sale de dto.unidadMedida.abreviatura o que "stockLevel"
// no es un campo real de la API.

// SIN_STOCK/NECESITA_REPOSICION/CON_STOCK es información puramente visual:
// la API nunca envía esta categoría, sólo cantidadActual/stockMinimo/
// necesitaReposicion. Se deriva acá aplicando exactamente la partición que
// el propio backend documenta para su filtro `inventario` (sin inventar
// umbrales propios) — ver "Decisiones tomadas" en el documento de arriba.
function deriveStockLevel(stock) {

    if (stock.cantidadActual === 0) return "SIN_STOCK";

    if (stock.necesitaReposicion) return "NECESITA_REPOSICION";

    return "CON_STOCK";

}

export function mapIngredientToCard(dto) {

    const stock = dto.stock ?? {};

    return {

        id: dto.id,

        name: dto.nombre,

        quantity: stock.cantidadActual,

        unit: dto.unidadMedida?.abreviatura ?? "",

        // Necesario para poder preseleccionar la unidad actual en el
        // selector real de IngredientForm (Etapa 3) y para poder armar el
        // body de PUT /ingredients/{id} — "unit" (abreviatura) sólo sirve
        // para mostrar, nunca para reconstruir el id real.
        unitId: dto.unidadMedida?.id ?? null,

        minStock: stock.stockMinimo,

        stockLevel: deriveStockLevel(stock),

        description: dto.descripcion ?? ""

    };

}

// UI → DTO: arma el body de POST /ingredients a partir del payload que
// entrega useIngredientForm.buildIngredientPayload(). stockMinimo y
// stockInicial son opcionales en el alta (ver docs/frontend/integration/
// ingredients.md) — se omiten por completo si el usuario no los completó,
// en vez de enviar 0 o null.
export function mapFormToCreateRequest(payload) {

    const request = {

        nombre: payload.name,

        unidadMedidaId: payload.unitId,

        descripcion: payload.description || null

    };

    if (payload.minStock != null) request.stockMinimo = payload.minStock;

    if (payload.quantity != null && payload.quantity > 0) {

        request.stockInicial = { cantidad: payload.quantity };

    }

    return request;

}

// UI → DTO: arma el body de PUT /ingredients/{id}. A diferencia del alta,
// stockMinimo es obligatorio acá y no existe ningún campo de stock inicial
// — el backend no acepta modificar el stock actual por esta vía.
export function mapFormToUpdateRequest(payload) {

    return {

        nombre: payload.name,

        descripcion: payload.description || null,

        unidadMedidaId: payload.unitId,

        stockMinimo: payload.minStock

    };

}
