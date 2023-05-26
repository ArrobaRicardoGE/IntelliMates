# IntelliMates Wiki

![IntelliMates logo](https://github.com/ArrobaRicardoGE/IntelliMates/blob/main/wiki/assets/LogoClean.png)

## Tabla de contenidos

-   [Introducción](#introducción)
-   [Requerimientos](#requerimientos)
-   [Diagramas entidad relación](#diagramas-entidad-relación)
-   [Arquitectura](#arquitectura)
-   [Guía de desarrollo](#guía-de-desarrollo)

## Introducción

IntelliMates es una plataforma de aprendizaje para estudiantes de educación básica que tiene como objetivo enseñar principios de programación a través de la implementación de algoritmos para agentes inteligentes de videojuegos populares. Se utiliza programación en lenguajes básicos (i.e. Python) para programar videojuegos clásicos como "Snake Game" y "Pong". Los estudiantes pueden programar su estrategia y ponerla a competir con la de otros estudiantes.

## Requerimientos

El documento de especificación de requerimientos está disponible en el siguiente enlace: [Documento de especificación de requerimientos](https://docs.google.com/document/d/1kN52M0ebcNAPhfi-MnsBNpnx9AV0F9dXUCSxN2_M2Rs/edit?usp=sharing).

## Diagramas entidad relación

Actualmente, IntelliMates es una plataforma simple que cuenta con pocas entidades, como se muestra en el siguiente diagrama:

![Diagrama entidad relación de IntelliMates](https://github.com/ArrobaRicardoGE/IntelliMates/blob/main/wiki/assets/IntelliMates_ER.drawio.png)

## Arquitectura

La plataforma está compuesta por los siguientes módulos:

-   **Página de aterrizaje**: Información general de la plataforma.
-   **Manejo de usuarios**: Creación de cuentas e inicio de sesión.
-   **Sandbox**: Entorno para la implementación de algoritmos para agentes inteligentes. Cuenta con el editor de código y entorno de pruebas.
-   **Ejecutor de código**: Módulo que recibe y ejecuta código en un entorno seguro, para producir como salida la simulación del algoritmo ejecutado.

La interacción entre los módulos se puede apreciar en el siguiente diagrama:

![Diagrama de la arquitectura de IntelliMates](https://github.com/ArrobaRicardoGE/IntelliMates/blob/main/wiki/assets/IntelliMates_AD.drawio.png)

## Guía de desarrollo

### Manejo de base de datos

Para crear la base de datos, sigue los siguientes pasos:

1. Descarga [sqlite3](https://www.sqlite.org/2023/sqlite-tools-win32-x86-3420000.zip). Necesitarás copiar el ejecutable en tu directorio de desarrollo.
2. Crea el archivo de base de datos: `sqlite.exe intellimates.db`.
3. Dentro de la base de datos, crea la tabla ejecutando `.read database/gen.sql`.
4. Popula la base de datos corriendo `.read database/populate.dev.sql`.
5. Clona la base de datos para testing corriendo `.clone intellimates.dev.db`.
6. Verifica que todo funciona como debería ejecutando el test `npm test -- database.test.js`.
