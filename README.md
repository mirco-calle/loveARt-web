# 🖼️ LoveArt Desktop - AR Studio & Management

¡Bienvenido a **LoveArt**, el estudio creativo para experiencias de Realidad Aumentada de próxima generación! Este proyecto es una plataforma robusta diseñada para gestionar activos AR, permitiendo a los creadores conectar imágenes de seguimiento con contenidos de aumento (videos y modelos 3D) de manera intuitiva y eficiente.

---

## ✨ Características Principales

- **🚀 AR Spatial Engine**: Motores especializados para transformar fotos estáticas en videos espaciales y planos arquitectónicos en modelos 3D inmersivos.
- **💎 UI/UX Premium**: Interfaz moderna basada en **Glassmorphism**, modo oscuro nativo y micro-animaciones fluidas con Framer Motion.
- **📥 Experiencia de Carga Avanzada**: Sistema de "Drag & Drop" con feedback visual de alto impacto (glow dinámico, escalado y estados de verificación).
- **🛡️ Autenticación de Grado Industrial**: Registro con verificación de email por OTP y login via Google OAuth, gestionado de forma segura con JWT y persistencia en estado sólido.
- **⚡ Arquitectura Optimizada**: Backend con tareas de limpieza automática para mantener la base de datos ligera y eficiente (eliminación de tokens expirados y usuarios no verificados).

---

## 🛠️ Stack Tecnológico

### **Frontend**

- **React (Vite)** + **TypeScript**: Para una experiencia de desarrollo rápida y tipado seguro.
- **Tailwind CSS**: Estilos modernos y responsivos.
- **HeroUI (ex-NextUI)**: Componentes de interfaz premium.
- **Framer Motion**: Animaciones fluidas que dan vida a la interfaz.
- **Zustand**: Gestión de estado global con persistencia automática.

### **Backend**

- **Django** & **Django REST Framework**: API robusta y escalable.
- **PostgreSQL**: Base de datos relacional para integridad de datos.
- **JWT (SimpleJWT)**: Autenticación stateless con rotación y blacklist de tokens.
- **Gmail API (OAuth2)**: Envío de correos corporativos de alta entrega.
- **AWS S3 / Storage**: Almacenamiento eficiente de archivos multimedia.

---

## 🚀 Inicio Rápido con Docker

Este proyecto está completamente dockerizado para facilitar su despliegue y desarrollo local.

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/loveart-desktop.git
cd loveart-desktop
```

### 2. Configurar variables de entorno

Crea un archivo `.env` en la raíz basado en el ejemplo proporcionado y completa tus credenciales (Google OAuth, DB, etc.).

### 3. Levantar el proyecto

```bash
docker-compose up --build
```

- **Frontend**: http://localhost:5173
- **Backend (API)**: http://localhost:8000/api
- **Django Admin**: http://localhost:8000/admin

---

## 🧹 Mantenimiento del Sistema

He incluido un comando de gestión para mantener la salud de la plataforma:

```bash
docker exec django python manage.py cleanup_system
```

Este comando limpia tokens JWT expirados, sesiones antiguas y elimina usuarios que no verificaron su correo tras 24 horas, optimizando el consumo de recursos.

---

## 🧑‍💻 Desarrollado por

**Mirco** - _Creative Developer & AR Visionary_

Proyecto de código abierto para la comunidad de Realidad Aumentada. Si te gusta, ¡déjanos una estrella! ⭐
