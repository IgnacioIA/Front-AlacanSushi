// src/features/auth/model/authRoutes.test.js — se ejecuta con `npm test`.

import { test } from "node:test";
import assert from "node:assert/strict";

import { ADMIN_HOME, resolveAdminDestination } from "./authRoutes.js";
import { loginErrorMessage, logoutErrorMessage } from "./authErrorMessages.js";

test("vuelve al destino del panel que se había pedido", () => {

    assert.equal(
        resolveAdminDestination({ pathname: "/admin/comercial/combos", search: "?page=2", hash: "" }),
        "/admin/comercial/combos?page=2"
    );

    assert.equal(resolveAdminDestination("/admin/PanelPedidos"), "/admin/PanelPedidos");

});

test("sin destino válido va al inicio del panel (sin bucles ni salidas del panel)", () => {

    for (const from of [undefined, null, {}, "/admin/login", "/admin/login?x=1", "/", "/carrito", "//otro-sitio.com/admin", "/administrador"]) {

        assert.equal(resolveAdminDestination(from), ADMIN_HOME, `from = ${JSON.stringify(from)}`);

    }

});

test("los mensajes de login distinguen credenciales inválidas de errores de red", () => {

    assert.match(loginErrorMessage({ code: "CREDENCIALES_INVALIDAS" }), /incorrectos/);

    assert.match(loginErrorMessage({ code: "NETWORK_ERROR" }), /conectar/);

    assert.match(loginErrorMessage({ code: null }), /No se pudo iniciar sesión/);

});

test("un logout fallido siempre avisa que la sesión sigue abierta", () => {

    for (const code of ["NETWORK_ERROR", "CSRF_INVALIDO", null]) {

        assert.match(logoutErrorMessage({ code }), /sesión sigue abierta/);

    }

});
