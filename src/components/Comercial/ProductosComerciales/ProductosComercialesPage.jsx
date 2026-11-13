// src/components/Comercial/ProductosComerciales/ProductosComercialesPage.jsx
//
// Panel administrativo de Productos Comerciales — contratos:
// docs/frontend/integration 27-8-2026/{crear,actualizar,activar-desactivar,
// consultar}-producto-comercial.md. Mismo patrón que IngredientsPage.jsx
// (único módulo previo integrado contra la API real).

import { useState } from "react";

import ProductosComercialesHeader from "./components/ProductosComercialesHeader/ProductosComercialesHeader";
import ProductosComercialesToolbar from "./components/ProductosComercialesToolbar/ProductosComercialesToolbar";
import ProductoComercialGrid from "./components/ProductoComercialGrid/ProductoComercialGrid";
import ProductoComercialForm from "./components/ProductoComercialForm/ProductoComercialForm";
import ProductoComercialDetails from "./components/ProductoComercialDetails/ProductoComercialDetails";

import Modal from "../../Modal/Modal";
import ConfirmDialog from "../../ConfirmDialog/ConfirmDialog";

import useProductosComerciales from "./hooks/useProductosComerciales";
import useProductoComercialFilters from "./hooks/useProductoComercialFilters";
import useProductosComercialesPanel from "./hooks/useProductosComercialesPanel";

import "./ProductosComercialesPage.css";

// Mensaje distinguible por código — el resto de los códigos cae en el
// genérico de `toggleError.title`, sin necesidad de anticipar cada caso
// (CONVENTIONS.md, "manejo de errores").
const TOGGLE_ERROR_MESSAGES = {

    PRODUCTO_COMERCIAL_EN_USO_POR_COMBO_ACTIVO:
        "No se puede desactivar: este producto es componente de un combo activo. Desactivá o editá primero ese combo."

};

export default function ProductosComercialesPage() {

    const {

        searchTerm,

        setSearchTerm,

        estadoFilter,

        setEstadoFilter,

        page,

        setPage,

        pageSize

    } = useProductoComercialFilters();

    const {

        loading,

        error,

        productos,

        stats,

        totalPaginas,

        createProducto,

        updateProducto,

        activarProducto,

        desactivarProducto

    } = useProductosComerciales({ searchTerm, estadoFilter, page, pageSize });

    const {

        isFormOpen,

        editingProducto,

        formSessionId,

        openCreateForm,

        openEditForm,

        closeForm,

        viewingProducto,

        openDetails,

        closeDetails,

        togglingProducto,

        openToggleConfirm,

        closeToggleConfirm

    } = useProductosComercialesPanel();

    const [formError, setFormError] = useState(null);

    const [toggleError, setToggleError] = useState(null);

    if (loading) {

        return (

            <section className="ProductosComercialesPage">

                <p>Cargando productos comerciales...</p>

            </section>

        );

    }

    function handleOpenCreateForm() {

        setFormError(null);

        openCreateForm();

    }

    function handleOpenEditForm(producto) {

        setFormError(null);

        openEditForm(producto);

    }

    async function handleSubmit(data) {

        try {

            if (editingProducto) {

                await updateProducto(editingProducto.id, data);

            } else {

                await createProducto(data);

            }

            setFormError(null);

            closeForm();

        } catch (submitError) {

            setFormError(submitError);

        }

    }

    function handleOpenToggleConfirm(producto) {

        setToggleError(null);

        openToggleConfirm(producto);

    }

    async function handleConfirmToggle() {

        const producto = togglingProducto;

        try {

            if (producto.active) {

                await desactivarProducto(producto.id);

            } else {

                await activarProducto(producto.id);

            }

            closeToggleConfirm();

        } catch (toggleErr) {

            closeToggleConfirm();

            setToggleError({

                message: TOGGLE_ERROR_MESSAGES[toggleErr.code] ?? (toggleErr.detail || toggleErr.title)

            });

        }

    }

    return (

        <section className="ProductosComercialesPage">

            <ProductosComercialesHeader
                stats={stats}
                onCreateProducto={handleOpenCreateForm}
            />

            {error && (
                <p className="ProductosComercialesPage-Error">{error}</p>
            )}

            {toggleError && (

                <div className="ProductosComercialesPage-Notice">

                    <p>{toggleError.message}</p>

                    <button
                        type="button"
                        onClick={() => setToggleError(null)}
                        aria-label="Cerrar aviso"
                    >
                        ✕
                    </button>

                </div>

            )}

            <ProductosComercialesToolbar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                estadoFilter={estadoFilter}
                onEstadoFilterChange={setEstadoFilter}
                onCreateProducto={handleOpenCreateForm}
            />

            <ProductoComercialGrid
                productos={productos}
                onAddNew={handleOpenCreateForm}
                onOpenDetails={openDetails}
                onEdit={handleOpenEditForm}
                onToggleActive={handleOpenToggleConfirm}
            />

            <div className="ProductosComercialesPage-Pagination">

                <button
                    type="button"
                    onClick={() => setPage(current => current - 1)}
                    disabled={page === 0}
                >
                    ← Anterior
                </button>

                <span>Página {page + 1} de {Math.max(totalPaginas, 1)}</span>

                <button
                    type="button"
                    onClick={() => setPage(current => current + 1)}
                    disabled={page + 1 >= totalPaginas}
                >
                    Siguiente →
                </button>

            </div>

            <Modal
                isOpen={isFormOpen}
                onClose={closeForm}
                title={editingProducto ? `Editar ${editingProducto.name}` : "Nuevo producto comercial"}
            >

                <ProductoComercialForm
                    key={formSessionId}
                    initialData={editingProducto}
                    submitError={formError}
                    onCancel={closeForm}
                    onSubmit={handleSubmit}
                />

            </Modal>

            <Modal
                isOpen={!!viewingProducto}
                onClose={closeDetails}
                title={viewingProducto?.name ?? ""}
            >

                {viewingProducto && <ProductoComercialDetails producto={viewingProducto} />}

            </Modal>

            <ConfirmDialog
                isOpen={!!togglingProducto}
                title={togglingProducto?.active ? "Desactivar producto" : "Activar producto"}
                message={
                    togglingProducto?.active
                        ? `¿Seguro que querés desactivar "${togglingProducto?.name}"? Dejará de aparecer en el catálogo público.`
                        : `¿Querés activar "${togglingProducto?.name}"? Volverá a aparecer en el catálogo público.`
                }
                confirmLabel={togglingProducto?.active ? "Desactivar" : "Activar"}
                cancelLabel="Cancelar"
                variant={togglingProducto?.active ? "danger" : "default"}
                irreversible={false}
                onConfirm={handleConfirmToggle}
                onCancel={closeToggleConfirm}
            />

        </section>

    );

}
