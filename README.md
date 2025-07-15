# red_tetris

# install if new repo :
npm init -y
npm install express socket.io

Pas utiliser "this" (sauf pour definir des sous-classes de 'Error').


Classes Player, Piece et Game.

Pas utiliser d'element "<TABLE />" en HTML.

INTERDIT :
    - Librairies de manipulation de DOM
    - Canvas
    - SVG

Tests unitaires doivent couvrir AU MOINS 70% des statements, functions et lignes, et au moins 50% des branches.

Chaque joueur doit avoir les pieces qui arrivent dans le meme ordre.

Quand un joueur clear une ligne, son adversaire recoit une ligne undestructible en bas de son terrain.

Terrain : 10 de large pour 20 de haut.

Un joueur peur voir le "spectre" du terrain de son adversaire : il voit que la hauteur max de chaque colonnes.

Quand une piece arrete de bouger, elle devient immobile seulement a la PROCHAINE FRAME, pour pouvoir ajuster au dernier moment.



Le serveur gere :
    - Gestion des joueurs et du jeu
    - Distribution des pieces
    - mise a jour du spectre

SPA

Joindre une partie :
    http://<server_name_or_ip>:<port>/<room>/<player_name>

room : nom de la partie a rejoindre


SERVEUR ASYNCHRONE

