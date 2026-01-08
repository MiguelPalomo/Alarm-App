# Alarm App - Android

Una aplicación de alarma exclusiva para Android que muestra notificaciones de pantalla completa incluso cuando el dispositivo está bloqueado.

## 🚀 Características

- ⏰ **Alarmas con pantalla bloqueada**: La alarma suena y muestra pantalla completa aunque el móvil esté bloqueado
- 🔒 **Botón de emergencia**: Requiere mantener presionado durante 5 segundos para detener la alarma
- 🎵 **Sonidos personalizados**: Soporte para archivos de audio MP3 personalizados
- 📱 **Diseño moderno**: Interfaz oscura con animaciones suaves
- 🔔 **Múltiples alarmas**: Crea y gestiona varias alarmas

## 📋 Requisitos

- Node.js 18+
- Android Studio (para development build)
- Dispositivo Android físico (Android 12+ recomendado)

## 🛠️ Instalación

1. **Instalar dependencias**:
```bash
npm install
```

2. **Agregar archivos de sonido de alarma** (requerido):
   - Coloca 3 archivos MP3 en `assets/sounds/`:
     - `alarm1.mp3` (Alarma Clásica)
     - `alarm2.mp3` (Alarma Suave)
     - `alarm3.mp3` (Alarma Fuerte)
   - Ver `assets/sounds/README.md` para instrucciones detalladas
   - Los usuarios también podrán seleccionar sus propios archivos desde el móvil

3. **Crear development build**:
```bash
npx expo run:android
```

> **Nota**: No se puede usar `npx expo start` con Expo Go porque esta app requiere código nativo (Notifee).

## 📱 Uso

1. **Configurar alarma**:
   - Abre la app
   - Selecciona la hora deseada
   - **Elige tu sonido**:
     - **"Sonidos de la App"**: Selecciona uno de los 3 sonidos incluidos
     - **"Mis Archivos"**: Toca para buscar un archivo MP3 en tu móvil
   - El archivo se reproducirá completo y luego se repetirá en loop
   - Toca "Crear Alarma"

2. **Otorgar permisos**:
   - Android 12+: Permite "Alarmas y recordatorios" en configuración
   - Permite notificaciones
   - Permite acceso a archivos (si usas "Mis Archivos")

3. **Probar con pantalla bloqueada**:
   - Configura una alarma para 1-2 minutos
   - Bloquea el dispositivo
   - La pantalla se encenderá automáticamente cuando suene la alarma
   - El archivo de audio se reproducirá completo en loop

4. **Detener alarma**:
   - Mantén presionado el botón de emergencia rojo
   - Espera 5 segundos completos
   - La alarma se detendrá

## 🔧 Estructura del Proyecto

```
alarm-app/
├── App.tsx                           # Componente principal
├── app.json                          # Configuración Expo
├── package.json                      # Dependencias
├── plugins/
│   └── withAndroidAlarmManifest.js  # Config plugin para permisos Android
├── src/
│   ├── types/
│   │   └── index.ts                 # Definiciones de tipos
│   ├── services/
│   │   ├── AlarmService.ts          # Gestión de alarmas con Notifee
│   │   ├── SoundService.ts          # Reproducción de sonidos
│   │   └── StorageService.ts        # Persistencia de datos
│   └── components/
│       ├── AlarmSetup.tsx           # Pantalla de configuración
│       ├── AlarmScreen.tsx          # Pantalla cuando suena alarma
│       └── EmergencyButton.tsx      # Botón de emergencia (5 seg)
└── assets/
    └── sounds/
        └── alarm1.mp3               # Sonido de alarma (agregar manualmente)
```

## 🎵 Seleccionar Sonidos

La aplicación ofrece **dos formas de seleccionar sonidos** de alarma:

### Opción 1: 📱 Sonidos de la App (Incluidos)

La app incluye 3 sonidos de alarma predeterminados:
1. **Alarma Clásica** - Tono tradicional de alarma
2. **Alarma Suave** - Despertar tranquilo
3. **Alarma Fuerte** - Despertar intenso

Estos se pueden seleccionar directamente en la pestaña "Sonidos de la App".

**IMPORTANTE**: Los archivos MP3 deben estar en `assets/sounds/`. Ver `assets/sounds/README.md` para instrucciones de cómo agregarlos antes de compilar la app.

### Opción 2: 📂 Mis Archivos (Personalizados)

Puedes seleccionar cualquier archivo de audio desde tu móvil:

1. En la pantalla de configuración, cambia a la pestaña "Mis Archivos"
2. Toca "Seleccionar desde tus archivos"
3. Navega a la carpeta donde tienes tus archivos de audio:
   - Música (`/storage/emulated/0/Music/`)
   - Descargas (`/storage/emulated/0/Download/`)
   - Cualquier otra carpeta accesible
4. Selecciona el archivo MP3, M4A, WAV, etc.
5. El archivo aparecerá en la interfaz

**El archivo seleccionado (ya sea de la app o personalizado) se reproducirá completo y luego se repetirá en loop automáticamente.**

## ⚠️ Permisos Necesarios

La app solicita automáticamente estos permisos en Android:

- `USE_FULL_SCREEN_INTENT`: Mostrar pantalla completa sobre bloqueo
- `WAKE_LOCK`: Mantener dispositivo despierto
- `SCHEDULE_EXACT_ALARM`: Programar alarmas exactas
- `POST_NOTIFICATIONS`: Mostrar notificaciones
- `VIBRATE`: Vibración

## 🐛 Troubleshooting

### La alarma no suena con el móvil bloqueado

1. Verifica permisos en: Configuración → Apps → Alarm App → Permisos
2. Android 12+: Habilita "Alarmas y recordatorios"
3. Asegúrate de estar usando un dispositivo físico (no emulador)

### Error al construir

```bash
# Limpia el build
cd android
./gradlew clean
cd ..
npx expo run:android
```

### El sonido no se reproduce

1. Verifica que existe el archivo `assets/sounds/alarm1.mp3`
2. Revisa los logs: `npx react-native log-android`

## 📄 Licencia

MIT

## 👨‍💻 Desarrollo

Esta app usa:
- **Expo** (~52.0.0) para React Native
- **Notifee** para notificaciones full-screen Android
- **expo-av** para reproducción de audio
- **expo-keep-awake** para mantener pantalla encendida
- **react-native-date-picker** para selector de hora
