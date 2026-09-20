# Centro Educativo "EDUCAR PARA TRANSFORMAR"
> Sistema de Gestión y Portal Web Institucional — Metodología de Sistemas II (TUP - UTN FRRe)

## Integrantes (Equipo EduCore Systems)
* **Alegre, Fabricio**
* **Ramírez, Damián**

## Descripción del Proyecto
Plataforma web integral para el Centro Educativo "Educar para Transformar". Permite la gestión centralizada de alumnos, docentes, materias, inscripciones a actividades deportivas con control de solapamiento horario, servicios de comedor y transporte escolar, junto con un portal exclusivo para padres y un panel de administración.

## Tecnologías Utilizadas
* **Frontend:** React 19, Vite, React Router DOM v7, CSS Modules
* **Backend & Base de Datos:** Firebase Authentication, Cloud Firestore, Firebase Storage
* **Despliegue:** Vercel

## Cómo ejecutar el proyecto localmente

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/EduCore-Systems/web-centro-educativo.git
   cd web-centro-educativo
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   Crear un archivo `.env` en la raíz con las credenciales de Firebase:
   ```env
   VITE_FIREBASE_API_KEY=tu_api_key
   VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain
   VITE_FIREBASE_PROJECT_ID=tu_project_id
   VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
   VITE_FIREBASE_APP_ID=tu_app_id
   ```

4. **Iniciar en modo desarrollo:**
   ```bash
   npm run dev
   ```

5. **Compilar para producción:**
   ```bash
   npm run build
   ```

## Funcionalidades Principales
* **Gestión de Alumnos:** Registro guiado en 3 pasos con validación anti-duplicados de DNI.
* **Panel de Administración:** Gestión integral de usuarios, asignación de materias a docentes y cursos.
* **Inscripciones y Servicios:** Adhesión a deportes (máx. 2 y control horario), transporte escolar y comedor.
* **Portal de Padres:** Consulta de notas, profesores y actividades de sus hijos con control de acceso restringido.
* **Portal Informativo Público:** Noticias, galería multimedia, bolsa de empleo y contacto.
