// src/components/Comercial/CombosComerciales/CombosComercialesPage.jsx
//
// Panel administrativo de Combos Comerciales — contratos:
// docs/frontend/integration 27-8-2026/{crear,actualizar,activar-desactivar,
// consultar}-combo-comercial.md.

import { useState } from "react";

import CombosComercialesHeader from "./components/CombosComercialesHeader/CombosComercialesHeader";
import CombosComercialesToolbar from "./components/CombosComercialesToolbar/CombosComercialesToolbar";
import ComboComercialGrid from "./components/ComboComercialGrid/ComboComercialGrid";
import ComboComercialForm from "./components/ComboComercialForm/ComboComercialForm";
import ComboComercialDetails from "./components/ComboComercialDetails/ComboComercialDetails";

import Modal from "../../Modal/Modal";
import ConfirmDialog from "../../ConfirmDialog/ConfirmDialog";

import useCombosComerciales from "./hooks/useCombosComerciales";
import useComboComercialFilters from "./hooks/useComboComercialFilters";
import useCombosComercialesPanel from "./hooks/useCombosComercialesPanel";

import "./CombosComercialesPage.css";

const TOGGLE_ERROR_MESSAGES = {

    COMBO_COMERCIAL_COMPONENTE_INACTIVO:
        "No se puede activar: uno o más productos que componen este combo están inactivos. Activalos primero."

};

export default function CombosComercialesPage() {

    const {

        searchTerm,

        setSearchTerm,

        estadoFilter,

        setEstadoFilter,

        page,

        setPage,

        pageSize

    } = useComboComercialFilters();

    const {

        loading,

        error,

        combos,

        stats,

        totalPaginas,

        createCombo,

        updateCombo,

        activarCombo,

        desactivarCombo

    } = useCombosComerciales({ searchTerm, estadoFilter, page, pageSize });

    const {

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

    } = useCombosComercialesPanel();

    const [formError, setFormError] = useState(null);

    const [toggleError, setToggleError] = useState(null);

    if (loading) {

        return (

            <section className="CombosComercialesPage">

                <p>Cargando combos comerciales...</p>

            </section>

        );

    }

    function handleOpenCreateForm() {

        setFormError(null);

        openCreateForm();

    }

    function handleOpenEditForm(combo) {

        setFormError(null);

        openEditForm(combo);

    }

    async function handleSubmit(data) {

        try {

            if (editingCombo) {

                await updateCombo(editingCombo.id, data);

            } else {

                await createCombo(data);

            }

            setFormError(null);

            closeForm();

        } catch (submitError) {

            setFormError(submitError);

        }

    }

    function handleOpenToggleConfirm(combo) {

        setToggleError(null);

        openToggleConfirm(combo);

    }

    async function handleConfirmToggle() {

        const combo = togglingCombo;

        try {

            if (combo.active) {

                await desactivarCombo(combo.id);

            } else {

                await activarCombo(combo.id);

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

        <section className="CombosComercialesPage">

            <CombosComercialesHeader
                stats={stats}
                onCreateCombo={handleOpenCreateForm}
            />

            {error && (
                <p className="CombosComercialesPage-Error">{error}</p>
            )}

            {toggleError && (

                <div className="CombosComercialesPage-Notice">

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

            <CombosComercialesToolbar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                estadoFilter={estadoFilter}
                onEstadoFilterChange={setEstadoFilter}
                onCreateCombo={handleOpenCreateForm}
            />

            <ComboComercialGrid
                combos={combos}
                onAddNew={handleOpenCreateForm}
                onOpenDetails={openDetails}
                onEdit={handleOpenEditForm}
                onToggleActive={handleOpenToggleConfirm}
            />

            <div className="CombosComercialesPage-Pagination">

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
                title={editingCombo ? `Editar ${editingCombo.name}` : "Nuevo combo comercial"}
                size="lg"
            >

                <ComboComercialForm
                    key={formSessionId}
                    initialData={editingCombo}
                    submitError={formError}
                    onCancel={closeForm}
                    onSubmit={handleSubmit}
                />

            </Modal>

            <Modal
                isOpen={!!viewingCombo}
                onClose={closeDetails}
                title={viewingCombo?.name ?? ""}
            >

                {viewingCombo && <ComboComercialDetails combo={viewingCombo} />}

            </Modal>

            <ConfirmDialog
                isOpen={!!togglingCombo}
                title={togglingCombo?.active ? "Desactivar combo" : "Activar combo"}
                message={
                    togglingCombo?.active
                        ? `¿Seguro que querés desactivar "${togglingCombo?.name}"? Dejará de aparecer en el catálogo público.`
                        : `¿Querés activar "${togglingCombo?.name}"? Volverá a aparecer en el catálogo público.`
                }
                confirmLabel={togglingCombo?.active ? "Desactivar" : "Activar"}
                cancelLabel="Cancelar"
                variant={togglingCombo?.active ? "danger" : "default"}
                irreversible={false}
                onConfirm={handleConfirmToggle}
                onCancel={closeToggleConfirm}
            />

        </section>

    );

}
