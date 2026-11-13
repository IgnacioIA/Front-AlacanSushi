// src/components/Comercial/CombosComerciales/components/ComboComponentesPicker/ComboComponentesPicker.jsx
//
// Fila por componente: selector de Producto Comercial (activo) + cantidad.
// `productosDisponibles` llega desde useActiveProductosComerciales — sin
// sustitutos ni combos anidados (V1-COMMERCIAL-CATALOG.md §7): el <select>
// sólo ofrece Productos Comerciales, nunca otro Combo.

import "./ComboComponentesPicker.css";

export default function ComboComponentesPicker({

    componentes,

    productosDisponibles,

    loadingProductos,

    error,

    onAdd,

    onUpdate,

    onRemove

}) {

    return (

        <div className="ComboComponentesPicker">

            <div className="ComboComponentesPicker-Header">

                <span>Componentes</span>

                <button
                    type="button"
                    className="ComboComponentesPicker-AddButton"
                    onClick={onAdd}
                    disabled={loadingProductos}
                >
                    + Agregar producto
                </button>

            </div>

            {componentes.length === 0 && (

                <p className="ComboComponentesPicker-Empty">
                    Todavía no agregaste ningún producto a este combo.
                </p>

            )}

            {componentes.map((componente, index) => (

                <div className="ComboComponentesPicker-Row" key={index}>

                    <select
                        value={componente.productoComercialId}
                        onChange={event => onUpdate(index, { productoComercialId: event.target.value })}
                        aria-label="Producto comercial"
                    >
                        <option value="" disabled>Seleccionar producto...</option>
                        {productosDisponibles.map(producto => (
                            <option key={producto.id} value={producto.id}>
                                {producto.name}
                            </option>
                        ))}
                    </select>

                    <input
                        type="number"
                        min="1"
                        step="1"
                        value={componente.quantity}
                        onChange={event => onUpdate(index, { quantity: event.target.value })}
                        aria-label="Cantidad"
                        placeholder="Cant."
                    />

                    <button
                        type="button"
                        className="ComboComponentesPicker-RemoveButton"
                        onClick={() => onRemove(index)}
                        aria-label="Quitar componente"
                    >
                        ✕
                    </button>

                </div>

            ))}

            {error && (
                <small className="ComboComponentesPicker-Error">{error}</small>
            )}

        </div>

    );

}
