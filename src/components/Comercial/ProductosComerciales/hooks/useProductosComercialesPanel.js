// src/components/Comercial/ProductosComerciales/hooks/useProductosComercialesPanel.js
//
// Estado de UI de los tres flujos modales de la página: formulario
// (alta/edición), detalle de sólo lectura y confirmación de
// activar/desactivar. Mismo patrón que Ingredients/hooks/useIngredientsPanel.js.

import { useState } from "react";

export default function useProductosComercialesPanel() {

    const [isFormOpen, setIsFormOpen] = useState(false);

    const [editingProducto, setEditingProducto] = useState(null);

    // Se incrementa en cada apertura para forzar el remontaje del form (`key`).
    const [formSessionId, setFormSessionId] = useState(0);

    const [viewingProducto, setViewingProducto] = useState(null);

    const [togglingProducto, setTogglingProducto] = useState(null);

    function openCreateForm() {

        setEditingProducto(null);

        setIsFormOpen(true);

        setFormSessionId(id => id + 1);

    }

    function openEditForm(producto) {

        setEditingProducto(producto);

        setIsFormOpen(true);

        setFormSessionId(id => id + 1);

    }

    function closeForm() {

        setIsFormOpen(false);

        setEditingProducto(null);

    }

    function openDetails(producto) {

        setViewingProducto(producto);

    }

    function closeDetails() {

        setViewingProducto(null);

    }

    // `togglingProducto` sirve tanto para activar como para desactivar — la
    // acción concreta se decide por producto.active al abrir la confirmación.
    function openToggleConfirm(producto) {

        setTogglingProducto(producto);

    }

    function closeToggleConfirm() {

        setTogglingProducto(null);

    }

    return {

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

    };

}
