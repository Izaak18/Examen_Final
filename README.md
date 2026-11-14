# Catálogo Académico

Aplicación móvil de examen desarrollada con Expo y JavaScript. Consulta categorías y cursos desde la API REST oficial, filtra cursos por categoría y obtiene el detalle mediante su ID.

## Integrantes

1. Jose Isaac Martinez — 23-05502-1
2. Engels Suarez — 23-05741-1

## Requisitos

- Node.js y npm
- Expo Go en un dispositivo móvil o un emulador compatible

## Ejecución

Desde la carpeta del proyecto:

```bash
npm install
npx expo start
```

Escanea el código QR con Expo Go o abre la aplicación en un emulador desde la terminal de Expo.

## API utilizada

`https://api-examen-final-ofvn.onrender.com/api`

- `GET /health`: estado de conexión de la API.
- `GET /categorias`: categorías disponibles.
- `GET /cursos`: catálogo de cursos.
- `GET /cursos?categoria_id={id}`: cursos filtrados por categoría.
- `GET /cursos/{id}`: detalle del curso seleccionado.

El proyecto no contiene datos de cursos de respaldo; el catálogo, las categorías y el detalle se obtienen mediante solicitudes `fetch` a la API.
