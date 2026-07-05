// src/components/Recipes/hooks/useRecipesPanel.js
//
// Estado de UI de los tres flujos modales de la página: formulario
// (alta/edición), detalle de sólo lectura y confirmación de borrado.
// Mismo shape que Ingredients/hooks/useIngredientsPanel — este módulo no
// tiene una acción principal equivalente a "Producir".

import { useState } from "react";

export default function useRecipesPanel() {

    const [isFormOpen, setIsFormOpen] = useState(false);

    const [editingRecipe, setEditingRecipe] = useState(null);

    const [formSessionId, setFormSessionId] = useState(0);

    const [viewingRecipe, setViewingRecipe] = useState(null);

    const [deletingRecipe, setDeletingRecipe] = useState(null);

    function openCreateForm() {

        setEditingRecipe(null);

        setIsFormOpen(true);

        setFormSessionId(id => id + 1);

    }

    function openEditForm(recipe) {

        setEditingRecipe(recipe);

        setIsFormOpen(true);

        setFormSessionId(id => id + 1);

    }

    function closeForm() {

        setIsFormOpen(false);

        setEditingRecipe(null);

    }

    function openDetails(recipe) {

        setViewingRecipe(recipe);

    }

    function closeDetails() {

        setViewingRecipe(null);

    }

    function openDeleteConfirm(recipe) {

        setDeletingRecipe(recipe);

    }

    function closeDeleteConfirm() {

        setDeletingRecipe(null);

    }

    return {

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

    };

}
