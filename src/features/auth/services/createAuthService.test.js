// src/features/auth/services/createAuthService.test.js — se ejecuta con `npm test`.

import { test } from "node:test";
import assert from "node:assert/strict";

import { createAuthService } from "./createAuthService.js";

function setup({ post, get } = {}) {

    const log = [];

    const http = {

        get: async (url, config) => { log.push(["get", url]); return get ? get(url, config) : { data: {} }; },

        post: async (url, body, config) => { log.push(["post", url, body, config]); return post ? post(url, body, config) : { data: {} }; }

    };

    const csrf = { invalidate: () => log.push(["invalidate"]) };

    return { service: createAuthService({ http, csrf }), log };

}

test("login envía un formulario urlencoded con username y password, no JSON", async () => {

    const { service, log } = setup({

        post: async () => ({ data: { autenticado: true, username: "administrador", rol: "ADMIN" } })

    });

    const session = await service.login("administrador", "secreto&raro=1");

    const [, url, body, config] = log.find(entry => entry[0] === "post");

    assert.equal(url, "/auth/login");

    assert.ok(body instanceof URLSearchParams);

    assert.equal(body.get("username"), "administrador");

    assert.equal(body.get("password"), "secreto&raro=1");

    assert.equal(config.headers["Content-Type"], "application/x-www-form-urlencoded");

    assert.deepEqual(session, { authenticated: true, username: "administrador", role: "ADMIN" });

});

test("login descarta el token CSRF antes y después de un login correcto", async () => {

    const { service, log } = setup();

    await service.login("a", "b");

    assert.deepEqual(log.map(entry => entry[0]), ["invalidate", "post", "invalidate"]);

});

test("login rechazado propaga el error sin volver a descartar el token", async () => {

    const rejection = { status: 401, code: "CREDENCIALES_INVALIDAS" };

    const { service, log } = setup({ post: async () => { throw rejection; } });

    await assert.rejects(service.login("a", "b"), rejection);

    assert.deepEqual(log.map(entry => entry[0]), ["invalidate", "post"]);

});

test("logout descarta el token sólo si el servidor lo confirmó", async () => {

    const accepted = setup({ post: async () => ({ data: "" }) });

    await accepted.service.logout();

    assert.deepEqual(accepted.log.map(entry => entry[0]), ["post", "invalidate"]);

    assert.equal(accepted.log[0][1], "/auth/logout");

    const rejection = { status: 403, code: "CSRF_INVALIDO" };

    const rejected = setup({ post: async () => { throw rejection; } });

    await assert.rejects(rejected.service.logout(), rejection);

    assert.deepEqual(rejected.log.map(entry => entry[0]), ["post"]);

});

test("getSession consulta GET /auth/session y mapea la respuesta anónima", async () => {

    const { service, log } = setup({

        get: async () => ({ data: { autenticado: false, username: null, rol: null } })

    });

    assert.deepEqual(await service.getSession(), { authenticated: false, username: null, role: null });

    assert.deepEqual(log, [["get", "/auth/session"]]);

});
