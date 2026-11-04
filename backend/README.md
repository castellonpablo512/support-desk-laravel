# Guía de instalación y uso

Esta guía permite instalar Support Desk desde una copia limpia en una computadora de desarrollo. En el modo local usa SQLite, así que no necesita instalar un servidor MySQL.

## Requisitos

- Git.
- PHP 8.4.1 o posterior con `ctype`, `curl`, `dom`, `fileinfo`, `mbstring`, `openssl`, `pdo_sqlite`, `tokenizer`, `xml` y `zip` habilitados.
- Composer 2.
- Node.js 20.19+ (recomendado: Node 24) y npm.

En Windows puedes usar PHP y Composer del instalador oficial de Composer. Comprueba las herramientas desde PowerShell:

```powershell
php -v
php -m
composer --version
node --version
npm --version
```

En la salida de `php -m` debe aparecer `pdo_sqlite`.

## Instalación limpia

Clona el repositorio y ejecuta la configuración:

```powershell
git clone https://github.com/castellonpablo512/support-desk-laravel.git
cd support-desk-laravel/backend
composer run setup
```

El comando instala las dependencias, crea `.env`, genera una clave de cifrado, crea la base SQLite, ejecuta las migraciones y compila React. Si la instalación se interrumpe, vuelve a ejecutar los pasos manuales desde la carpeta `backend`:

```powershell
composer install
Copy-Item .env.example .env
php artisan key:generate
New-Item -ItemType File -Force database/database.sqlite
php artisan migrate
npm ci
npm run build
```

Si ya existe `.env`, no lo reemplaces; ejecuta solamente los pasos que aún falten.

## Iniciar la aplicación

Desde `backend`:

```powershell
composer run dev
```

Abre [http://localhost:8000](http://localhost:8000). Para detener los servidores, usa `Ctrl+C`.

También puedes iniciar Laravel y Vite en terminales separadas:

```powershell
php artisan serve
npm run dev
```

## Probar el flujo

1. Registra una cuenta con nombre, correo y contraseña de al menos 12 caracteres.
2. Crea una incidencia con asunto y descripción. Ábrela y añade un comentario.
3. En otra terminal, habilita una cuenta existente para soporte:

   ```powershell
   php artisan support:grant correo@ejemplo.com
   ```

4. Cierra sesión e inicia con esa cuenta. Verás la cola; abre una incidencia, asigna un responsable y prueba los selectores de prioridad y estado.
5. Regresa a la cuenta solicitante y confirma que puede ver y comentar en sus solicitudes.

Las cuentas públicas empiezan como solicitantes. Solo el comando de consola concede el rol de soporte.

## Pruebas y compilación

```powershell
php artisan test
php vendor/bin/pint --test
npm run build
```

La suite comprueba registro e inicio de sesión, separación de permisos, creación y consulta de incidencias, asignación, cambios de estado y comentarios.

## Base de datos MySQL

SQLite es suficiente para probar en una computadora. Para una instalación compartida, crea una base de datos MySQL y actualiza `.env`:

```dotenv
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=support_desk
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_contraseña
```

Habilita `pdo_mysql` en PHP y luego ejecuta `php artisan migrate --force`. No publiques `.env` ni guardes contraseñas de base de datos en Git.

## Datos locales

SQLite conserva la información en `database/database.sqlite`. Para reiniciar los datos de desarrollo, detén la aplicación y ejecuta `php artisan migrate:fresh`. Este comando elimina todos los datos de esa base.

La aplicación no configura por sí sola HTTPS, correo, copias de seguridad ni infraestructura de producción.
