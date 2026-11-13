// src/services/csrf.test.js — se ejecuta con `npm test` (node:test, sin dependencias).

import { test } from "node:test";
import assert from "node:assert/strict";

import { createCsrfManager } from "./csrf.js";

function deferred() {

    let resolve;

    let reject;

    const promise = new Promise((res, rej) => { resolve = res; reject = rej; });

    return { promise, resolve, reject };

}

function tokenResponse(token) {

    return { headerName: "X-CSRF-TOKEN", token };

}

test("comparte una única obtención entre pedidos concurrentes", async () => {

    let calls = 0;

    const csrf = createCsrfManager(async () => { calls += 1; return tokenResponse("T1"); });

    const [a, b, c] = await Promise.all([csrf.getToken(), csrf.getToken(), csrf.getToken()]);

    assert.equal(calls, 1);

    assert.deepEqual([a.token, b.token, c.token], ["T1", "T1", "T1"]);

});

test("reutiliza el token en memoria hasta que se invalida", async () => {

    let calls = 0;

    const csrf = createCsrfManager(async () => { calls += 1; return tokenResponse(`T${calls}`); });

    assert.equal((await csrf.getToken()).token, "T1");

    assert.equal((await csrf.getToken()).token, "T1");

    csrf.invalidate();

    assert.equal((await csrf.getToken()).token, "T2");

    assert.equal(calls, 2);

});

test("una respuesta vieja no pisa al token obtenido después de invalidar", async () => {

    const pending = [];

    const csrf = createCsrfManager(() => {

        const request = deferred();

        pending.push(request);

        return request.promise;

    });

    const stale = csrf.getToken();

    await Promise.resolve();

    csrf.invalidate();

    const fresh = csrf.getToken();

    await Promise.resolve();

    pending[1].resolve(tokenResponse("NUEVO"));

    assert.equal((await fresh).token, "NUEVO");

    pending[0].resolve(tokenResponse("VIEJO"));

    await stale;

    assert.equal((await csrf.getToken()).token, "NUEVO");

    assert.equal(pending.length, 2);

});

test("una obtención fallida no queda cacheada", async () => {

    let calls = 0;

    const csrf = createCsrfManager(async () => {

        calls += 1;

        if (calls === 1) throw new Error("red");

        return tokenResponse("T2");

    });

    await assert.rejects(csrf.getToken());

    assert.equal((await csrf.getToken()).token, "T2");

});

test("invalidateIfCurrent no descarta un token más nuevo que el usado", async () => {

    let calls = 0;

    const csrf = createCsrfManager(async () => { calls += 1; return tokenResponse(`T${calls}`); });

    await csrf.getToken();

    csrf.invalidateIfCurrent("T1");

    assert.equal((await csrf.getToken()).token, "T2");

    csrf.invalidateIfCurrent("T1");

    assert.equal((await csrf.getToken()).token, "T2");

    assert.equal(calls, 2);

});

test("rechaza una respuesta sin headerName o token", async () => {

    const csrf = createCsrfManager(async () => ({ token: "sin-cabecera" }));

    await assert.rejects(csrf.getToken(), /headerName o token/);

});
