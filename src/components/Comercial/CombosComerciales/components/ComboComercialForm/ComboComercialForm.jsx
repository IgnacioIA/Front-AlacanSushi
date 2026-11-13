// src/components/Comercial/CombosComerciales/components/ComboComercialForm/ComboComercialForm.jsx

import { useRef, useState } from "react";

import useComboComercialForm from "../../hooks/useComboComercialForm";
import useActiveProductosComerciales from "../../../ProductosComerciales/hooks/useActiveProductosComerciales";
import ComboComponentesPicker from "../ComboComponentesPicker/ComboComponentesPicker";
import ConfirmDialog from "../../../../ConfirmDialog/ConfirmDialog";

import "./ComboComercialForm.css";

const FIELD_ORDER = ["name", "price", "componentes"];

export default function ComboComercialForm({

    initialData,

    submitError,

    onCancel,

    onSubmit

}) {

    const {

        fields,

        setField,

        addComponente,

        updateComponente,

        removeComponente,

        errors,

        isDirty,

        validateForm,

        buildPayload

    } = useComboComercialForm(initialData);

    const { productos: productosDisponibles, loading: loadingProductos } = useActiveProductosComerciales();

    const [shake, setShake] = useState(false);

    const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

    const fieldRefs = useRef({});

    const genericSubmitError = submitError ? (submitError.detail || submitError.title) : null;

    function handleSubmit(event) {

        event.preventDefault();

        const nextErrors = validateForm();

        const firstErrorField = FIELD_ORDER.find(field => nextErrors[field]);

        if (firstErrorField) {

            setShake(true);

            fieldRefs.current[firstErrorField]?.focus();

            return;

        }

        onSubmit(buildPayload());

    }

    function handleCancelClick() {

        if (isDirty) {

            setShowDiscardConfirm(true);

            return;

        }

        onCancel();

    }

    return (

        <>

            <form
                className={`ComboComercialForm ${shake ? "shake" : ""}`}
                onSubmit={handleSubmit}
                onAnimationEnd={() => setShake(false)}
                noValidate
            >

                {genericSubmitError && (
                    <p className="ComboComercialForm-SubmitError">{genericSubmitError}</p>
                )}

                <label className="ComboComercialForm-Field">

                    <span>Nombre</span>

                    <input
                        ref={el => { fieldRefs.current.name = el; }}
                        type="text"
                        value={fields.name}
                        onChange={event => setField("name", event.target.value)}
                        className={errors.name ? "invalid" : ""}
                        placeholder="Ej: Combo familiar"
                    />

                    {errors.name && (
                        <small className="ComboComercialForm-Error">{errors.name}</small>
                    )}

                </label>

                <label className="ComboComercialForm-Field">

                    <span>Precio del combo</span>

                    <input
                        ref={el => { fieldRefs.current.price = el; }}
                        type="number"
                        value={fields.price}
                        onChange={event => setField("price", event.target.value)}
                        className={errors.price ? "invalid" : ""}
                        placeholder="0"
                        min="0"
                        step="0.01"
                    />

                    {errors.price && (
                        <small className="ComboComercialForm-Error">{errors.price}</small>
                    )}

                </label>

                <label className="ComboComercialForm-Field">

                    <span>Imagen (URL, opcional)</span>

                    <input
                        type="text"
                        value={fields.image}
                        onChange={event => setField("image", event.target.value)}
                        placeholder="https://..."
                    />

                </label>

                <label className="ComboComercialForm-Field">

                    <span>Descripción (opcional)</span>

                    <textarea
                        value={fields.description}
                        onChange={event => setField("description", event.target.value)}
                        placeholder="Descripción visible para el cliente"
                        rows={3}
                    />

                </label>

                <div ref={el => { fieldRefs.current.componentes = el; }} tabIndex={-1}>

                    <ComboComponentesPicker
                        componentes={fields.componentes}
                        productosDisponibles={productosDisponibles}
                        loadingProductos={loadingProductos}
                        error={errors.componentes}
                        onAdd={addComponente}
                        onUpdate={updateComponente}
                        onRemove={removeComponente}
                    />

                </div>

                <div className="ComboComercialForm-Footer">

                    <button
                        type="button"
                        className="ComboComercialForm-Cancel"
                        onClick={handleCancelClick}
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        className="ComboComercialForm-Submit"
                    >
                        Guardar
                    </button>

                </div>

            </form>

            <ConfirmDialog
                isOpen={showDiscardConfirm}
                title="Descartar cambios"
                message="Tenés cambios sin guardar. ¿Querés descartarlos?"
                confirmLabel="Descartar"
                cancelLabel="Seguir editando"
                variant="danger"
                onConfirm={() => {
                    setShowDiscardConfirm(false);
                    onCancel();
                }}
                onCancel={() => setShowDiscardConfirm(false)}
            />

        </>

    );

}
