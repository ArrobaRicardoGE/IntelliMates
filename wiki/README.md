# IntelliMates Wiki

![IntelliMates logo](https://placehold.co/600x400)

## Tabla de contenidos
* [Introducción](#introducción) 
* [Requerimientos](#requerimientos)
* [Diagramas entidad relación](#diagramas-entidad-relación)
* [Arquitectura](#arquitectura)

## Introducción
IntelliMates es una plataforma de aprendizaje para estudiantes de educación básica que tiene como objetivo enseñar principios de programación a través de la implementación de algoritmos para agentes inteligentes de videojuegos populares. Se utiliza programación en lenguajes básicos (i.e. Python) para programar videojuegos clásicos como "Snake Game" y "Pong". Los estudiantes pueden programar su estrategia y ponerla a competir con la de otros estudiantes.

## Requerimientos
El documento de especificación de requerimientos está disponible en el siguiente enlace: [Documento de especificación de requerimientos](https://docs.google.com/document/d/1kN52M0ebcNAPhfi-MnsBNpnx9AV0F9dXUCSxN2_M2Rs/edit?usp=sharing).

## Diagramas entidad relación
Actualmente, IntelliMates es una plataforma simple que cuenta con pocas entidades, como se muestra en el siguiente diagrama:

![Diagrama entidad relación de IntelliMates](https://placehold.co/600x400)


## Arquitectura
La plataforma está compuesta por los siguientes módulos:
* __Página de aterrizaje__: Información general de la plataforma.
* __Manejo de usuarios__: Creación de cuentas e inicio de sesión.
* __Sandbox__: Entorno para la implementación de algoritmos para agentes inteligentes. Cuenta con el editor de código y entorno de pruebas. 
* __Ejecutor de código__: Módulo que recibe y ejecuta código en un entorno seguro, para producir como salida la simulación del algoritmo ejecutado. 

La interacción entre los módulos se puede apreciar en el siguiente diagrama:

![Diagrama de la arquitectura de IntelliMates](https://placehold.co/600x400)