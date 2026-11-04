# Support Desk

Sistema web para registrar, asignar y atender incidencias. Incluye una interfaz React y MUI servida por Laravel, una API protegida con sesiones y una base SQLite lista para desarrollo local. También admite MySQL para instalaciones compartidas.

## Primeros pasos

Consulta la [guía de instalación, ejecución y pruebas](backend/README.md). La guía cubre Windows, requisitos, instalación limpia, creación de una cuenta de soporte y flujo de prueba con dos cuentas.

## Funciones

- Solicitantes pueden registrarse, crear incidencias, ver solo las propias y conversar con soporte.
- El equipo de soporte puede consultar y filtrar la cola, asignar responsables, cambiar la prioridad y actualizar el estado.
- Los cambios se protegen con autenticación de sesión y CSRF; las reglas de rol se aplican en el servidor.

## Tecnologías

PHP 8.4.1+, Laravel 13, React, MUI, Vite y SQLite por defecto. El esquema también está preparado para MySQL.

## Alcance de la primera versión

El sistema permitirá que una persona registre una incidencia y consulte su resolución, y que el equipo de soporte pueda priorizarla, asignarla y darle seguimiento desde una cola de trabajo.

| Entrega | Criterio de aceptación |
| --- | --- |
| Acceso y roles | Los solicitantes pueden registrarse e iniciar sesión. Las cuentas de soporte se habilitan explícitamente. Un solicitante no puede acceder a incidencias ajenas ni cambiar su rol. |
| Registro de incidencias | Un solicitante puede crear una incidencia con asunto y descripción, listar sus incidencias y consultar el detalle. La API valida los datos y devuelve errores comprensibles. |
| Cola de soporte | El personal de soporte puede consultar y filtrar la cola, asignar una persona responsable y cambiar la prioridad y el estado. El flujo contempla abierta, en progreso, resuelta y cerrada. |
| Conversación | El solicitante y el equipo de soporte pueden añadir comentarios a las incidencias que pueden consultar y ver quién escribió cada comentario y cuándo. |
| Interfaz web | React y MUI ofrecen inicio de sesión, registro, lista y detalle de incidencias, y controles de atención para el personal de soporte. La interfaz informa cuando carga, cuando no hay resultados y cuando una operación falla. |
| Validación y puesta en marcha | La documentación permite arrancar la aplicación desde una copia limpia. Las pruebas cubren el acceso por rol y el flujo de una incidencia, y la integración continua comprueba el backend y la compilación del frontend. |

Los adjuntos, las notificaciones por correo, los acuerdos de nivel de servicio y los reportes quedan para una versión posterior.

Cada entrega se integra mediante un PR de su rama `feature/*` hacia `develop`. El PR describe qué cambia y cómo se verificó. La publicación en `main` se coordina al final.
