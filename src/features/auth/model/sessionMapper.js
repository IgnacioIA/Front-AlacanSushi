// src/features/auth/model/sessionMapper.js
//
// DTO → UI de la respuesta de GET /auth/session y POST /auth/login
// ({ autenticado, username, rol } — autenticacion.md, AUTH-02/AUTH-03).

export function mapSession(dto) {

    return {

        authenticated: dto?.autenticado === true,

        username: dto?.username ?? null,

        role: dto?.rol ?? null

    };

}
