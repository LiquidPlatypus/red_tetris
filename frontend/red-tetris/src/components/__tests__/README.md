# TEST

Trucs important à retenir pour les tests.

---
## Lancer les test

```bash
  npm run test
```

## Voir le pourcentage de code couvert par les tests

```bash
  npm run coverage
```
---
### wrapper : Représente votre composant monté, avec plein de méthodes utiles :

```.find() :``` Trouve un élément<br />
```.text() :``` Récupère le texte<br />
```.emitted() :``` Récupère les événements émis<br />
```.trigger() :``` Simule des événements

### Assertions courantes :

```.toBe() :``` Égalité stricte<br />
```.toBeTruthy() :``` Vérifie que c'est "vrai" (pas null, undefined, false, etc.)<br />
```.toContain() :``` Vérifie qu'un tableau/string contient quelque chose<br />
```.toHaveLength() :``` Vérifie la longueur<br />