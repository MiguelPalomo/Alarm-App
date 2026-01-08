# INSTRUCCIONES IMPORTANTES

Los archivos `alarm1.mp3`, `alarm2.mp3`, y `alarm3.mp3` deben ser archivos MP3 **reales** antes de poder compilar la aplicación.

**NO PUEDO GENERAR ARCHIVOS DE AUDIO**, así que necesitas agregarlos manualmente.

## Crear archivos de sonido válidos rápidamente:

### Opción más rápida: Descargar un tono simple

1. Ve a: https://freesound.org/search/?q=alarm
2. Busca 3 alarmas diferentes
3. Descárgalas como MP3
4. Renómbralas a `alarm1.mp3`, `alarm2.mp3`, `alarm3.mp3`
5. Colócalas en esta carpeta

### Opción alternativa: Generar tonos

1. Ve a: https://www.szynalski.com/tone-generator/
2. Genera 3 tonos diferentes:
   - **880 Hz** → Guarda como alarm1.mp3
   - **440 Hz** → Guarda como alarm2.mp3
   - **1320 Hz** → Guarda como alarm3.mp3

### Opción temporal: Un solo archivo duplicado

Si solo quieres probar la app rápido, puedes usar el mismo archivo 3 veces:

1. Descarga cualquier MP3 corto
2. Cópialo 3 veces con los nombres: `alarm1.mp3`, `alarm2.mp3`, `alarm3.mp3`

## Verificar que los archivos sean válidos

Los archivos deben:
- Ser archivos MP3 reales (no archivos de texto)
- Tener al menos  algunos bytes
- Ser reproducibles en cualquier reproductor de audio

Una vez que agregues los 3 archivos MP3, puedes ejecutar:
```bash
npx expo run:android
```
