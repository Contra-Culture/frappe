# frappe

frappe is a ***fr***ontend ***app***lications framework.

---
## Philosophy
---
## Main Concepts

### Univ *(universe)*
Univ organizes whole system of one or multiple apps and organizes them.

### App *(application)*
An app defines layout, consists of several flows and screens, and organizes them.

#### **Layout**
A layout is a specification with requirements to all the app's screens.

#### **Screen**
A screen represents a particular not very complex dialogue. A screen consists of a number of widgets and organizes them.

##### **Widget**

A widget is a dialogue tool to perform some business-related operation. In a dialogue metaphor, widgets are formal sentence generators.

#### **Flow**

A flow represents a complex dialogue, which consists of several screens and direct transferring between them. In other words, a user flows by the flow.


---
## Getting Started

### Installing

### Code organization

### Your first frapplication


---
## Known Issues

---
## Future plans


---
## Development

### Style Guide

1. Keep diff as small as possible:
   1. avoid one-liners
   2. use one line per object property, import/export name, etc.
2. Prefer declarative approach:
   1. use eDSL constructors to construct a correct business need fulfilling function
3. Prefer Golang-like error-values over exceptions
4. Use `__<name>` pattern for the functions wich are using only together with `.bind()`
