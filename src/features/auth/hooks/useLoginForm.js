// src/features/auth/hooks/useLoginForm.js
//
// Campos, validación de obligatorios y envío del login. `submittingRef`
// bloquea un segundo envío aunque el estado `submitting` todavía no se haya
// re-renderizado (doble click, Enter repetido). La contraseña sólo vive en
// el estado del formulario y se borra tras un intento rechazado.

import { useRef, useState } from "react";

import { loginErrorMessage } from "../model/authErrorMessages";

function validate(fields) {

    const errors = {};

    if (!fields.username.trim()) errors.username = "Ingresá tu usuario.";

    if (!fields.password) errors.password = "Ingresá tu contraseña.";

    return errors;

}

export default function useLoginForm(onLogin) {

    const [fields, setFields] = useState({ username: "", password: "" });

    const [errors, setErrors] = useState({});

    const [submitError, setSubmitError] = useState(null);

    const [submitting, setSubmitting] = useState(false);

    const submittingRef = useRef(false);

    function setField(field, value) {

        setFields(current => ({ ...current, [field]: value }));

    }

    async function submit() {

        if (submittingRef.current) return;

        const nextErrors = validate(fields);

        setErrors(nextErrors);

        if (Object.keys(nextErrors).length > 0) return;

        submittingRef.current = true;

        setSubmitting(true);

        setSubmitError(null);

        try {

            await onLogin(fields.username.trim(), fields.password);

        } catch (error) {

            setSubmitError(loginErrorMessage(error));

            if (error?.code === "CREDENCIALES_INVALIDAS") setField("password", "");

        } finally {

            submittingRef.current = false;

            setSubmitting(false);

        }

    }

    return { fields, setField, errors, submitError, submitting, submit };

}
