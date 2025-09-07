# pasa_la_pagina_frontend

INFORMACION:

2. Formato de escritura de los commits:

        <tipo> [optional scope]:<descripcion>
        ^----^ ^--------------^ ^-----------^   
        |     |                 |
        |     |                 +-->Descripción del commit
        |     |    
        |     +---------------------->Sirve para especificar el alcance del commit. Por ejemplo: especificar el paquete que estamos modificando.
        |
        +----------------------------->Tipos de commits: feat, fix, docs, style, chore, build, refactor, test.

        - EJEMPLO
                - feat(Component): Se agrego nuevo funcionalidad.

3. Significado de cada tipo de commit:

        - feat: 
                - Se utiliza para indicar la adición de una nueva funcionalidad al software. Por ejemplo, «feat: Añadir funcionalidad de búsqueda».

        - fix: 
                - Este tipo se usa para commits que corrigen errores o problemas existentes en el código. Por ejemplo, «fix: Corregir error de validación de formulario».

        - doc: 
                - Reservado para commits relacionados con la documentación del proyecto, como actualizaciones en documentos o comentarios en el código. Por ejemplo, «docs: Actualizar la guía del usuario».

        - style: 
                - Se utiliza para cambios que afectan solo al estilo del código, como la formateación, el espaciado o la indentación. Por ejemplo, «style: Ajustar formateo del código».

        - chore: 
                - Este tipo de commit está destinado a tareas de mantenimiento general o actividades que no encajan en las categorías anteriores.Por ejemplo, «chore: Limpiar archivos no utilizados».

        - build: 
                - Cambios que afectan el sistema de compilación o dependencias externas.Por ejemplo: «build(Electron): Bump version 7 to 9».

        - ci: 
                - Cambios en nuestros archivos y scripts de configuración de integración continua.

        - perf: 
                - Un cambio de código que mejora el rendimiento.

        - refacto: 
                - Un cambio de código que no corrige un error ni agrega una característica.

        - test: 
                - Agregar pruebas faltantes o corregir pruebas existentes.


4. Formato de escritura: 

        snake_case: palabras separadas por barra baja en vez de espacios y 
        con la primera letra de cada palabra en minúscula. 

        Por ejemplo: mi_blog_de_desarrollo.

        Este tipo de convención seran utilizados para nombres de variables y funciones.

5. Trabajo con ramas:

### Crear una rama:

1. Para crear una nueva rama, usamos el siguiente comando:
    ```bash (esto quiere decire que se hace dentro de la termianl de bash)
    git checkout -b <nombre_rama>
    ```
    Donde `<nombre_rama>` debe seguir el formato de convención `snake_case`.

    Ejemplo:
    ```bash
    git checkout -b nueva_funcionalidad
    ```

### Subir una rama:

2. Para subir una rama al repositorio remoto, utiliza el comando:
    ```bash
    git push -u origin <nombre_rama>
    ```
    Esto subira la rama que tengas en tu repositorio local al repositorio remoto.

    Ejemplo:
    ```bash
    git push -u origin nueva_funcionalidad
    ```

### Hacer cambios y confirmarlos (commits):

3. Una vez que tengas cambios en tu rama, agregalos de la siguiete manera:
    ```bash
    git add .
    git commit -m "<tipo>(<scope>): <descripción>"
    ```
        Recorda que el -m simboliza el mensaje que hay que ponerle al commit, por lo cual es importante seguir la nomensclatura establecia en el README
    Ejemplo:
    ```bash
    git add .
    git commit -m "feat(Component): Se agrego nueva funcionalidad"
    ```

### Subir cambios al repositorio remoto:

4. Después de hacer commit, subi tus cambios con el comando:
    ```bash
    git push
    ```

### Trabajar con ramas existentes:

5. Para cambiar a una rama existente:
    ```bash
    git checkout <nombre_rama>
    ```

    Ejemplo:
    ```bash
    git checkout nueva_funcionalidad
    ```

### Actualizar la rama principal (main) desde el repositorio remoto:

6. Si estás en la rama principal y deseas actualizarla con los últimos cambios del repositorio remoto, usa:
    ```bash
    git pull origin main
    ```

### Fusionar (merge) una rama en la rama principal:

7. Si deseas fusionar los cambios de una rama a la rama principal:
   Primero en tu rama:
   ```bash
    git merge <nombre_rama>
    ```
    En este caso seria main el nombre de la rama, pero esto aplica a cualquier merge que se quiera hacer con cualquier rama

   Ahora, cambia a la rama principal:
    ```bash
    git checkout main
    ```

    Luego, fusiona la rama deseada en la principal:
    ```bash
    git merge <nombre_rama>
    ```

    Ejemplo:
    ```bash
    git merge nueva_funcionalidad
    ```

### Eliminar una rama:

8. Para eliminar una rama localmente después de haber fusionado los cambios:
    ```bash
    git branch -d <nombre_rama>
    ```

    Ejemplo:
    ```bash
    git branch -d nueva_funcionalidad
    ```

9. Para eliminar una rama en el repositorio remoto:
    ```bash
    git push origin --delete <nombre_rama>
    ```
# Guía de Estilos y Componentes
Este proyecto incluye una serie de componentes reutilizables que se encuentran en components/ui/ y un set de colores estándar definidos en constants/Colors.ts.

### Paleta de colores
        text: "#333333",              // Texto
        background: "#F8F1E5",        // Fondo general
        primary: "#3C7F72",           // Color principal (botones primarios y titulos)
        disabled_primary: "#ADBEBB",  // Versión deshabilitada del primario
        secondary: "#FFAF00",         // Color secundario (segundas opciones, resaltados, acentos)
        disabled_secondary: "#FFD77F",// Versión deshabilitada del secundario
        white: "#FFFFFF",             // Blanco para cards 
        cta: "#D96C06",               // Call To Action (acciones importantes)

## Componentes

### Alerta - `components/ui/AlertaCard.tsx`
Tarjeta de alerta/confirmación con título, descripción y botones.  
- Puede tener 1 o 2 botones, con labels personalizables.  
**Ejemplos:**
  // Dos botones
        <AlertCard
          title="Eliminar producto"
          description="¿Seguro que deseas eliminar este producto?"
          acceptLabel="Sí, eliminar"
          cancelLabel="No, volver"
          onAccept={() => console.log("Eliminar")}
          onCancel={() => console.log("Cancelar")}
        />

// Un botón
        <AlertCard
          title='Hola'
          description='Esta es una alerta'
          onAccept={() => alert('Alerta aceptada')}
        />

### Avatar - `components/ui/Avatar.tsx`
Círculo con la inicial del usuario.
**Ejemplos:**
        <Avatar name="Pedro" size={80} />

### Barra de tarea - `components/ui/BottomNavbar.tsx`
Barra de navegación inferior para acceso rápido a secciones principales. 
**Ejemplos:**
        <BottomNavbar />

### Tarjeta de conexión - `components/ui/ConnectCard.tsx`
Permite conectar con otro usuario y enviar un mensaje predeterminado.
**Ejemplos:**
        <ConnectCard
          username="Ana"
          publicationTitle="Zapatillas Nike"
          onSend={() => console.log("Mensaje enviado")}
          onCancel={() => console.log("Acción cancelada")}
        />

### Botones - `components/ui/Boton/`
// Primario - components/ui/Boton/Primary.tsx
Botón principal de la app
**Ejemplos:**
          <PrimaryButton title="Enviar" onPress={() => {}} />

//Secundario - components/ui/Boton/Secondary.tsx
Botón secundario con borde
**Ejemplos:**
        <SecondaryButton title="Cancelar" onPress={() => {}} />

### Tarjeta Producto - `components/ui/ProductCard.tsx`
Muestra un producto con imagen, título y descripción
**Ejemplos:**
        <ProductCard imageUrl='' title='Producto 1' description='Descripción del producto 1' />

### Tarjeta Reseña - `components/ui/ReviewCard.tsx`
Muestra una reseña de usuario
**Ejemplos:**
        <ReviewCard
          username='usuario123'
          headline='Gran producto'
          description='Me encantó este producto, lo recomiendo mucho.'
          date='2023-10-01'
        />


      

        
        
