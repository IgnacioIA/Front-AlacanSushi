// src/services/createHttpClient.test.js — se ejecuta con `npm test`.
//
// El adaptador de Axios se reemplaza por uno en memoria: no hay red ni
// backend. Cada respuesta imita la forma real de la API (problem+json con
// `code`, errores-y-seguridad.md).

import { test } from "node:test";
import assert from "node:assert/strict";

import { AxiosError } from "axios";

import { createHttpClient, requiresCsrf } from "./createHttpClient.js";

function problem(status, code) {

    return { status, data: { title: code, status, detail: null, instance: "/x", code } };

}

// `route(call, calls)` decide la respuesta de cada petición: un objeto
// { status, data } o "network" para simular un error sin respuesta.
function setup(route) {

    const client = createHttpClient({ baseURL: "/api" });

    const calls = [];

    let tokens = 0;

    client.http.defaults.adapter = async config => {

        const call = {

            method: config.method,

            url: config.url,

            csrf: config.headers.get("X-CSRF-TOKEN") ?? null,

            withCredentials: config.withCredentials

        };

        calls.push(call);

        const result = call.url === "/auth/csrf"
            ? { status: 200, data: { headerName: "X-CSRF-TOKEN", token: `T${++tokens}` } }
            : route(call, calls);

        if (result === "network") {

            throw new AxiosError("Network Error", AxiosError.ERR_NETWORK, config, {});

        }

        const response = { data: result.data, status: result.status, statusText: "", headers: {}, config, request: {} };

        if (result.status >= 200 && result.status < 300) return response;

        throw new AxiosError(`HTTP ${result.status}`, AxiosError.ERR_BAD_REQUEST, config, {}, response);

    };

    const csrfCalls = () => calls.filter(call => call.url === "/auth/csrf").length;

    return { ...client, calls, csrfCalls };

}

const ok = () => ({ status: 200, data: {} });

test("requiresCsrf: sólo escrituras, con la excepción exacta POST /pedidos", () => {

    assert.equal(requiresCsrf({ method: "get", url: "/catalogo" }), false);

    assert.equal(requiresCsrf({ method: "get", url: "/admin/comercial/productos" }), false);

    assert.equal(requiresCsrf({ method: "post", url: "/pedidos" }), false);

    assert.equal(requiresCsrf({ method: "post", url: "pedidos" }), false);

    assert.equal(requiresCsrf({ method: "post", url: "/pedidos/15/confirmar" }), true);

    assert.equal(requiresCsrf({ method: "post", url: "/auth/login" }), true);

    assert.equal(requiresCsrf({ method: "put", url: "/admin/comercial/productos/1" }), true);

    assert.equal(requiresCsrf({ method: "PATCH", url: "/pedidos/1/items/2/cantidad" }), true);

    assert.equal(requiresCsrf({ method: "delete", url: "/pedidos/1/items/2" }), true);

});

test("GET /catalogo no pide token CSRF y envía cookies", async () => {

    const client = setup(ok);

    await client.http.get("/catalogo");

    assert.equal(client.csrfCalls(), 0);

    assert.equal(client.calls[0].csrf, null);

    assert.equal(client.calls[0].withCredentials, true);

});

test("POST /pedidos no pide token CSRF ni envía la cabecera", async () => {

    const client = setup(() => ({ status: 201, data: { id: 1 } }));

    await client.http.post("/pedidos", { tipoPedido: "TAKEAWAY" });

    assert.equal(client.csrfCalls(), 0);

    assert.equal(client.calls[0].csrf, null);

});

test("las escrituras administrativas llevan X-CSRF-TOKEN y reutilizan el token", async () => {

    const client = setup(ok);

    await client.http.post("/admin/comercial/productos", {});

    await client.http.put("/admin/comercial/productos/1", {});

    await client.http.patch("/pedidos/1/items/2/cantidad", {});

    await client.http.delete("/pedidos/1/items/2");

    const writes = client.calls.filter(call => call.url !== "/auth/csrf");

    assert.deepEqual(writes.map(call => call.csrf), ["T1", "T1", "T1", "T1"]);

    assert.equal(client.csrfCalls(), 1);

});

test("escrituras concurrentes comparten una sola obtención del token", async () => {

    const client = setup(ok);

    await Promise.all([

        client.http.post("/admin/comercial/productos/1/activar"),

        client.http.post("/admin/comercial/productos/2/activar"),

        client.http.post("/admin/comercial/combos/1/desactivar")

    ]);

    assert.equal(client.csrfCalls(), 1);

});

test("403 CSRF_INVALIDO: pide un token nuevo y reintenta una sola vez", async () => {

    let attempts = 0;

    const client = setup(call => {

        if (call.url !== "/admin/comercial/productos") return ok();

        attempts += 1;

        return attempts === 1 ? problem(403, "CSRF_INVALIDO") : { status: 201, data: { id: 9 } };

    });

    const response = await client.http.post("/admin/comercial/productos", {});

    assert.equal(response.status, 201);

    assert.deepEqual(
        client.calls.map(call => `${call.url}:${call.csrf}`),
        ["/auth/csrf:null", "/admin/comercial/productos:T1", "/auth/csrf:null", "/admin/comercial/productos:T2"]
    );

});

test("403 CSRF_INVALIDO repetido no entra en bucle: se propaga normalizado", async () => {

    const client = setup(() => problem(403, "CSRF_INVALIDO"));

    await assert.rejects(

        client.http.post("/admin/comercial/productos", {}),

        error => error.status === 403 && error.code === "CSRF_INVALIDO" && "title" in error

    );

    assert.equal(client.calls.filter(call => call.url === "/admin/comercial/productos").length, 2);

    assert.equal(client.csrfCalls(), 2);

});

test("no reintenta errores distintos de CSRF_INVALIDO", async () => {

    for (const [status, code] of [[400, "VALIDATION_ERROR"], [403, "ACCESO_DENEGADO"], [409, "PRODUCTO_COMERCIAL_EN_USO_POR_COMBO_ACTIVO"]]) {

        const client = setup(() => problem(status, code));

        await assert.rejects(client.http.post("/admin/comercial/productos/1/desactivar"), { status, code });

        assert.equal(client.calls.filter(call => call.url !== "/auth/csrf").length, 1);

    }

});

test("403 CSRF_INVALIDO en una operación sin CSRF no se reintenta", async () => {

    const client = setup(() => problem(403, "CSRF_INVALIDO"));

    await assert.rejects(client.http.post("/pedidos", {}), { code: "CSRF_INVALIDO" });

    assert.equal(client.calls.length, 1);

});

test("401 NO_AUTENTICADO avisa al manejador y descarta el token", async () => {

    let sessionAlive = true;

    const client = setup(call => (sessionAlive || call.url === "/auth/session" ? ok() : problem(401, "NO_AUTENTICADO")));

    const notified = [];

    client.setUnauthorizedHandler(error => notified.push(error.code));

    await client.http.post("/admin/comercial/productos", {});

    sessionAlive = false;

    await assert.rejects(client.http.get("/admin/comercial/productos"), { status: 401, code: "NO_AUTENTICADO" });

    assert.deepEqual(notified, ["NO_AUTENTICADO"]);

    sessionAlive = true;

    await client.http.post("/admin/comercial/productos", {});

    assert.equal(client.csrfCalls(), 2);

});

test("401 CREDENCIALES_INVALIDAS no se trata como sesión vencida", async () => {

    const client = setup(() => problem(401, "CREDENCIALES_INVALIDAS"));

    let notified = 0;

    client.setUnauthorizedHandler(() => { notified += 1; });

    await assert.rejects(client.http.post("/auth/login", "username=a&password=b"), { code: "CREDENCIALES_INVALIDAS" });

    assert.equal(notified, 0);

});

test("un error de red no es un 401: NETWORK_ERROR sin avisar al manejador", async () => {

    const client = setup(() => "network");

    let notified = 0;

    client.setUnauthorizedHandler(() => { notified += 1; });

    await assert.rejects(client.http.get("/admin/comercial/productos"), { status: null, code: "NETWORK_ERROR" });

    assert.equal(notified, 0);

});

test("si falla GET /auth/csrf la escritura no se envía y el error conserva su status", async () => {

    const client = setup(ok);

    client.http.defaults.adapter = async config => {

        client.calls.push({ url: config.url });

        const response = { data: { title: "Error", status: 500 }, status: 500, statusText: "", headers: {}, config, request: {} };

        throw new AxiosError("HTTP 500", AxiosError.ERR_BAD_RESPONSE, config, {}, response);

    };

    await assert.rejects(client.http.post("/admin/comercial/productos", {}), { status: 500, code: null });

    assert.deepEqual(client.calls.map(call => call.url), ["/auth/csrf"]);

});

test("el manejador de 401 se puede desregistrar", async () => {

    const client = setup(() => problem(401, "NO_AUTENTICADO"));

    let notified = 0;

    const unregister = client.setUnauthorizedHandler(() => { notified += 1; });

    unregister();

    await assert.rejects(client.http.get("/pedidos"));

    assert.equal(notified, 0);

});
