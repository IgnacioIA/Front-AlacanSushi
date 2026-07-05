// src/components/Ingredients/IngredientsPage.jsx

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

        loading,

        ingredients,

        stats,

        createIngredient,

        updateIngredient,

        deleteIngredient

    } = useIngredients();

    const {

        searchTerm,

        setSearchTerm,

        stockFilter,

        setStockFilter,

        sortBy,

        setSortBy,

        filteredIngredients

    } = useIngredientFilters(ingredients);

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

        deletingIngredient,

        openDeleteConfirm,

        closeDeleteConfirm

    } = useIngredientsPanel();

    if (loading) {

        return (

            <section className="IngredientsPage">

                <p>Cargando ingredientes...</p>

            </section>

        );

    }

    async function handleSubmit(data) {

        if (editingIngredient) {

            await updateIngredient(editingIngredient.id, data);

        } else {

            await createIngredient(data);

        }

        closeForm();

    }

    async function handleConfirmDelete() {

        await deleteIngredient(deletingIngredient.id);

        closeDeleteConfirm();

    }

    return (

        <section className="IngredientsPage">

            <IngredientsHeader
                stats={stats}
                onCreateIngredient={openCreateForm}
            />

            <IngredientsToolbar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                stockFilter={stockFilter}
                onStockFilterChange={setStockFilter}
                sortBy={sortBy}
                onSortChange={setSortBy}
                onCreateIngredient={openCreateForm}
            />

            <IngredientGrid
                ingredients={filteredIngredients}
                onAddNew={openCreateForm}
                onOpenDetails={openDetails}
                onEdit={openEditForm}
                onDelete={openDeleteConfirm}
            />

            <Modal
                isOpen={isFormOpen}
                onClose={closeForm}
                title={editingIngredient ? `Editar ${editingIngredient.name}` : "Nuevo ingrediente"}
            >

                <IngredientForm
                    key={formSessionId}
                    initialData={editingIngredient}
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
                isOpen={!!deletingIngredient}
                title="Eliminar ingrediente"
                message={`¿Seguro que querés eliminar "${deletingIngredient?.name}"?`}
                confirmLabel="Eliminar"
                cancelLabel="Cancelar"
                variant="danger"
                onConfirm={handleConfirmDelete}
                onCancel={closeDeleteConfirm}
            />

        </section>

    );

}
