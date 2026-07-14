// src/components/Ingredients/IngredientsPage.jsx

import { useState } from "react";

import IngredientsHeader from "./components/IngredientsHeader/IngredientsHeader";
import IngredientsToolbar from "./components/IngredientsToolbar/IngredientsToolbar";
import IngredientGrid from "./components/IngredientGrid/IngredientGrid";
import IngredientForm from "./components/IngredientForm/IngredientForm";
import IngredientDetails from "./components/IngredientDetails/IngredientDetails";

import Modal from "../Modal/Modal";
import ConfirmDialog from "../ConfirmDialog/ConfirmDialog";

import useIngredients from "./hooks/useIngredients";
import useIngredientFilters from "./hooks/useIngredientFilters";
import useIngredientsPanel from "./hooks/useIngredientsPanel";

import "./IngredientsPage.css";

export default function IngredientsPage() {

    const {

        searchTerm,

        setSearchTerm,

        stockFilter,

        setStockFilter,

        sortBy,

        setSortBy,

        page,

        setPage,

        pageSize

    } = useIngredientFilters();

    const {

        loading,

        ingredients,

        stats,

        totalPages,

        createIngredient,

        updateIngredient,

        deactivateIngredient

    } = useIngredients({ searchTerm, stockFilter, sortBy, page, pageSize });

    const {

        isFormOpen,

        editingIngredient,

        formSessionId,

        openCreateForm,

        openEditForm,

        closeForm,

        viewingIngredient,

        openDetails,

        closeDetails,

        deactivatingIngredient,

        openDeactivateConfirm,

        closeDeactivateConfirm

    } = useIngredientsPanel();

    const [formError, setFormError] = useState(null);

    const [deactivationNotice, setDeactivationNotice] = useState(null);

    if (loading) {

        return (

            <section className="IngredientsPage">

                <p>Cargando ingredientes...</p>

            </section>

        );

    }

    function handleOpenCreateForm() {

        setFormError(null);

        openCreateForm();

    }

    function handleOpenEditForm(ingredient) {

        setFormError(null);

        openEditForm(ingredient);

    }

    async function handleSubmit(data) {

        try {

            if (editingIngredient) {

                await updateIngredient(editingIngredient.id, data);

            } else {

                await createIngredient(data);

            }

            setFormError(null);

            closeForm();

        } catch (submitError) {

            // Error normalizado por apiError.js — se muestra dentro del
            // propio IngredientForm (no acá) para que quede junto al campo
            // que corresponda cuando el `code` lo permite.
            setFormError(submitError);

        }

    }

    async function handleConfirmDeactivate() {

        const deactivatedName = deactivatingIngredient.name;

        const result = await deactivateIngredient(deactivatingIngredient.id);

        closeDeactivateConfirm();

        if (result?.recetasActivasQueLoUtilizan > 0) {

            setDeactivationNotice({

                name: deactivatedName,

                count: result.recetasActivasQueLoUtilizan

            });

        }

    }

    return (

        <section className="IngredientsPage">

            <IngredientsHeader
                stats={stats}
                onCreateIngredient={handleOpenCreateForm}
            />

            {deactivationNotice && (

                <div className="IngredientsPage-Notice">

                    <p>
                        "{deactivationNotice.name}" se desactivó. Se estaba usando
                        en {deactivationNotice.count} receta{deactivationNotice.count === 1 ? "" : "s"} activa{deactivationNotice.count === 1 ? "" : "s"}.
                    </p>

                    <button
                        type="button"
                        onClick={() => setDeactivationNotice(null)}
                        aria-label="Cerrar aviso"
                    >
                        ✕
                    </button>

                </div>

            )}

            <IngredientsToolbar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                stockFilter={stockFilter}
                onStockFilterChange={setStockFilter}
                sortBy={sortBy}
                onSortChange={setSortBy}
                onCreateIngredient={handleOpenCreateForm}
            />

            <IngredientGrid
                ingredients={ingredients}
                onAddNew={handleOpenCreateForm}
                onOpenDetails={openDetails}
                onEdit={handleOpenEditForm}
                onDeactivate={openDeactivateConfirm}
            />

            <div className="IngredientsPage-Pagination">

                <button
                    type="button"
                    onClick={() => setPage(current => current - 1)}
                    disabled={page === 0}
                >
                    ← Anterior
                </button>

                <span>Página {page + 1} de {Math.max(totalPages, 1)}</span>

                <button
                    type="button"
                    onClick={() => setPage(current => current + 1)}
                    disabled={page + 1 >= totalPages}
                >
                    Siguiente →
                </button>

            </div>

            <Modal
                isOpen={isFormOpen}
                onClose={closeForm}
                title={editingIngredient ? `Editar ${editingIngredient.name}` : "Nuevo ingrediente"}
            >

                <IngredientForm
                    key={formSessionId}
                    initialData={editingIngredient}
                    submitError={formError}
                    onCancel={closeForm}
                    onSubmit={handleSubmit}
                />

            </Modal>

            <Modal
                isOpen={!!viewingIngredient}
                onClose={closeDetails}
                title={viewingIngredient?.name ?? ""}
            >

                {viewingIngredient && <IngredientDetails ingredient={viewingIngredient} />}

            </Modal>

            <ConfirmDialog
                isOpen={!!deactivatingIngredient}
                title="Desactivar ingrediente"
                message={`¿Seguro que querés desactivar "${deactivatingIngredient?.name}"? Dejará de aparecer en el listado de ingredientes activos.`}
                confirmLabel="Desactivar"
                cancelLabel="Cancelar"
                variant="danger"
                irreversible={false}
                onConfirm={handleConfirmDeactivate}
                onCancel={closeDeactivateConfirm}
            />

        </section>

    );

}
