// src/services/auditoriaService.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
});

export async function getAuditoria(filtros = {}) {
    const params = {};
    Object.entries(filtros).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') params[k] = v;
    });

    const response = await axios.get(`${API_URL}/auditoria`, {
        ...getAuthHeaders(),
        params,
    });
    return response.data;
}

export async function getResumenAuditoria(dias = 30) {
    const response = await axios.get(
        `${API_URL}/auditoria/resumen?dias=${dias}`,
        getAuthHeaders()
    );
    return response.data;
}