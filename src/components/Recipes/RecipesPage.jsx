// src/components/Recipes/RecipesPage.jsx

import RecipesHeader from "./components/RecipesHeader/RecipesHeader";
import RecipesToolbar from "./components/RecipesToolbar/RecipesToolbar";
import RecipesGrid from "./components/RecipesGrid/RecipesGrid";
import RecipeForm from "./components/RecipeForm/RecipeForm";
import RecipeDetails from "./components/RecipeDetails/RecipeDetails";

import Modal from "../Modal/Modal";
import ConfirmDialog from "../ConfirmDialog/ConfirmDialog";

import useRecipes from "./hooks/useRecipes";
import useRecipeFilters from "./hooks/useRecipeFilters";
import useRecipesPanel from "./hooks/useRecipesPanel";

import "./RecipesPage.css";

export default function RecipesPage() {

    const {

        loading,

        recipes,

        stats,

        createRecipe,

        updateRecipe,

        deleteRecipe

    } = useRecipes();

    const {

        searchTerm,

        setSearchTerm,

        sortBy,

        setSortBy,

        groupBy,

        setGroupBy,

        filteredRecipes,

        groupedRecipes

    } = useRecipeFilters(recipes);

    const {

        isFormOpen,

        editingRecipe,

        formSessionId,

        openCreateForm,

        openEditForm,

        closeForm,

        viewingRecipe,

        openDetails,

        closeDetails,

        deletingRecipe,

        openDeleteConfirm,

        closeDeleteConfirm

    } = useRecipesPanel();

    if (loading) {

        return (

            <section className="RecipesPage">

                <p>Cargando recetas...</p>

            </section>

        );

    }

    async function handleSubmit(data) {

        if (editingRecipe) {

            await updateRecipe(editingRecipe.id, data);

        } else {

            await createRecipe(data);

        }

        closeForm();

    }

    async function handleConfirmDelete() {

        await deleteRecipe(deletingRecipe.id);

        closeDeleteConfirm();

    }

    return (

        <section className="RecipesPage">

            <RecipesHeader
                stats={stats}
                onCreateRecipe={openCreateForm}
            />

            <RecipesToolbar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                sortBy={sortBy}
                onSortChange={setSortBy}
                groupBy={groupBy}
                onGroupByChange={setGroupBy}
                onCreateRecipe={openCreateForm}
            />

            <RecipesGrid
                recipes={filteredRecipes}
                groupedRecipes={groupedRecipes}
                groupBy={groupBy}
                onAddNew={openCreateForm}
                onOpenDetails={openDetails}
                onEdit={openEditForm}
                onDelete={openDeleteConfirm}
            />

            <Modal
                isOpen={isFormOpen}
                onClose={closeForm}
                title={editingRecipe ? `Editar ${editingRecipe.name}` : "Nueva receta"}
                size="lg"
            >

                <RecipeForm
                    key={formSessionId}
                    initialData={editingRecipe}
                    onCancel={closeForm}
                    onSubmit={handleSubmit}
                />

            </Modal>

            <Modal
                isOpen={!!viewingRecipe}
                onClose={closeDetails}
                title={viewingRecipe?.name ?? ""}
            >

                {viewingRecipe && <RecipeDetails recipe={viewingRecipe} />}

            </Modal>

            <ConfirmDialog
                isOpen={!!deletingRecipe}
                title="Eliminar receta"
                message={`¿Seguro que querés eliminar "${deletingRecipe?.name}"?`}
                confirmLabel="Eliminar"
                cancelLabel="Cancelar"
                variant="danger"
                onConfirm={handleConfirmDelete}
                onCancel={closeDeleteConfirm}
            />

        </section>

    );

}
