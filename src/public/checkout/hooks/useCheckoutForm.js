// src/public/checkout/hooks/useCheckoutForm.js
//
// Campos que exige POST /pedidos (ver docs/frontend/integration 27-8-2026/
// FRONTEND-READINESS.md sección A, y pedido.md): tipoPedido, nombreCliente,
// telefonoCliente siempre; direccion sólo si tipoPedido = DELIVERY. `canal`
// no es un campo de formulario — se fija en "WEB" al armar el request (ver
// order/model/pedidoMapper.js), el usuario nunca lo elige.
//
// Validación de formato únicamente (UX) — la regla real la aplica el
// backend al crear el Pedido.

import { useState } from "react";

const TIPOS_PEDIDO = ["SALON", "DELIVERY", "TAKEAWAY"];

function validate(fields) {

    const errors = {};

    if (!fields.nombreCliente.trim()) errors.nombreCliente = "Ingresá tu nombre.";

    if (!fields.telefonoCliente.trim()) errors.telefonoCliente = "Ingresá un teléfono de contacto.";

    if (fields.tipoPedido === "DELIVERY" && !fields.direccion.trim()) {

        errors.direccion = "Ingresá la dirección de entrega.";

    }

    return errors;

}

export default function useCheckoutForm() {

    const [fields, setFields] = useState({

        nombreCliente: "",

        telefonoCliente: "",

        tipoPedido: TIPOS_PEDIDO[0],

        direccion: ""

    });

    const [errors, setErrors] = useState({});

    function setField(field, value) {

        setFields(current => ({ ...current, [field]: value }));

    }

    function validateForm() {

        const nextErrors = validate(fields);

        setErrors(nextErrors);

        return nextErrors;

    }

    function buildPayload() {

        return {

            nombreCliente: fields.nombreCliente.trim(),

            telefonoCliente: fields.telefonoCliente.trim(),

            tipoPedido: fields.tipoPedido,

            direccion: fields.tipoPedido === "DELIVERY" ? fields.direccion.trim() : null

        };

    }

    return {

        fields,

        setField,

        errors,

        validateForm,

        buildPayload,

        tiposPedido: TIPOS_PEDIDO

    };

}
