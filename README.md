# Support Desk

Sistema web de gestión de incidencias desarrollado como proyecto de entrenamiento full-stack.

## Tecnologías

- PHP
- Laravel
- MySQL
- React
- JavaScript
- MUI

## Arquitectura

El proyecto utiliza una arquitectura headless:

React → REST API → Laravel → MySQL

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
