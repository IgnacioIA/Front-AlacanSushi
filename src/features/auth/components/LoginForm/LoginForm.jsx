// src/features/auth/components/LoginForm/LoginForm.jsx
//
// Formulario de login del panel. Sólo usuario y contraseña: no hay registro,
// recuperación ni "recordarme" en el contrato (autenticacion.md, "Operaciones
// que no existen"). Recibe `onLogin` y no conoce el routing: la redirección
// la decide la página cuando la sesión pasa a `authenticated`.

import useLoginForm from "../../hooks/useLoginForm";

import "./LoginForm.css";

export default function LoginForm({ onLogin, notice }) {

    const { fields, setField, errors, submitError, submitting, submit } = useLoginForm(onLogin);

    function handleSubmit(event) {

        event.preventDefault();

        submit();

    }

    return (

        <div className="LoginForm-Container">

            <form className="LoginForm" onSubmit={handleSubmit} noValidate>

                <h1 className="LoginForm-Title">Panel de administración</h1>

                {notice && (
                    <p className="LoginForm-Notice" role="status">{notice}</p>
                )}

                {submitError && (
                    <p className="LoginForm-SubmitError" role="alert">{submitError}</p>
                )}

                <label className="LoginForm-Field">

                    <span>Usuario</span>

                    <input
                        type="text"
                        name="username"
                        autoComplete="username"
                        autoCapitalize="none"
                        spellCheck={false}
                        value={fields.username}
                        onChange={event => setField("username", event.target.value)}
                        className={errors.username ? "invalid" : ""}
                        aria-invalid={Boolean(errors.username)}
                        aria-describedby={errors.username ? "login-username-error" : undefined}
                        disabled={submitting}
                    />

                    {errors.username && (
                        <small id="login-username-error" className="LoginForm-Error">{errors.username}</small>
                    )}

                </label>

                <label className="LoginForm-Field">

                    <span>Contraseña</span>

                    <input
                        type="password"
                        name="password"
                        autoComplete="current-password"
                        value={fields.password}
                        onChange={event => setField("password", event.target.value)}
                        className={errors.password ? "invalid" : ""}
                        aria-invalid={Boolean(errors.password)}
                        aria-describedby={errors.password ? "login-password-error" : undefined}
                        disabled={submitting}
                    />

                    {errors.password && (
                        <small id="login-password-error" className="LoginForm-Error">{errors.password}</small>
                    )}

                </label>

                <button type="submit" className="LoginForm-Submit" disabled={submitting}>
                    {submitting ? "Ingresando..." : "Ingresar"}
                </button>

            </form>

        </div>

    );

}
