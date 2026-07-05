// src/components/Ingredients/hooks/useIngredientsPanel.js
//
// Estado de UI de los tres flujos modales de la página: formulario
// (alta/edición), detalle de sólo lectura y confirmación de borrado.

import { useState } from "react";

export default function useIngredientsPanel() {

    const [isFormOpen, setIsFormOpen] = useState(false);

    const [editingIngredient, setEditingIngredient] = useState(null);

    // Se incrementa en cada apertura para forzar el remontaje de
    // IngredientForm (vía `key`), igual que en OrderPanel/useOrderPanel.
    const [formSessionId, setFormSessionId] = useState(0);

    const [viewingIngredient, setViewingIngredient] = useState(null);

    const [deletingIngredient, setDeletingIngredient] = useState(null);

    function openCreateForm() {

        setEditingIngredient(null);

        setIsFormOpen(true);

        setFormSessionId(id => id + 1);

    }

    function openEditForm(ingredient) {

        setEditingIngredient(ingredient);

        setIsFormOpen(true);

        setFormSessionId(id => id + 1);

    }

    function closeForm() {

        setIsFormOpen(false);

        setEditingIngredient(null);

    }

    function openDetails(ingredient) {

        setViewingIngredient(ingredient);

    }

    function closeDetails() {

        setViewingIngredient(null);

    }

    function openDeleteConfirm(ingredient) {

        setDeletingIngredient(ingredient);

    }

    function closeDeleteConfirm() {

        setDeletingIngredient(null);

    }

    return {

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

    };

}
