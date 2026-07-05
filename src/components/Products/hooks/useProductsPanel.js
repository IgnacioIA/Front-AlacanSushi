// src/components/Products/hooks/useProductsPanel.js
//
// Estado de UI de los cuatro flujos modales de la página: formulario
// (alta/edición), detalle de sólo lectura, confirmación de borrado y
// producción (acción principal de negocio, propia de este módulo).

import { useState } from "react";

export default function useProductsPanel() {

    const [isFormOpen, setIsFormOpen] = useState(false);

    const [editingProduct, setEditingProduct] = useState(null);

    // Se incrementa en cada apertura para forzar el remontaje de
    // ProductForm (vía `key`), igual que en Ingredients/useIngredientsPanel.
    const [formSessionId, setFormSessionId] = useState(0);

    const [viewingProduct, setViewingProduct] = useState(null);

    const [deletingProduct, setDeletingProduct] = useState(null);

    const [producingProduct, setProducingProduct] = useState(null);

    const [produceSessionId, setProduceSessionId] = useState(0);

    function openCreateForm() {

        setEditingProduct(null);

        setIsFormOpen(true);

        setFormSessionId(id => id + 1);

    }

    function openEditForm(product) {

        setEditingProduct(product);

        setIsFormOpen(true);

        setFormSessionId(id => id + 1);

    }

    function closeForm() {

        setIsFormOpen(false);

        setEditingProduct(null);

    }

    function openDetails(product) {

        setViewingProduct(product);

    }

    function closeDetails() {

        setViewingProduct(null);

    }

    function openDeleteConfirm(product) {

        setDeletingProduct(product);

    }

    function closeDeleteConfirm() {

        setDeletingProduct(null);

    }

    function openProduceForm(product) {

        setProducingProduct(product);

        setProduceSessionId(id => id + 1);

    }

    function closeProduceForm() {

        setProducingProduct(null);

    }

    return {

        isFormOpen,

        editingProduct,

        formSessionId,

        openCreateForm,

        openEditForm,

        closeForm,

        viewingProduct,

        openDetails,

        closeDetails,

        deletingProduct,

        openDeleteConfirm,

        closeDeleteConfirm,

        producingProduct,

        produceSessionId,

        openProduceForm,

        closeProduceForm

    };

}
