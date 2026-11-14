const API_BASE_URL = 'https://api-examen-final-ofvn.onrender.com/api';

async function getData(path, signal) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    signal,
  });

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error('La API devolvió una respuesta que no es JSON.');
  }

  if (!response.ok || payload.success !== true) {
    throw new Error(payload.message || `Error de conexión (${response.status}).`);
  }

  return payload.data;
}

export function getHealth(signal) {
  return getData('/health', signal);
}

export function getCategories(signal) {
  return getData('/categorias', signal);
}

export function getCourses(categoryId, signal) {
  const path = categoryId == null
    ? '/cursos'
    : `/cursos?categoria_id=${encodeURIComponent(categoryId)}`;

  return getData(path, signal);
}

export function getCourseById(id, signal) {
  return getData(`/cursos/${encodeURIComponent(id)}`, signal);
}
