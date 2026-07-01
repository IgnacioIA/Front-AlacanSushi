// src/components/OrderPanel/hooks/useOrderPanel.js

import { useState } from "react";

export default function useOrderPanel() {

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [editingOrder, setEditingOrder] = useState(null);

    // Se incrementa en cada apertura para forzar el remontaje de OrderForm
    // (vía `key`), incluso entre dos aperturas consecutivas en modo creación.
    const [formSessionId, setFormSessionId] = useState(0);

    function openCreateModal() {

        setEditingOrder(null);

        setIsModalOpen(true);

        setFormSessionId(id => id + 1);

    }

    function openEditModal(order) {

        setEditingOrder(order);

        setIsModalOpen(true);

        setFormSessionId(id => id + 1);

    }

    function closeModal() {

        setIsModalOpen(false);

        setEditingOrder(null);

    }

    return {

        isModalOpen,

        editingOrder,

        formSessionId,

        openCreateModal,

        openEditModal,

        closeModal

    };

}
