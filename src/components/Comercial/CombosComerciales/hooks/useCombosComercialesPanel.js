// src/components/Comercial/CombosComerciales/hooks/useCombosComercialesPanel.js

import { useState } from "react";

export default function useCombosComercialesPanel() {

    const [isFormOpen, setIsFormOpen] = useState(false);

    const [editingCombo, setEditingCombo] = useState(null);

    const [formSessionId, setFormSessionId] = useState(0);

    const [viewingCombo, setViewingCombo] = useState(null);

    const [togglingCombo, setTogglingCombo] = useState(null);

    function openCreateForm() {

        setEditingCombo(null);

        setIsFormOpen(true);

        setFormSessionId(id => id + 1);

    }

    function openEditForm(combo) {

        setEditingCombo(combo);

        setIsFormOpen(true);

        setFormSessionId(id => id + 1);

    }

    function closeForm() {

        setIsFormOpen(false);

        setEditingCombo(null);

    }

    function openDetails(combo) {

        setViewingCombo(combo);

    }

    function closeDetails() {

        setViewingCombo(null);

    }

    function openToggleConfirm(combo) {

        setTogglingCombo(combo);

    }

    function closeToggleConfirm() {

        setTogglingCombo(null);

    }

    return {

        isFormOpen,

        editingCombo,

        formSessionId,

        openCreateForm,

        openEditForm,

        closeForm,

        viewingCombo,

        openDetails,

        closeDetails,

        togglingCombo,

        openToggleConfirm,

        closeToggleConfirm

    };

}
